-- KrimeAI Platform - PostgreSQL Schema
-- Contains Official Karnataka Police Tables and Application Extension Tables

-- ==========================================
-- EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "postgis"; -- (Optional) For spatial data if supported

-- ==========================================
-- OFFICIAL TABLES (CCTNS COMPLIANT)
-- ==========================================

-- 1. Police Stations
CREATE TABLE police_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    jurisdiction TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Audit fields (Present on all tables)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Officers
CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    rank VARCHAR(50) NOT NULL,
    station_id UUID NOT NULL REFERENCES police_stations(id) ON DELETE RESTRICT,
    phone VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. FIRs (First Information Reports)
CREATE TABLE firs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fir_number VARCHAR(50) NOT NULL UNIQUE,
    crime_number VARCHAR(50) UNIQUE,
    station_id UUID NOT NULL REFERENCES police_stations(id) ON DELETE RESTRICT,
    investigating_officer_id UUID REFERENCES officers(id) ON DELETE RESTRICT,
    
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    description TEXT,
    
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_fir_status CHECK (status IN ('REGISTERED', 'UNDER_INVESTIGATION', 'CHARGE_SHEETED', 'CLOSED', 'CANCELLED'))
);

-- 4. Persons (Master Table for Graph Deduplication)
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    alias VARCHAR(100),
    dob DATE,
    gender VARCHAR(10),
    aadhar_number VARCHAR(20) UNIQUE,
    photograph_url VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_person_gender CHECK (gender IN ('M', 'F', 'OTHER'))
);

-- 5. FIR <-> Persons Junctions
CREATE TABLE fir_accused (
    fir_id UUID REFERENCES firs(id) ON DELETE RESTRICT,
    person_id UUID REFERENCES persons(id) ON DELETE RESTRICT,
    arrest_status VARCHAR(50) DEFAULT 'WANTED',
    arrest_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fir_id, person_id)
);

CREATE TABLE fir_victims (
    fir_id UUID REFERENCES firs(id) ON DELETE RESTRICT,
    person_id UUID REFERENCES persons(id) ON DELETE RESTRICT,
    injury_severity VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fir_id, person_id)
);

CREATE TABLE fir_complainants (
    fir_id UUID REFERENCES firs(id) ON DELETE RESTRICT,
    person_id UUID REFERENCES persons(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fir_id, person_id)
);

CREATE TABLE fir_witnesses (
    fir_id UUID REFERENCES firs(id) ON DELETE RESTRICT,
    person_id UUID REFERENCES persons(id) ON DELETE RESTRICT,
    statement_recorded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fir_id, person_id)
);

-- 6. Shared Entities (Graph Nodes)
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    pincode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE phones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    imei VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50), -- E.g., GANG, COMPANY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Shared Junctions (Graph Edges)
CREATE TABLE person_addresses (
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    address_id UUID REFERENCES addresses(id) ON DELETE CASCADE,
    address_type VARCHAR(50), -- PERMANENT, TEMPORARY
    PRIMARY KEY (person_id, address_id)
);

CREATE TABLE person_phones (
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    phone_id UUID REFERENCES phones(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (person_id, phone_id)
);

CREATE TABLE person_vehicles (
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    relation VARCHAR(50), -- OWNER, DRIVER
    PRIMARY KEY (person_id, vehicle_id)
);

CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (organization_id, person_id)
);

-- 8. Legal and Classification Masters
CREATE TABLE crime_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE fir_categories (
    fir_id UUID REFERENCES firs(id) ON DELETE CASCADE,
    category_id UUID REFERENCES crime_categories(id) ON DELETE RESTRICT,
    PRIMARY KEY (fir_id, category_id)
);

CREATE TABLE acts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    act_id UUID REFERENCES acts(id) ON DELETE CASCADE,
    section_code VARCHAR(20) NOT NULL,
    description TEXT,
    UNIQUE (act_id, section_code)
);

CREATE TABLE fir_sections (
    fir_id UUID REFERENCES firs(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE RESTRICT,
    PRIMARY KEY (fir_id, section_id)
);

-- 9. Evidence & Court
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fir_id UUID REFERENCES firs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    type VARCHAR(50), -- WEAPON, DIGITAL, BIOLOGICAL
    collection_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE court_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fir_id UUID REFERENCES firs(id) ON DELETE RESTRICT,
    court_name VARCHAR(150),
    case_number VARCHAR(100),
    status VARCHAR(50),
    next_hearing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- APPLICATION EXTENSION TABLES
-- ==========================================

-- Users & Auth
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id UUID REFERENCES officers(id) ON DELETE SET NULL, -- Null if not an officer (e.g. system admin)
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Graph Acceleration Tables (Materialized views concept, updated by triggers/app layer)
CREATE TABLE graph_nodes (
    node_id VARCHAR(100) PRIMARY KEY, -- Usually UUID but typed as string for flexibility
    type VARCHAR(50) NOT NULL, -- PERSON, FIR, VEHICLE, PHONE
    label VARCHAR(255),
    properties JSONB
);

CREATE TABLE graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(100) REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
    target_id VARCHAR(100) REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.0
);

-- AI Chat & History
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES
-- ==========================================

-- B-Tree for exact lookups
CREATE INDEX idx_firs_fir_number ON firs(fir_number);
CREATE INDEX idx_officers_badge_id ON officers(badge_id);
CREATE INDEX idx_persons_aadhar ON persons(aadhar_number);
CREATE INDEX idx_phones_number ON phones(phone_number);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);

-- Composite for Analytics
CREATE INDEX idx_firs_analytics ON firs(station_id, status, incident_date);

-- Trigram for fuzzy search
CREATE INDEX idx_persons_name_trgm ON persons USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_persons_alias_trgm ON persons USING gin (alias gin_trgm_ops);

-- Geospatial indexing (if postgis enabled, otherwise skip)
-- CREATE INDEX idx_firs_location ON firs USING GIST (ST_MakePoint(longitude, latitude));
