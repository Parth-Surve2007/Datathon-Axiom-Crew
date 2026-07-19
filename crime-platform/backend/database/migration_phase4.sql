-- KrimeAI Platform - Phase 4 Additive Migration
-- New tables required by the business API layer
-- Run AFTER the base schema (schema.sql)

-- ==========================================
-- INVESTIGATION TEAMS
-- ==========================================

CREATE TABLE IF NOT EXISTS investigation_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    lead_officer_id UUID REFERENCES officers(id) ON DELETE RESTRICT,
    fir_id UUID REFERENCES firs(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS investigation_team_members (
    team_id UUID REFERENCES investigation_teams(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES officers(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, officer_id)
);

-- ==========================================
-- TIMELINE EVENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fir_id UUID NOT NULL REFERENCES firs(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_timeline_event_type CHECK (event_type IN (
        'INCIDENT', 'FIR_REGISTERED', 'ARREST', 'BAIL_GRANTED',
        'CHARGESHEET_FILED', 'COURT_HEARING', 'EVIDENCE_COLLECTED',
        'WITNESS_STATEMENT', 'INVESTIGATION_UPDATE', 'STATUS_CHANGE', 'OTHER'
    ))
);

-- ==========================================
-- CHARGESHEETS
-- ==========================================

CREATE TABLE IF NOT EXISTS chargesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fir_id UUID NOT NULL REFERENCES firs(id) ON DELETE RESTRICT,
    court_case_id UUID REFERENCES court_cases(id) ON DELETE SET NULL,
    filed_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_chargesheet_status CHECK (status IN ('DRAFT', 'FILED', 'ACCEPTED', 'REJECTED'))
);

-- ==========================================
-- DOCUMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fir_id UUID REFERENCES firs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50),
    file_url VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_document_type CHECK (doc_type IN (
        'FIR_COPY', 'STATEMENT', 'PANCHNAMA', 'POST_MORTEM',
        'MEDICAL_REPORT', 'FORENSIC_REPORT', 'COURT_ORDER', 'CHARGESHEET', 'OTHER'
    ))
);

-- ==========================================
-- CRIME TYPES (sub-categories)
-- ==========================================

CREATE TABLE IF NOT EXISTS crime_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES crime_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (category_id, name)
);

-- ==========================================
-- CRIME STATUSES (workflow states — lookup table)
-- ==========================================

CREATE TABLE IF NOT EXISTS crime_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    is_terminal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default crime statuses
INSERT INTO crime_statuses (code, label, is_terminal) VALUES
    ('REGISTERED',          'Registered',           FALSE),
    ('UNDER_INVESTIGATION', 'Under Investigation',   FALSE),
    ('CHARGE_SHEETED',      'Charge Sheeted',        FALSE),
    ('CLOSED',              'Closed',                TRUE),
    ('CANCELLED',           'Cancelled',             TRUE)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- PASSWORD HASH COLUMN (if not added in Phase 2)
-- ==========================================

-- Ensure password_hash is on users (idempotent)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ==========================================
-- INDEXES FOR NEW TABLES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_investigation_teams_fir ON investigation_teams(fir_id);
CREATE INDEX IF NOT EXISTS idx_investigation_teams_lead ON investigation_teams(lead_officer_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_fir ON timeline_events(fir_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_chargesheets_fir ON chargesheets(fir_id);
CREATE INDEX IF NOT EXISTS idx_documents_fir ON documents(fir_id);
CREATE INDEX IF NOT EXISTS idx_crime_types_category ON crime_types(category_id);
