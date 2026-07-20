-- Official Karnataka Police Crime Intelligence Database Schema
-- Strict Compliance with Canonical Karnataka Police ER Diagram
-- Compatible with Zoho Catalyst Data Store / MySQL

-- --------------------------------------------------------
-- Table: State
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS State (
    StateID INT AUTO_INCREMENT PRIMARY KEY,
    StateName VARCHAR(100) NOT NULL,
    NationalityID INT NULL,
    Active BIT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: District
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS District (
    DistrictID INT AUTO_INCREMENT PRIMARY KEY,
    DistrictName VARCHAR(100) NOT NULL,
    StateID INT NOT NULL,
    Active BIT(1) DEFAULT 1,
    FOREIGN KEY (StateID) REFERENCES State(StateID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: UnitType
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS UnitType (
    UnitTypeID INT AUTO_INCREMENT PRIMARY KEY,
    UnitTypeName VARCHAR(100) NOT NULL,
    CityDistState VARCHAR(100) NULL,
    Hierarchy INT NULL,
    Active BIT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Unit (Police Stations / Units)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Unit (
    UnitID INT AUTO_INCREMENT PRIMARY KEY,
    UnitName VARCHAR(150) NOT NULL,
    TypeID INT NOT NULL,
    ParentUnit INT NULL,
    NationalityID INT NULL,
    StateID INT NOT NULL,
    DistrictID INT NOT NULL,
    Active BIT(1) DEFAULT 1,
    FOREIGN KEY (TypeID) REFERENCES UnitType(UnitTypeID) ON DELETE RESTRICT,
    FOREIGN KEY (ParentUnit) REFERENCES Unit(UnitID) ON DELETE SET NULL,
    FOREIGN KEY (StateID) REFERENCES State(StateID) ON DELETE CASCADE,
    FOREIGN KEY (DistrictID) REFERENCES District(DistrictID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Rank
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Rank (
    RankID INT AUTO_INCREMENT PRIMARY KEY,
    RankName VARCHAR(100) NOT NULL,
    Hierarchy INT NULL,
    Active BIT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Designation
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Designation (
    DesignationID INT AUTO_INCREMENT PRIMARY KEY,
    DesignationName VARCHAR(100) NOT NULL,
    Active BIT(1) DEFAULT 1,
    SortOrder INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Employee (Police Officers & Personnel)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Employee (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    DistrictID INT NOT NULL,
    UnitID INT NOT NULL,
    RankID INT NOT NULL,
    DesignationID INT NOT NULL,
    KGID VARCHAR(50) NULL,
    FirstName VARCHAR(150) NOT NULL,
    EmployeeDOB DATE NULL,
    GenderID INT NULL,
    BloodGroupID INT NULL,
    PhysicallyChallenged BIT(1) DEFAULT 0,
    AppointmentDate DATE NULL,
    FOREIGN KEY (DistrictID) REFERENCES District(DistrictID) ON DELETE CASCADE,
    FOREIGN KEY (UnitID) REFERENCES Unit(UnitID) ON DELETE CASCADE,
    FOREIGN KEY (RankID) REFERENCES Rank(RankID) ON DELETE RESTRICT,
    FOREIGN KEY (DesignationID) REFERENCES Designation(DesignationID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CaseCategory
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CaseCategory (
    CaseCategoryID INT AUTO_INCREMENT PRIMARY KEY,
    LookupValue VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: GravityOffence
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS GravityOffence (
    GravityOffenceID INT AUTO_INCREMENT PRIMARY KEY,
    LookupValue VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CrimeHead
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CrimeHead (
    CrimeHeadID INT AUTO_INCREMENT PRIMARY KEY,
    CrimeGroupName VARCHAR(150) NOT NULL,
    Active BIT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CrimeSubHead
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CrimeSubHead (
    CrimeSubHeadID INT AUTO_INCREMENT PRIMARY KEY,
    CrimeHeadID INT NOT NULL,
    CrimeHeadName VARCHAR(150) NOT NULL,
    SeqID INT NULL,
    FOREIGN KEY (CrimeHeadID) REFERENCES CrimeHead(CrimeHeadID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Act
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Act (
    ActCode VARCHAR(50) PRIMARY KEY,
    ActDescription VARCHAR(255) NOT NULL,
    ShortName VARCHAR(100) NULL,
    Active BIT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Section
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Section (
    ActCode VARCHAR(50) NOT NULL,
    SectionCode VARCHAR(50) NOT NULL,
    SectionDescription VARCHAR(255) NULL,
    Active BIT(1) DEFAULT 1,
    PRIMARY KEY (ActCode, SectionCode),
    FOREIGN KEY (ActCode) REFERENCES Act(ActCode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CrimeHeadActSection
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CrimeHeadActSection (
    CrimeHeadID INT NOT NULL,
    ActCode VARCHAR(50) NOT NULL,
    SectionCode VARCHAR(50) NOT NULL,
    PRIMARY KEY (CrimeHeadID, ActCode, SectionCode),
    FOREIGN KEY (CrimeHeadID) REFERENCES CrimeHead(CrimeHeadID) ON DELETE CASCADE,
    FOREIGN KEY (ActCode) REFERENCES Act(ActCode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Court
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Court (
    CourtID INT AUTO_INCREMENT PRIMARY KEY,
    CourtName VARCHAR(200) NOT NULL,
    DistrictID INT NOT NULL,
    StateID INT NOT NULL,
    Active BIT(1) DEFAULT 1,
    FOREIGN KEY (DistrictID) REFERENCES District(DistrictID) ON DELETE CASCADE,
    FOREIGN KEY (StateID) REFERENCES State(StateID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CaseStatusMaster
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CaseStatusMaster (
    CaseStatusID INT AUTO_INCREMENT PRIMARY KEY,
    CaseStatusName VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CasteMaster
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CasteMaster (
    caste_master_id INT AUTO_INCREMENT PRIMARY KEY,
    caste_master_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: ReligionMaster
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ReligionMaster (
    ReligionID INT AUTO_INCREMENT PRIMARY KEY,
    ReligionName VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: OccupationMaster
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS OccupationMaster (
    OccupationID INT AUTO_INCREMENT PRIMARY KEY,
    OccupationName VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: CaseMaster (Core FIR record)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CaseMaster (
    CaseMasterID INT AUTO_INCREMENT PRIMARY KEY,
    CrimeNo VARCHAR(100) NOT NULL,
    CaseNo VARCHAR(100) NOT NULL,
    CrimeRegisteredDate DATE NOT NULL,
    PolicePersonID INT NOT NULL,
    PoliceStationID INT NOT NULL,
    CaseCategoryID INT NOT NULL,
    GravityOffenceID INT NOT NULL,
    CrimeMajorHeadID INT NOT NULL,
    CrimeMinorHeadID INT NOT NULL,
    CaseStatusID INT NOT NULL,
    CourtID INT NOT NULL,
    IncidentFromDate DATETIME NULL,
    IncidentToDate DATETIME NULL,
    InfoReceivedPSDate DATETIME NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    BriefFacts TEXT NULL,
    FOREIGN KEY (PolicePersonID) REFERENCES Employee(EmployeeID) ON DELETE RESTRICT,
    FOREIGN KEY (PoliceStationID) REFERENCES Unit(UnitID) ON DELETE RESTRICT,
    FOREIGN KEY (CaseCategoryID) REFERENCES CaseCategory(CaseCategoryID) ON DELETE RESTRICT,
    FOREIGN KEY (GravityOffenceID) REFERENCES GravityOffence(GravityOffenceID) ON DELETE RESTRICT,
    FOREIGN KEY (CrimeMajorHeadID) REFERENCES CrimeHead(CrimeHeadID) ON DELETE RESTRICT,
    FOREIGN KEY (CrimeMinorHeadID) REFERENCES CrimeSubHead(CrimeSubHeadID) ON DELETE RESTRICT,
    FOREIGN KEY (CaseStatusID) REFERENCES CaseStatusMaster(CaseStatusID) ON DELETE RESTRICT,
    FOREIGN KEY (CourtID) REFERENCES Court(CourtID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Inv_OccuranceTime (1:1 with CaseMaster)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Inv_OccuranceTime (
    CaseMasterID INT PRIMARY KEY,
    IncidentFromDate DATETIME NULL,
    IncidentToDate DATETIME NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    PlaceOfOccurrence VARCHAR(255) NULL,
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: ComplainantDetails
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ComplainantDetails (
    ComplainantID INT AUTO_INCREMENT PRIMARY KEY,
    CaseMasterID INT NOT NULL,
    ComplainantName VARCHAR(150) NOT NULL,
    AgeYear INT NULL,
    OccupationID INT NULL,
    ReligionID INT NULL,
    CasteID INT NULL,
    GenderID INT NULL,
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE,
    FOREIGN KEY (OccupationID) REFERENCES OccupationMaster(OccupationID) ON DELETE SET NULL,
    FOREIGN KEY (ReligionID) REFERENCES ReligionMaster(ReligionID) ON DELETE SET NULL,
    FOREIGN KEY (CasteID) REFERENCES CasteMaster(caste_master_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: ActSectionAssociation
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ActSectionAssociation (
    CaseMasterID INT NOT NULL,
    ActID VARCHAR(50) NOT NULL,
    SectionID VARCHAR(50) NOT NULL,
    ActOrderID INT NULL,
    SectionOrderID INT NULL,
    PRIMARY KEY (CaseMasterID, ActID, SectionID),
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE,
    FOREIGN KEY (ActID) REFERENCES Act(ActCode) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Victim
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Victim (
    VictimMasterID INT AUTO_INCREMENT PRIMARY KEY,
    CaseMasterID INT NOT NULL,
    VictimName VARCHAR(150) NOT NULL,
    AgeYear INT NULL,
    GenderID INT NULL,
    VictimPolice VARCHAR(50) NULL,
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: Accused
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Accused (
    AccusedMasterID INT AUTO_INCREMENT PRIMARY KEY,
    CaseMasterID INT NOT NULL,
    AccusedName VARCHAR(150) NOT NULL,
    AgeYear INT NULL,
    GenderID INT NULL,
    PersonID VARCHAR(50) NULL,
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: ArrestSurrender
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ArrestSurrender (
    ArrestSurrenderID INT AUTO_INCREMENT PRIMARY KEY,
    CaseMasterID INT NOT NULL,
    ArrestSurrenderTypeID INT NULL,
    ArrestSurrenderDate DATE NULL,
    ArrestSurrenderStateId INT NULL,
    ArrestSurrenderDistrictId INT NULL,
    PoliceStationID INT NULL,
    IOID INT NULL,
    CourtID INT NULL,
    AccusedMasterID INT NULL,
    IsAccused BIT(1) DEFAULT 0,
    IsComplainantAccused BIT(1) DEFAULT 0,
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE,
    FOREIGN KEY (ArrestSurrenderStateId) REFERENCES State(StateID) ON DELETE SET NULL,
    FOREIGN KEY (ArrestSurrenderDistrictId) REFERENCES District(DistrictID) ON DELETE SET NULL,
    FOREIGN KEY (PoliceStationID) REFERENCES Unit(UnitID) ON DELETE SET NULL,
    FOREIGN KEY (IOID) REFERENCES Employee(EmployeeID) ON DELETE SET NULL,
    FOREIGN KEY (CourtID) REFERENCES Court(CourtID) ON DELETE SET NULL,
    FOREIGN KEY (AccusedMasterID) REFERENCES Accused(AccusedMasterID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: inv_arrestsurrenderaccused (Junction table)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_arrestsurrenderaccused (
    ArrestSurrenderID INT NOT NULL,
    AccusedMasterID INT NOT NULL,
    PRIMARY KEY (ArrestSurrenderID, AccusedMasterID),
    FOREIGN KEY (ArrestSurrenderID) REFERENCES ArrestSurrender(ArrestSurrenderID) ON DELETE CASCADE,
    FOREIGN KEY (AccusedMasterID) REFERENCES Accused(AccusedMasterID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: ChargesheetDetails
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ChargesheetDetails (
    CSID INT AUTO_INCREMENT PRIMARY KEY,
    CaseMasterID INT NOT NULL,
    csdate DATETIME NOT NULL,
    cstype CHAR(1) NULL,
    PolicePersonID INT NOT NULL,
    FOREIGN KEY (CaseMasterID) REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE,
    FOREIGN KEY (PolicePersonID) REFERENCES Employee(EmployeeID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
