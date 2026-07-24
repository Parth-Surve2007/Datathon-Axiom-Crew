'use strict';

const { buildGraph } = require('./graph.service');

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const categoryConfig = [
  { key: 'property', label: 'Property', color: '#75a7d3', soft: '#e8f0f7' },
  { key: 'violent', label: 'Violent', color: '#d9482b', soft: '#fbeae5' },
  { key: 'cyber', label: 'Cyber', color: '#182033', soft: '#e8eaed' },
  { key: 'financial', label: 'Financial', color: '#287a71', soft: '#e5f1ef' },
  { key: 'narcotic', label: 'Narcotic', color: '#b47721', soft: '#f5ead7' },
];

const byId = (rows, key) => new Map(rows.map((row) => [String(row[key]), row]));
const number = (value) => Number(value || 0);
const dateValue = (value) => new Date(String(value)).getTime() || 0;

function categoryKey(name) {
  const value = String(name || '').toLowerCase();
  if (value.includes('body')) return 'violent';
  if (value.includes('cyber')) return 'cyber';
  if (value.includes('financial')) return 'financial';
  if (value.includes('narcotic')) return 'narcotic';
  return 'property';
}

function buildPayload(tables) {
  const cases = tables.CaseMaster;
  const unitsById = byId(tables.Unit, 'UnitID');
  const districtsById = byId(tables.District, 'DistrictID');
  const employeesById = byId(tables.Employee, 'EmployeeID');
  const headsById = byId(tables.CrimeHead, 'CrimeHeadID');
  const subHeadsById = byId(tables.CrimeSubHead, 'CrimeSubHeadID');
  const gravitiesById = byId(tables.GravityOffence, 'GravityOffenceID');
  const statusesById = byId(tables.CaseStatusMaster, 'CaseStatusID');
  const accusedByCase = new Map();
  for (const accused of tables.Accused) {
    const id = String(accused.CaseMasterID);
    accusedByCase.set(id, [...(accusedByCase.get(id) || []), accused]);
  }

  const monthMap = new Map();
  const categoryTotals = Object.fromEntries(categoryConfig.map((item) => [item.key, 0]));
  for (const item of cases) {
    const date = new Date(String(item.CrimeRegisteredDate));
    const monthIndex = Number.isNaN(date.getTime()) ? 0 : date.getMonth();
    const label = monthNames[monthIndex];
    const row = monthMap.get(label) || { name: label, property: 0, violent: 0, cyber: 0, financial: 0, narcotic: 0 };
    const head = headsById.get(String(item.CrimeMajorHeadID));
    const key = categoryKey(head?.CrimeGroupName);
    row[key] += 1;
    categoryTotals[key] += 1;
    monthMap.set(label, row);
  }
  const monthly = monthNames.map((name) => monthMap.get(name) || { name, property: 0, violent: 0, cyber: 0, financial: 0, narcotic: 0 });
  const categories = categoryConfig.map((item) => ({ ...item, value: categoryTotals[item.key] })).sort((a, b) => b.value - a.value);

  const dailyValues = Array.from({ length: 7 }, () => 0);
  for (const item of cases) {
    const date = new Date(String(item.CrimeRegisteredDate));
    if (!Number.isNaN(date.getTime())) dailyValues[(date.getDay() + 6) % 7] += 1;
  }
  const quarterValues = [0, 0, 0, 0];
  for (const item of cases) {
    const date = new Date(String(item.CrimeRegisteredDate));
    if (!Number.isNaN(date.getTime())) quarterValues[Math.floor(date.getMonth() / 3)] += 1;
  }
  const monthValues = monthly.map((item) => Object.keys(categoryTotals).reduce((sum, key) => sum + item[key], 0));

  const statusCount = (name) => cases.filter((item) => String(statusesById.get(String(item.CaseStatusID))?.CaseStatusName || '').toLowerCase().includes(name)).length;
  const chargeSheeted = statusCount('charge') || tables.ChargesheetDetails.length;
  const underInvestigation = statusCount('investigation');
  const closed = statusCount('closed');

  const investigations = [...cases]
    .sort((a, b) => number(a.GravityOffenceID) - number(b.GravityOffenceID) || dateValue(b.CrimeRegisteredDate) - dateValue(a.CrimeRegisteredDate))
    .slice(0, 6)
    .map((item) => {
      const unit = unitsById.get(String(item.PoliceStationID));
      const district = districtsById.get(String(unit?.DistrictID));
      const gravity = gravitiesById.get(String(item.GravityOffenceID))?.LookupValue || 'Active';
      const status = statusesById.get(String(item.CaseStatusID))?.CaseStatusName || 'Active';
      const subHead = subHeadsById.get(String(item.CrimeMinorHeadID));
      const people = accusedByCase.get(String(item.CaseMasterID)) || [];
      return {
        id: String(item.CaseNo || item.CrimeNo),
        title: subHead?.CrimeHeadName || 'Registered incident',
        status: String(gravity),
        district: district?.DistrictName || unit?.UnitName || 'Karnataka',
        age: String(item.CrimeRegisteredDate || ''),
        tags: [status, `${people.length} accused`],
        detail: item.BriefFacts || `Registered at ${unit?.UnitName || 'police station'}.`,
      };
    });

  const casesByUnit = new Map();
  for (const item of cases) casesByUnit.set(String(item.PoliceStationID), (casesByUnit.get(String(item.PoliceStationID)) || 0) + 1);
  const employeesByUnit = new Map();
  for (const employee of tables.Employee) {
    const key = String(employee.UnitID);
    employeesByUnit.set(key, [...(employeesByUnit.get(key) || []), employee]);
  }
  const fieldUnits = [...tables.Unit]
    .sort((a, b) => (casesByUnit.get(String(b.UnitID)) || 0) - (casesByUnit.get(String(a.UnitID)) || 0))
    .slice(0, 4)
    .map((unit) => {
      const officer = (employeesByUnit.get(String(unit.UnitID)) || [])[0];
      const name = officer?.FirstName || 'Unassigned officer';
      return { initials: name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2), name, role: unit.UnitName, state: `${casesByUnit.get(String(unit.UnitID)) || 0} cases` };
    });

  const coordinates = cases.map((item) => ({ lat: number(item.latitude), lon: number(item.longitude) })).filter((point) => point.lat && point.lon);
  const minLat = Math.min(...coordinates.map((point) => point.lat));
  const maxLat = Math.max(...coordinates.map((point) => point.lat));
  const minLon = Math.min(...coordinates.map((point) => point.lon));
  const maxLon = Math.max(...coordinates.map((point) => point.lon));
  const grouped = new Map();
  for (const item of cases) {
    const key = String(item.PoliceStationID);
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
  }
  const hotspots = [...grouped.entries()].map(([unitId, items]) => {
    const unit = unitsById.get(unitId);
    const district = districtsById.get(String(unit?.DistrictID));
    const lat = items.reduce((sum, item) => sum + number(item.latitude), 0) / items.length;
    const lon = items.reduce((sum, item) => sum + number(item.longitude), 0) / items.length;
    const critical = items.filter((item) => number(item.GravityOffenceID) === 1).length;
    const dominant = [...items].sort((a, b) => number(a.CrimeMajorHeadID) - number(b.CrimeMajorHeadID))[0];
    const head = headsById.get(String(dominant?.CrimeMajorHeadID));
    return {
      id: `station-${unitId}`,
      label: String(unit?.UnitName || 'Station cluster').replace(' Police Station', ''),
      district: district?.DistrictName || 'Karnataka',
      station: unit?.UnitName || 'Police Station',
      type: categoryKey(head?.CrimeGroupName),
      cases: items.length,
      change: `${critical} heinous`,
      risk: critical >= 12 ? 'Critical' : critical >= 8 ? 'Elevated' : 'Watch',
      x: maxLon === minLon ? 50 : 10 + ((lon - minLon) / (maxLon - minLon)) * 80,
      y: maxLat === minLat ? 50 : 90 - ((lat - minLat) / (maxLat - minLat)) * 80,
      summary: `${items.length} FIRs are registered at this station, including ${critical} heinous matters.`,
      updated: 'Live Data Store',
    };
  }).sort((a, b) => b.cases - a.cases);

  const network = buildGraph(cases, tables.Accused, unitsById, subHeadsById);
  return {
    source: tables.__source || 'Zoho Catalyst Data Store',
    generatedAt: new Date().toISOString(),
    summary: { totalCases: cases.length, underInvestigation, chargeSheeted, closed, arrests: tables.ArrestSurrender.length, highPriority: cases.filter((item) => number(item.GravityOffenceID) === 1).length },
    // Makes all ER entities visible to the dashboard/API without forcing every
    // screen to download and render every individual record.
    entityCoverage: Object.entries(tables)
      .filter(([name, rows]) => name !== '__source' && Array.isArray(rows))
      .map(([name, rows]) => ({ entity: name, records: rows.length }))
      .sort((a, b) => a.entity.localeCompare(b.entity)),
    pulse: {
      Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: dailyValues },
      Month: { labels: monthNames, values: monthValues },
      Quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: quarterValues },
    },
    investigations,
    fieldUnits,
    pipeline: [
      { label: 'FIRs registered', value: cases.length },
      { label: 'Investigations', value: underInvestigation },
      { label: 'Charge-sheets', value: chargeSheeted },
      { label: 'Closed', value: closed },
    ],
    analytics: {
      monthly,
      categories,
      trend: monthly.map((item) => ({ name: item.name, incidents: Object.keys(categoryTotals).reduce((sum, key) => sum + item[key], 0) })),
    },
    hotspots,
    network,
  };
}

module.exports = { buildPayload };
