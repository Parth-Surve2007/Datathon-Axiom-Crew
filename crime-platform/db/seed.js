/**
 * Seed Data Generator for Karnataka Police Crime Intelligence Database
 * Generates schema-compliant seed SQL DDL/DML matching the canonical Karnataka Police ER Diagram.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function sqlStr(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function pad(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSeedData() {
  console.log('Generating seed data for Karnataka Police schema...');

  const statements = [];
  const addStmt = (sql) => statements.push(sql);

  // 1. State
  addStmt(`INSERT INTO State (StateID, StateName, NationalityID, Active) VALUES (1, 'Karnataka', 1, 1);`);

  // 2. District
  const districts = [
    { id: 1, name: 'Bengaluru City', code: 'BC' },
    { id: 2, name: 'Mysuru City', code: 'MC' },
    { id: 3, name: 'Mangaluru City', code: 'MGC' },
    { id: 4, name: 'Hubballi-Dharwad', code: 'HD' },
    { id: 5, name: 'Belagavi', code: 'BG' },
    { id: 6, name: 'Kalaburagi', code: 'KL' }
  ];
  for (const d of districts) {
    addStmt(`INSERT INTO District (DistrictID, DistrictName, StateID, Active) VALUES (${d.id}, ${sqlStr(d.name)}, 1, 1);`);
  }

  // 3. UnitType
  const unitTypes = [
    { id: 1, name: 'Police Station', level: 'District' },
    { id: 2, name: 'Circle Office', level: 'District' },
    { id: 3, name: 'Commissionerate', level: 'City' }
  ];
  for (const ut of unitTypes) {
    addStmt(`INSERT INTO UnitType (UnitTypeID, UnitTypeName, CityDistState, Hierarchy, Active) VALUES (${ut.id}, ${sqlStr(ut.name)}, ${sqlStr(ut.level)}, 1, 1);`);
  }

  // 4. Unit (18 Police Stations)
  const units = [
    { id: 1, distId: 1, typeId: 1, name: 'Indiranagar Police Station', lat: 12.9784, lng: 77.6408 },
    { id: 2, distId: 1, typeId: 1, name: 'Koramangala Police Station', lat: 12.9352, lng: 77.6245 },
    { id: 3, distId: 1, typeId: 1, name: 'Whitefield Police Station', lat: 12.9698, lng: 77.7499 },
    { id: 4, distId: 1, typeId: 1, name: 'Jayanagar Police Station', lat: 12.9250, lng: 77.5938 },
    { id: 5, distId: 1, typeId: 1, name: 'Malleshwaram Police Station', lat: 13.0031, lng: 77.5643 },
    { id: 6, distId: 2, typeId: 1, name: 'Devaraja Police Station', lat: 12.3052, lng: 76.6552 },
    { id: 7, distId: 2, typeId: 1, name: 'Lashkar Police Station', lat: 12.3120, lng: 76.6580 },
    { id: 8, distId: 2, typeId: 1, name: 'Vijayanagar Police Station Mysuru', lat: 12.3350, lng: 76.6180 },
    { id: 9, distId: 3, typeId: 1, name: 'Kadri Police Station', lat: 12.8870, lng: 74.8560 },
    { id: 10, distId: 3, typeId: 1, name: 'Pandeshwar Police Station', lat: 12.8610, lng: 74.8390 },
    { id: 11, distId: 3, typeId: 1, name: 'Urwa Police Station', lat: 12.8890, lng: 74.8310 },
    { id: 12, distId: 4, typeId: 1, name: 'Suburban Police Station Hubballi', lat: 15.3520, lng: 75.1410 },
    { id: 13, distId: 4, typeId: 1, name: 'Vidyanagar Police Station Hubballi', lat: 15.3640, lng: 75.1220 },
    { id: 14, distId: 4, typeId: 1, name: 'Suburban Police Station Dharwad', lat: 15.4580, lng: 75.0080 },
    { id: 15, distId: 5, typeId: 1, name: 'Camp Police Station Belagavi', lat: 15.8560, lng: 74.5020 },
    { id: 16, distId: 5, typeId: 1, name: 'Tilakwadi Police Station', lat: 15.8440, lng: 74.5080 },
    { id: 17, distId: 5, typeId: 1, name: 'Shahapur Police Station', lat: 15.8360, lng: 74.5150 },
    { id: 18, distId: 6, typeId: 1, name: 'Station Bazar Police Station', lat: 17.3290, lng: 76.8340 }
  ];
  for (const u of units) {
    addStmt(`INSERT INTO Unit (UnitID, UnitName, TypeID, ParentUnit, NationalityID, StateID, DistrictID, Active) VALUES (${u.id}, ${sqlStr(u.name)}, ${u.typeId}, NULL, 1, 1, ${u.distId}, 1);`);
  }

  // 5. Rank
  const ranks = [
    { id: 1, name: 'Police Constable', hierarchy: 1 },
    { id: 2, name: 'Head Constable', hierarchy: 2 },
    { id: 3, name: 'Assistant Sub-Inspector', hierarchy: 3 },
    { id: 4, name: 'Police Sub-Inspector', hierarchy: 4 },
    { id: 5, name: 'Police Inspector', hierarchy: 5 },
    { id: 6, name: 'Deputy Superintendent of Police', hierarchy: 6 }
  ];
  for (const r of ranks) {
    addStmt(`INSERT INTO Rank (RankID, RankName, Hierarchy, Active) VALUES (${r.id}, ${sqlStr(r.name)}, ${r.hierarchy}, 1);`);
  }

  // 6. Designation
  const designations = [
    { id: 1, name: 'Station House Officer', order: 1 },
    { id: 2, name: 'Investigating Officer', order: 2 },
    { id: 3, name: 'Crime Branch Officer', order: 3 },
    { id: 4, name: 'Beat Officer', order: 4 }
  ];
  for (const des of designations) {
    addStmt(`INSERT INTO Designation (DesignationID, DesignationName, Active, SortOrder) VALUES (${des.id}, ${sqlStr(des.name)}, 1, ${des.order});`);
  }

  // 7. Employee
  const firstNames = ['Ramesh', 'Suresh', 'Anil', 'Vijay', 'Mahesh', 'Santosh', 'Prakash', 'Sunil', 'Ganesh', 'Manjunath', 'Kiran', 'Naveen', 'Shankar', 'Basavaraj', 'Anitha', 'Lakshmi'];
  const lastNames = ['Gowda', 'Patil', 'Kulkarni', 'Shetty', 'Rao', 'Nayak', 'Pawar', 'Jadhav', 'Deshmukh', 'Bhat', 'Hegde', 'Kambali'];
  const employees = [];
  let empId = 1;
  for (const u of units) {
    for (let j = 1; j <= 2; j++) {
      const empName = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
      const rankId = j === 1 ? 5 : 4;
      const desId = j === 1 ? 1 : 2;
      const kgid = `KGID-${10000 + empId}`;
      employees.push({ id: empId, distId: u.distId, unitId: u.id, rankId, desId, name: empName, kgid });
      addStmt(`INSERT INTO Employee (EmployeeID, DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, EmployeeDOB, GenderID, BloodGroupID, PhysicallyChallenged, AppointmentDate) VALUES (${empId}, ${u.distId}, ${u.id}, ${rankId}, ${desId}, ${sqlStr(kgid)}, ${sqlStr(empName)}, '1985-05-15', 1, 1, 0, '2010-08-01');`);
      empId++;
    }
  }

  // 8. CaseCategory
  const categories = [
    { id: 1, lookup: 'FIR' },
    { id: 2, lookup: 'UDR' },
    { id: 3, lookup: 'PAR' },
    { id: 4, lookup: 'Zero FIR' }
  ];
  for (const c of categories) {
    addStmt(`INSERT INTO CaseCategory (CaseCategoryID, LookupValue) VALUES (${c.id}, ${sqlStr(c.lookup)});`);
  }

  // 9. GravityOffence
  const gravities = [
    { id: 1, lookup: 'Heinous' },
    { id: 2, lookup: 'Grave' },
    { id: 3, lookup: 'Non-Grave' }
  ];
  for (const g of gravities) {
    addStmt(`INSERT INTO GravityOffence (GravityOffenceID, LookupValue) VALUES (${g.id}, ${sqlStr(g.lookup)});`);
  }

  // 10. CrimeHead
  const crimeHeads = [
    { id: 1, group: 'Crimes Against Property' },
    { id: 2, group: 'Crimes Against Body' },
    { id: 3, group: 'Cyber Crimes' },
    { id: 4, group: 'Financial Offences' },
    { id: 5, group: 'Narcotic Crimes' }
  ];
  for (const ch of crimeHeads) {
    addStmt(`INSERT INTO CrimeHead (CrimeHeadID, CrimeGroupName, Active) VALUES (${ch.id}, ${sqlStr(ch.group)}, 1);`);
  }

  // 11. CrimeSubHead
  const crimeSubHeads = [
    { id: 1, headId: 1, name: 'Automobile Theft' },
    { id: 2, headId: 1, name: 'House Breaking Night' },
    { id: 3, headId: 1, name: 'Chain Snatching' },
    { id: 4, headId: 2, name: 'Murder' },
    { id: 5, headId: 2, name: 'Grievous Hurt' },
    { id: 6, headId: 3, name: 'Online Financial Fraud' },
    { id: 7, headId: 3, name: 'Identity Theft' },
    { id: 8, headId: 4, name: 'Cheating' },
    { id: 9, headId: 5, name: 'Ganja Possession' },
    { id: 10, headId: 1, name: 'Highway Robbery' }
  ];
  for (const csh of crimeSubHeads) {
    addStmt(`INSERT INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES (${csh.id}, ${csh.headId}, ${sqlStr(csh.name)}, ${csh.id});`);
  }

  // 12. Act
  const acts = [
    { code: 'IPC', desc: 'Indian Penal Code 1860', short: 'IPC' },
    { code: 'IT_ACT', desc: 'Information Technology Act 2000', short: 'IT Act' },
    { code: 'NDPS', desc: 'Narcotic Drugs & Psychotropic Substances Act', short: 'NDPS' },
    { code: 'KPA', desc: 'Karnataka Police Act 1963', short: 'KP Act' }
  ];
  for (const a of acts) {
    addStmt(`INSERT INTO Act (ActCode, ActDescription, ShortName, Active) VALUES (${sqlStr(a.code)}, ${sqlStr(a.desc)}, ${sqlStr(a.short)}, 1);`);
  }

  // 13. Section
  const sections = [
    { act: 'IPC', sec: '379', desc: 'Theft' },
    { act: 'IPC', sec: '380', desc: 'Theft in dwelling house' },
    { act: 'IPC', sec: '457', desc: 'Lurking house-trespass by night' },
    { act: 'IPC', sec: '392', desc: 'Robbery' },
    { act: 'IPC', sec: '302', desc: 'Murder' },
    { act: 'IPC', sec: '326', desc: 'Voluntarily causing grievous hurt' },
    { act: 'IPC', sec: '420', desc: 'Cheating' },
    { act: 'IT_ACT', sec: '66D', desc: 'Cheating by impersonation' },
    { act: 'NDPS', sec: '20', desc: 'Cannabis offences' },
    { act: 'IPC', sec: '384', desc: 'Extortion' }
  ];
  for (const s of sections) {
    addStmt(`INSERT INTO Section (ActCode, SectionCode, SectionDescription, Active) VALUES (${sqlStr(s.act)}, ${sqlStr(s.sec)}, ${sqlStr(s.desc)}, 1);`);
  }

  // 14. CrimeHeadActSection
  const crimeHeadActSections = [
    { headId: 1, act: 'IPC', sec: '379' },
    { headId: 1, act: 'IPC', sec: '380' },
    { headId: 1, act: 'IPC', sec: '457' },
    { headId: 2, act: 'IPC', sec: '302' },
    { headId: 2, act: 'IPC', sec: '326' },
    { headId: 3, act: 'IT_ACT', sec: '66D' },
    { headId: 4, act: 'IPC', sec: '420' },
    { headId: 5, act: 'NDPS', sec: '20' }
  ];
  for (const chas of crimeHeadActSections) {
    addStmt(`INSERT INTO CrimeHeadActSection (CrimeHeadID, ActCode, SectionCode) VALUES (${chas.headId}, ${sqlStr(chas.act)}, ${sqlStr(chas.sec)});`);
  }

  // 15. Court
  const courts = [
    { id: 1, distId: 1, name: '1st ACMM Court Bengaluru' },
    { id: 2, distId: 2, name: 'JMFC 1st Court Mysuru' },
    { id: 3, distId: 3, name: 'JMFC 1st Court Mangaluru' },
    { id: 4, distId: 4, name: 'JMFC 1st Court Hubballi' },
    { id: 5, distId: 5, name: 'JMFC 1st Court Belagavi' },
    { id: 6, distId: 6, name: 'JMFC 1st Court Kalaburagi' }
  ];
  for (const c of courts) {
    addStmt(`INSERT INTO Court (CourtID, CourtName, DistrictID, StateID, Active) VALUES (${c.id}, ${sqlStr(c.name)}, ${c.distId}, 1, 1);`);
  }

  // 16. CaseStatusMaster
  const caseStatuses = [
    { id: 1, name: 'Under Investigation' },
    { id: 2, name: 'Charge Sheeted' },
    { id: 3, name: 'Pending Trial' },
    { id: 4, name: 'Closed' },
    { id: 5, name: 'Cancelled' }
  ];
  for (const cs of caseStatuses) {
    addStmt(`INSERT INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES (${cs.id}, ${sqlStr(cs.name)});`);
  }

  // 17. CasteMaster
  const castes = ['General', 'OBC', 'SC', 'ST', 'Unspecified'];
  castes.forEach((c, idx) => {
    addStmt(`INSERT INTO CasteMaster (caste_master_id, caste_master_name) VALUES (${idx + 1}, ${sqlStr(c)});`);
  });

  // 18. ReligionMaster
  const religions = ['Hindu', 'Muslim', 'Christian', 'Jain', 'Sikh'];
  religions.forEach((r, idx) => {
    addStmt(`INSERT INTO ReligionMaster (ReligionID, ReligionName) VALUES (${idx + 1}, ${sqlStr(r)});`);
  });

  // 19. OccupationMaster
  const occupations = ['Business', 'Private Employee', 'Daily Wager', 'Student', 'Agriculture', 'Unemployed', 'Driver'];
  occupations.forEach((o, idx) => {
    addStmt(`INSERT INTO OccupationMaster (OccupationID, OccupationName) VALUES (${idx + 1}, ${sqlStr(o)});`);
  });

  // -------------------------------------------------------------------------
  // Core Case Data Generation (600 Cases)
  // -------------------------------------------------------------------------
  const totalCases = 600;

  // Cluster & Ring Case IDs
  const repeatOffenderName = "Nagaraj @ 'Snake' Nagi";
  const repeatOffenderCaseIDs = [10, 45, 80, 120, 250];

  const ringMembers = [
    "Syed 'Jaguar' Imran",
    "Kiran 'Bullet' Gowda",
    "Pradeep 'Chotta' Kumar"
  ];
  const ringCaseIDs = [25, 105, 210, 340];

  const complainantFirstNames = ['Anand', 'Bharath', 'Chetan', 'Deepak', 'Eshwar', 'Girish', 'Harish', 'Jagadish', 'Kavitha', 'Latha', 'Meena', 'Nandini', 'Pooja', 'Radha', 'Shilpa', 'Suma'];
  const complainantLastNames = ['Shetty', 'Rao', 'Bhat', 'Joshi', 'Kulkarni', 'Gowda', 'Hegde', 'Murthy', 'Deshpande', 'Naik'];

  const victimFirstNames = ['Arun', 'Bhavya', 'Chaitra', 'Divya', 'Ganesh', 'Kiran', 'Manoj', 'Nikhil', 'Praveen', 'Rajesh', 'Sangeetha', 'Vinay'];
  const accusedFirstNames = ['Altaf', 'Babloo', 'Dharma', 'Imtiaz', 'Jagga', 'Mantu', 'Pandu', 'Raja', 'Shiva', 'Tukaram', 'Vicky', 'Yogesh'];
  const accusedLastNames = ['Kumar', 'Singh', 'Khan', 'Alias', 'Salim', 'Reddy', 'Pashan', 'Verma'];

  let complainantIdCounter = 1;
  let victimMasterIdCounter = 1;
  let accusedMasterIdCounter = 1;
  let arrestSurrenderIdCounter = 1;
  let csIdCounter = 1;

  for (let caseId = 1; caseId <= totalCases; caseId++) {
    let districtObj;
    if (repeatOffenderCaseIDs.includes(caseId) || ringCaseIDs.includes(caseId)) {
      districtObj = districts[0];
    } else {
      districtObj = districts[(caseId - 1) % districts.length];
    }

    const distUnits = units.filter(u => u.distId === districtObj.id);
    const unitObj = distUnits[(caseId - 1) % distUnits.length];

    const crimeSubHeadObj = crimeSubHeads[(caseId - 1) % crimeSubHeads.length];
    const gravityObj = gravities[(caseId - 1) % gravities.length];
    const caseStatusObj = caseStatuses[(caseId - 1) % caseStatuses.length];
    const categoryObj = categories[(caseId - 1) % categories.length];

    const unitEmps = employees.filter(e => e.unitId === unitObj.id);
    const policePerson = unitEmps.length > 0 ? unitEmps[0] : employees[0];

    const courtObj = courts.find(c => c.distId === districtObj.id) || courts[0];

    const crimeNo = `1${pad(districtObj.id, 4)}${pad(unitObj.id, 4)}2024${pad(caseId, 5)}`;
    const caseNo = `2024${pad(caseId, 5)}`;

    const month = pad(((caseId % 12) + 1), 2);
    const day = pad(((caseId % 28) + 1), 2);
    const hour = pad(((caseId % 24)), 2);
    const regDateStr = `2024-${month}-${day}`;
    const incidentFromStr = `2024-${month}-${day} ${hour}:00:00`;
    const incidentToStr = `2024-${month}-${day} ${pad((parseInt(hour)+2)%24, 2)}:00:00`;

    const lat = (unitObj.lat + ((caseId % 20) - 10) * 0.001).toFixed(6);
    const lng = (unitObj.lng + ((caseId % 20) - 10) * 0.001).toFixed(6);

    const briefFacts = `Incident reported at ${unitObj.name}. Initial investigation launched by IO ${policePerson.name}.`;

    addStmt(
      `INSERT INTO CaseMaster (CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, PolicePersonID, PoliceStationID, CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID, CourtID, IncidentFromDate, IncidentToDate, InfoReceivedPSDate, latitude, longitude, BriefFacts) VALUES (` +
      `${caseId}, ${sqlStr(crimeNo)}, ${sqlStr(caseNo)}, ${sqlStr(regDateStr)}, ${policePerson.id}, ${unitObj.id}, ${categoryObj.id}, ${gravityObj.id}, ${crimeSubHeadObj.headId}, ${crimeSubHeadObj.id}, ${caseStatusObj.id}, ${courtObj.id}, ${sqlStr(incidentFromStr)}, ${sqlStr(incidentToStr)}, ${sqlStr(incidentFromStr)}, ${lat}, ${lng}, ${sqlStr(briefFacts)});`
    );

    // 21. Inv_OccuranceTime (1:1)
    const place = `Near Junction, ${unitObj.name.replace(' Police Station', '')}`;
    addStmt(
      `INSERT INTO Inv_OccuranceTime (CaseMasterID, IncidentFromDate, IncidentToDate, latitude, longitude, PlaceOfOccurrence) VALUES (` +
      `${caseId}, ${sqlStr(incidentFromStr)}, ${sqlStr(incidentToStr)}, ${lat}, ${lng}, ${sqlStr(place)});`
    );

    // 22. ComplainantDetails
    const compName = `${getRandomElement(complainantFirstNames)} ${getRandomElement(complainantLastNames)}`;
    addStmt(
      `INSERT INTO ComplainantDetails (ComplainantID, CaseMasterID, ComplainantName, AgeYear, OccupationID, ReligionID, CasteID, GenderID) VALUES (` +
      `${complainantIdCounter++}, ${caseId}, ${sqlStr(compName)}, ${getRandomInt(25, 65)}, 2, 1, 1, 1);`
    );

    // 23. ActSectionAssociation
    const matchingChas = crimeHeadActSections.find(c => c.headId === crimeSubHeadObj.headId) || crimeHeadActSections[0];
    addStmt(
      `INSERT INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID) VALUES (` +
      `${caseId}, ${sqlStr(matchingChas.act)}, ${sqlStr(matchingChas.sec)}, 1, 1);`
    );

    // 24. Victim
    const vicName = `${getRandomElement(victimFirstNames)} ${getRandomElement(complainantLastNames)}`;
    addStmt(
      `INSERT INTO Victim (VictimMasterID, CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice) VALUES (` +
      `${victimMasterIdCounter++}, ${caseId}, ${sqlStr(vicName)}, ${getRandomInt(20, 60)}, 1, '0');`
    );

    // 25. Accused
    const caseAccusedMasterIDs = [];

    if (repeatOffenderCaseIDs.includes(caseId)) {
      const accMasterId = accusedMasterIdCounter++;
      caseAccusedMasterIDs.push(accMasterId);
      addStmt(
        `INSERT INTO Accused (AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID) VALUES (` +
        `${accMasterId}, ${caseId}, ${sqlStr(repeatOffenderName)}, 34, 1, 'A1');`
      );
    } else if (ringCaseIDs.includes(caseId)) {
      let pIdx = 1;
      for (const memberName of ringMembers) {
        const accMasterId = accusedMasterIdCounter++;
        caseAccusedMasterIDs.push(accMasterId);
        addStmt(
          `INSERT INTO Accused (AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID) VALUES (` +
          `${accMasterId}, ${caseId}, ${sqlStr(memberName)}, 29, 1, ${sqlStr('A' + pIdx++)});`
        );
      }
    } else {
      const numAccused = (caseId % 3 === 0) ? 2 : 1;
      for (let k = 0; k < numAccused; k++) {
        const accMasterId = accusedMasterIdCounter++;
        caseAccusedMasterIDs.push(accMasterId);
        const accName = `${getRandomElement(accusedFirstNames)} ${getRandomElement(accusedLastNames)}`;
        addStmt(
          `INSERT INTO Accused (AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID) VALUES (` +
          `${accMasterId}, ${caseId}, ${sqlStr(accName)}, ${getRandomInt(20, 45)}, 1, ${sqlStr('A' + (k + 1))});`
        );
      }
    }

    // 26. ArrestSurrender & 27. inv_arrestsurrenderaccused
    if (caseId % 2 === 0 || repeatOffenderCaseIDs.includes(caseId) || ringCaseIDs.includes(caseId)) {
      const arrestId = arrestSurrenderIdCounter++;
      const firstAccusedMasterId = caseAccusedMasterIDs[0];
      addStmt(
        `INSERT INTO ArrestSurrender (ArrestSurrenderID, CaseMasterID, ArrestSurrenderTypeID, ArrestSurrenderDate, ArrestSurrenderStateId, ArrestSurrenderDistrictId, PoliceStationID, IOID, CourtID, AccusedMasterID, IsAccused, IsComplainantAccused) VALUES (` +
        `${arrestId}, ${caseId}, 1, ${sqlStr(regDateStr)}, 1, ${districtObj.id}, ${unitObj.id}, ${policePerson.id}, ${courtObj.id}, ${firstAccusedMasterId}, 1, 0);`
      );

      for (const accMasterId of caseAccusedMasterIDs) {
        addStmt(
          `INSERT INTO inv_arrestsurrenderaccused (ArrestSurrenderID, AccusedMasterID) VALUES (` +
          `${arrestId}, ${accMasterId});`
        );
      }
    }

    // 28. ChargesheetDetails
    if (caseId % 3 === 0 || ringCaseIDs.includes(caseId)) {
      const csId = csIdCounter++;
      addStmt(
        `INSERT INTO ChargesheetDetails (CSID, CaseMasterID, csdate, cstype, PolicePersonID) VALUES (` +
        `${csId}, ${caseId}, ${sqlStr(incidentFromStr)}, 'A', ${policePerson.id});`
      );
    }
  }

  console.log(`Generated ${statements.length} SQL statements across 600 FIR cases.`);
  return statements;
}

function run() {
  const statements = generateSeedData();
  const sqlContent = statements.join('\n');

  const targetPath1 = path.join(__dirname, 'seed.sql');
  fs.writeFileSync(targetPath1, sqlContent, 'utf-8');
  console.log(`Wrote seed.sql to ${targetPath1}`);

  const rootDbDir = path.resolve(__dirname, '../../db');
  if (fs.existsSync(rootDbDir)) {
    const targetPath2 = path.join(rootDbDir, 'seed.sql');
    fs.writeFileSync(targetPath2, sqlContent, 'utf-8');
    console.log(`Wrote seed.sql to ${targetPath2}`);
  }

  console.log('Validating DDL and DML on node:sqlite in-memory database...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  let schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  let sqliteSchema = schemaSql
    .replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/gi, ';')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');

  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(sqliteSchema);
  db.exec(sqlContent);

  const rowCount = db.prepare('SELECT COUNT(*) as count FROM CaseMaster').get();
  console.log(`Successfully seeded node:sqlite database! Total CaseMaster records: ${rowCount.count}`);
}

if (require.main === module) {
  run();
}

module.exports = { generateSeedData };
