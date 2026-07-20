/**
 * Verification Script for Official Karnataka Police Database Schema & Seed Data
 * Validates:
 * 1. Schema DDL execution (28 required canonical tables created)
 * 2. Seed DML execution (600 FIR cases & linked entities loaded)
 * 3. Relationship Matrix FK Integrity (0 orphaned FKs across all relationship links)
 * 4. Pattern Detection: Seeded Repeat Offender Cluster (>= 3 cases in same district)
 * 5. Pattern Detection: Seeded Co-Accused Ring (2-3 accused appearing together across multiple cases)
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function runVerification() {
  console.log('==================================================================');
  console.log('  KrimeAI Database Verification Engine - Karnataka Police Schema   ');
  console.log('==================================================================\n');

  let passedAll = true;

  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedPath = path.join(__dirname, 'seed.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ ERROR: schema.sql not found at ${schemaPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ ERROR: seed.sql not found at ${seedPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');

  const sqliteSchema = schemaSql
    .replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/gi, ';')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');

  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  // Step 1: Apply DDL
  console.log('1. Applying schema.sql DDL...');
  try {
    db.exec(sqliteSchema);
    console.log('   ✅ schema.sql applied cleanly with 0 DDL errors.');
  } catch (err) {
    console.error('   ❌ FAILED to apply schema.sql:', err.message);
    process.exit(1);
  }

  const requiredTables = [
    'State', 'District', 'Unit', 'UnitType', 'Rank', 'Designation', 'Employee',
    'CaseCategory', 'GravityOffence', 'CrimeHead', 'CrimeSubHead', 'Act', 'Section',
    'CrimeHeadActSection', 'Court', 'CaseStatusMaster', 'CasteMaster', 'ReligionMaster',
    'OccupationMaster', 'CaseMaster', 'ComplainantDetails', 'ActSectionAssociation',
    'Victim', 'Accused', 'ArrestSurrender', 'ChargesheetDetails', 'Inv_OccuranceTime',
    'inv_arrestsurrenderaccused'
  ];

  const existingTablesRows = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`).all();
  const existingTableNames = existingTablesRows.map(r => r.name);

  const missingTables = requiredTables.filter(t => !existingTableNames.includes(t));
  if (missingTables.length > 0) {
    console.error(`   ❌ Missing required tables: ${missingTables.join(', ')}`);
    process.exit(1);
  } else {
    console.log(`   ✅ All 28 required tables verified in database schema.\n`);
  }

  // Step 2: Apply DML Seed
  console.log('2. Applying seed.sql DML...');
  try {
    db.exec(seedSql);
    const caseCountRow = db.prepare('SELECT COUNT(*) as count FROM CaseMaster').get();
    console.log(`   ✅ seed.sql executed cleanly with 0 DML errors (${caseCountRow.count} CaseMaster FIRs seeded).\n`);
  } catch (err) {
    console.error('   ❌ FAILED to apply seed.sql:', err.message);
    process.exit(1);
  }

  // Step 3: Foreign Key Integrity Check across Relationship Matrix
  console.log('3. Auditing Foreign Key Integrity across Relationship Matrix...');
  const pragmaFkErrors = db.prepare('PRAGMA foreign_key_check;').all();
  if (pragmaFkErrors.length > 0) {
    console.error('   ❌ PRAGMA foreign_key_check reported orphaned keys:', pragmaFkErrors);
    passedAll = false;
  } else {
    console.log('   ✅ PRAGMA foreign_key_check passed with 0 errors.');
  }

  const fkAuditQueries = [
    { name: 'District -> State', child: 'District', fk: 'StateID', parent: 'State', pk: 'StateID' },
    { name: 'Unit -> UnitType', child: 'Unit', fk: 'TypeID', parent: 'UnitType', pk: 'UnitTypeID' },
    { name: 'Unit -> State', child: 'Unit', fk: 'StateID', parent: 'State', pk: 'StateID' },
    { name: 'Unit -> District', child: 'Unit', fk: 'DistrictID', parent: 'District', pk: 'DistrictID' },
    { name: 'Employee -> District', child: 'Employee', fk: 'DistrictID', parent: 'District', pk: 'DistrictID' },
    { name: 'Employee -> Unit', child: 'Employee', fk: 'UnitID', parent: 'Unit', pk: 'UnitID' },
    { name: 'Employee -> Rank', child: 'Employee', fk: 'RankID', parent: 'Rank', pk: 'RankID' },
    { name: 'Employee -> Designation', child: 'Employee', fk: 'DesignationID', parent: 'Designation', pk: 'DesignationID' },
    { name: 'CrimeSubHead -> CrimeHead', child: 'CrimeSubHead', fk: 'CrimeHeadID', parent: 'CrimeHead', pk: 'CrimeHeadID' },
    { name: 'Section -> Act', child: 'Section', fk: 'ActCode', parent: 'Act', pk: 'ActCode' },
    { name: 'CrimeHeadActSection -> CrimeHead', child: 'CrimeHeadActSection', fk: 'CrimeHeadID', parent: 'CrimeHead', pk: 'CrimeHeadID' },
    { name: 'CrimeHeadActSection -> Act', child: 'CrimeHeadActSection', fk: 'ActCode', parent: 'Act', pk: 'ActCode' },
    { name: 'Court -> District', child: 'Court', fk: 'DistrictID', parent: 'District', pk: 'DistrictID' },
    { name: 'Court -> State', child: 'Court', fk: 'StateID', parent: 'State', pk: 'StateID' },
    { name: 'CaseMaster -> Employee (PolicePersonID)', child: 'CaseMaster', fk: 'PolicePersonID', parent: 'Employee', pk: 'EmployeeID' },
    { name: 'CaseMaster -> Unit (PoliceStationID)', child: 'CaseMaster', fk: 'PoliceStationID', parent: 'Unit', pk: 'UnitID' },
    { name: 'CaseMaster -> CaseCategory', child: 'CaseMaster', fk: 'CaseCategoryID', parent: 'CaseCategory', pk: 'CaseCategoryID' },
    { name: 'CaseMaster -> GravityOffence', child: 'CaseMaster', fk: 'GravityOffenceID', parent: 'GravityOffence', pk: 'GravityOffenceID' },
    { name: 'CaseMaster -> CrimeHead', child: 'CaseMaster', fk: 'CrimeMajorHeadID', parent: 'CrimeHead', pk: 'CrimeHeadID' },
    { name: 'CaseMaster -> CrimeSubHead', child: 'CaseMaster', fk: 'CrimeMinorHeadID', parent: 'CrimeSubHead', pk: 'CrimeSubHeadID' },
    { name: 'CaseMaster -> CaseStatusMaster', child: 'CaseMaster', fk: 'CaseStatusID', parent: 'CaseStatusMaster', pk: 'CaseStatusID' },
    { name: 'CaseMaster -> Court', child: 'CaseMaster', fk: 'CourtID', parent: 'Court', pk: 'CourtID' },
    { name: 'Inv_OccuranceTime -> CaseMaster', child: 'Inv_OccuranceTime', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'ComplainantDetails -> CaseMaster', child: 'ComplainantDetails', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'ComplainantDetails -> OccupationMaster', child: 'ComplainantDetails', fk: 'OccupationID', parent: 'OccupationMaster', pk: 'OccupationID' },
    { name: 'ComplainantDetails -> ReligionMaster', child: 'ComplainantDetails', fk: 'ReligionID', parent: 'ReligionMaster', pk: 'ReligionID' },
    { name: 'ComplainantDetails -> CasteMaster', child: 'ComplainantDetails', fk: 'CasteID', parent: 'CasteMaster', pk: 'caste_master_id' },
    { name: 'ActSectionAssociation -> CaseMaster', child: 'ActSectionAssociation', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'ActSectionAssociation -> Act', child: 'ActSectionAssociation', fk: 'ActID', parent: 'Act', pk: 'ActCode' },
    { name: 'Victim -> CaseMaster', child: 'Victim', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'Accused -> CaseMaster', child: 'Accused', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'ArrestSurrender -> CaseMaster', child: 'ArrestSurrender', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'ArrestSurrender -> State', child: 'ArrestSurrender', fk: 'ArrestSurrenderStateId', parent: 'State', pk: 'StateID' },
    { name: 'ArrestSurrender -> District', child: 'ArrestSurrender', fk: 'ArrestSurrenderDistrictId', parent: 'District', pk: 'DistrictID' },
    { name: 'ArrestSurrender -> Unit', child: 'ArrestSurrender', fk: 'PoliceStationID', parent: 'Unit', pk: 'UnitID' },
    { name: 'ArrestSurrender -> Employee', child: 'ArrestSurrender', fk: 'IOID', parent: 'Employee', pk: 'EmployeeID' },
    { name: 'ArrestSurrender -> Court', child: 'ArrestSurrender', fk: 'CourtID', parent: 'Court', pk: 'CourtID' },
    { name: 'ArrestSurrender -> Accused', child: 'ArrestSurrender', fk: 'AccusedMasterID', parent: 'Accused', pk: 'AccusedMasterID' },
    { name: 'inv_arrestsurrenderaccused -> ArrestSurrender', child: 'inv_arrestsurrenderaccused', fk: 'ArrestSurrenderID', parent: 'ArrestSurrender', pk: 'ArrestSurrenderID' },
    { name: 'inv_arrestsurrenderaccused -> Accused', child: 'inv_arrestsurrenderaccused', fk: 'AccusedMasterID', parent: 'Accused', pk: 'AccusedMasterID' },
    { name: 'ChargesheetDetails -> CaseMaster', child: 'ChargesheetDetails', fk: 'CaseMasterID', parent: 'CaseMaster', pk: 'CaseMasterID' },
    { name: 'ChargesheetDetails -> Employee', child: 'ChargesheetDetails', fk: 'PolicePersonID', parent: 'Employee', pk: 'EmployeeID' }
  ];

  let totalOrphanedFks = 0;
  for (const q of fkAuditQueries) {
    const sql = `SELECT COUNT(*) as orphans FROM ${q.child} c LEFT JOIN ${q.parent} p ON c.${q.fk} = p.${q.pk} WHERE c.${q.fk} IS NOT NULL AND p.${q.pk} IS NULL;`;
    const res = db.prepare(sql).get();
    if (res.orphans > 0) {
      console.error(`   ❌ Relationship FK Violation: ${q.name} has ${res.orphans} orphaned records.`);
      totalOrphanedFks += res.orphans;
      passedAll = false;
    }
  }

  if (totalOrphanedFks === 0) {
    console.log(`   ✅ Foreign Key Matrix Audit Passed: 0 orphaned FKs across all relationship links.\n`);
  }

  // Step 4: Verify Seeded Repeat-Offender Cluster
  console.log('4. Verifying Seeded Repeat-Offender Cluster Pattern...');
  const repeatClusterSql = `
    SELECT AccusedName, District.DistrictName, COUNT(DISTINCT CaseMaster.CaseMasterID) as case_count
    FROM Accused
    JOIN CaseMaster ON Accused.CaseMasterID = CaseMaster.CaseMasterID
    JOIN Unit ON CaseMaster.PoliceStationID = Unit.UnitID
    JOIN District ON Unit.DistrictID = District.DistrictID
    GROUP BY AccusedName, District.DistrictName
    HAVING case_count >= 3;
  `;
  const repeatClusters = db.prepare(repeatClusterSql).all();

  if (repeatClusters.length === 0) {
    console.error('   ❌ Repeat Offender Cluster NOT detected!');
    passedAll = false;
  } else {
    console.log('   ✅ Repeat Offender Cluster DETECTED:');
    for (const rc of repeatClusters) {
      console.log(`      • Accused: "${rc.AccusedName}" | District: "${rc.DistrictName}" | Cases Linked: ${rc.case_count}`);
    }
    console.log('');
  }

  // Step 5: Verify Seeded Co-Accused Ring Pattern
  console.log('5. Verifying Seeded Co-Accused Ring Pattern...');
  const ringSql = `
    SELECT a1.AccusedName as Accused1, a2.AccusedName as Accused2, a3.AccusedName as Accused3, COUNT(DISTINCT a1.CaseMasterID) as joint_case_count
    FROM Accused a1
    JOIN Accused a2 ON a1.CaseMasterID = a2.CaseMasterID AND a1.AccusedName < a2.AccusedName
    JOIN Accused a3 ON a1.CaseMasterID = a3.CaseMasterID AND a2.AccusedName < a3.AccusedName
    GROUP BY a1.AccusedName, a2.AccusedName, a3.AccusedName
    HAVING joint_case_count >= 2;
  `;
  const coAccusedRings = db.prepare(ringSql).all();

  if (coAccusedRings.length === 0) {
    console.error('   ❌ Co-Accused Ring NOT detected!');
    passedAll = false;
  } else {
    console.log('   ✅ Co-Accused Ring DETECTED:');
    for (const ring of coAccusedRings) {
      console.log(`      • Ring: ["${ring.Accused1}", "${ring.Accused2}", "${ring.Accused3}"] | Joint Cases: ${ring.joint_case_count}`);
    }
    console.log('');
  }

  console.log('==================================================================');
  if (passedAll) {
    console.log('  🎉 ALL VERIFICATION CRITERIA PASSED SUCCESSFULLY!               ');
    console.log('==================================================================');
    process.exit(0);
  } else {
    console.error('  ❌ VERIFICATION FAILED! SEE ERRORS ABOVE.                       ');
    console.log('==================================================================');
    process.exit(1);
  }
}

if (require.main === module) {
  runVerification();
}

module.exports = { runVerification };
