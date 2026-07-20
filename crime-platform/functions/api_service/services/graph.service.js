'use strict';

function seededPosition(value, axis) {
  const seed = String(value).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 12 + ((seed * (axis === 'x' ? 37 : 53)) % 76);
}

function buildGraph(cases, accused, unitsById, subHeadsById) {
  const caseById = new Map(cases.map((item) => [String(item.CaseMasterID), item]));
  const nameGroups = new Map();
  for (const person of accused) {
    const key = String(person.AccusedName || '').trim().toLowerCase();
    if (!key) continue;
    const group = nameGroups.get(key) || [];
    group.push(person);
    nameGroups.set(key, group);
  }

  const repeated = [...nameGroups.entries()]
    .filter(([, people]) => new Set(people.map((person) => String(person.CaseMasterID))).size > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8);
  const relevantCaseIds = new Set(repeated.flatMap(([, people]) => people.map((person) => String(person.CaseMasterID))));
  const nodes = [];
  const edges = [];

  for (const [key, people] of repeated) {
    const label = people[0].AccusedName;
    const linked = new Set(people.map((person) => String(person.CaseMasterID)));
    nodes.push({
      id: `person-${key.replace(/[^a-z0-9]+/g, '-')}`,
      label,
      subtitle: `Repeat accused · ${linked.size} linked cases`,
      kind: 'Person',
      risk: Math.min(98, 58 + linked.size * 9),
      x: seededPosition(key, 'x'),
      y: seededPosition(key, 'y'),
      attributes: [
        { label: 'Linked FIRs', value: `${linked.size} cases` },
        { label: 'Database matches', value: `${people.length} records` },
        { label: 'Entity source', value: 'Accused register' },
      ],
    });
  }

  for (const caseId of [...relevantCaseIds].slice(0, 12)) {
    const item = caseById.get(caseId);
    if (!item) continue;
    const id = `case-${caseId}`;
    const station = unitsById.get(String(item.PoliceStationID));
    const subHead = subHeadsById.get(String(item.CrimeMinorHeadID));
    nodes.push({
      id,
      label: `FIR ${item.CaseNo || item.CrimeNo}`,
      subtitle: subHead?.CrimeHeadName || 'Registered incident',
      kind: 'Case',
      risk: item.GravityOffenceID === 1 ? 90 : item.GravityOffenceID === 2 ? 72 : 48,
      x: seededPosition(caseId, 'x'),
      y: seededPosition(caseId, 'y'),
      attributes: [
        { label: 'Station', value: station?.UnitName || 'Unassigned' },
        { label: 'Registered', value: String(item.CrimeRegisteredDate || '—') },
        { label: 'Crime number', value: String(item.CrimeNo || '—') },
      ],
    });
  }

  for (const [key, people] of repeated) {
    const personId = `person-${key.replace(/[^a-z0-9]+/g, '-')}`;
    for (const caseId of new Set(people.map((person) => String(person.CaseMasterID)))) {
      if (!relevantCaseIds.has(caseId)) continue;
      edges.push({ id: `${personId}-${caseId}`, source: personId, target: `case-${caseId}`, label: 'named in', strength: 92 });
    }
  }
  const visibleNodeIds = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    edges: edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)),
  };
}

module.exports = { buildGraph };
