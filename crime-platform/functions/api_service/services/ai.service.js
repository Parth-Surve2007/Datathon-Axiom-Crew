'use strict';

const number = (value) => Number(value || 0);
const compact = (items) => items.filter(Boolean);

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function byId(rows, key) {
  return new Map((rows || []).map((row) => [String(row[key]), row]));
}

function groupBy(rows, getKey) {
  const groups = new Map();
  for (const row of rows || []) {
    const key = getKey(row);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) || []), row]);
  }
  return groups;
}

function categoryKey(name) {
  const value = normalize(name);
  if (value.includes('body') || value.includes('murder') || value.includes('assault')) return 'violent';
  if (value.includes('cyber')) return 'cyber';
  if (value.includes('financial') || value.includes('economic')) return 'financial';
  if (value.includes('narcotic') || value.includes('drug')) return 'narcotic';
  return 'property';
}

function detectIntent(query, historyText) {
  const text = `${normalize(query)} ${normalize(historyText)}`;
  if (/\b(kannada|translate|regional)\b/.test(text)) return 'language';
  if (/\b(repeat|habitual|history|criminal history|prior)\b/.test(text)) return 'repeat-offenders';
  if (/\b(network|linked|association|associate|ring|gang|co accused|relationship)\b/.test(text)) return 'network';
  if (/\b(hotspot|location|station|district|map|where|area)\b/.test(text)) return 'hotspots';
  if (/\b(trend|month|season|spike|compare|category|pattern|distribution)\b/.test(text)) return 'trends';
  if (/\b(profile|behaviour|behavior|modus|risk score|offender)\b/.test(text)) return 'profiling';
  if (/\b(summary|timeline|investigation|status|fir|case)\b/.test(text)) return 'case-summary';
  if (/\b(prevent|forecast|early warning|predict|proactive)\b/.test(text)) return 'prevention';
  return 'overview';
}

function findMatchingCases(query, context) {
  const text = normalize(query);
  const tokens = new Set(text.split(' ').filter((token) => token.length >= 3));
  const results = [];
  for (const item of context.cases) {
    const haystack = normalize([
      item.CaseNo,
      item.CrimeNo,
      item.BriefFacts,
      context.unitsById.get(String(item.PoliceStationID))?.UnitName,
      context.districtsById.get(String(context.unitsById.get(String(item.PoliceStationID))?.DistrictID))?.DistrictName,
      context.headsById.get(String(item.CrimeMajorHeadID))?.CrimeGroupName,
      context.subHeadsById.get(String(item.CrimeMinorHeadID))?.CrimeHeadName,
    ].join(' '));
    let score = 0;
    for (const token of tokens) if (haystack.includes(token)) score += 1;
    if (score > 0) results.push({ item, score });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 5).map((entry) => entry.item);
}

function caseReference(item, context) {
  const unit = context.unitsById.get(String(item.PoliceStationID));
  const district = context.districtsById.get(String(unit?.DistrictID));
  const subHead = context.subHeadsById.get(String(item.CrimeMinorHeadID));
  const status = context.statusesById.get(String(item.CaseStatusID));
  return {
    type: 'FIR',
    id: String(item.CaseNo || item.CrimeNo || item.CaseMasterID),
    title: subHead?.CrimeHeadName || 'Registered incident',
    detail: compact([
      district?.DistrictName || unit?.UnitName,
      status?.CaseStatusName,
      item.CrimeRegisteredDate,
    ]).join(' | '),
  };
}

function buildContext(payload, tables) {
  const cases = tables.CaseMaster || [];
  const accused = tables.Accused || [];
  const unitsById = byId(tables.Unit, 'UnitID');
  const districtsById = byId(tables.District, 'DistrictID');
  const headsById = byId(tables.CrimeHead, 'CrimeHeadID');
  const subHeadsById = byId(tables.CrimeSubHead, 'CrimeSubHeadID');
  const statusesById = byId(tables.CaseStatusMaster, 'CaseStatusID');
  const gravitiesById = byId(tables.GravityOffence, 'GravityOffenceID');
  const accusedByCase = groupBy(accused, (row) => String(row.CaseMasterID));
  const casesById = byId(cases, 'CaseMasterID');
  return { payload, tables, cases, accused, unitsById, districtsById, headsById, subHeadsById, statusesById, gravitiesById, accusedByCase, casesById };
}

function repeatOffenderAnswer(context) {
  const groups = [...groupBy(context.accused, (row) => normalize(row.AccusedName)).entries()]
    .map(([key, rows]) => {
      const caseIds = [...new Set(rows.map((row) => String(row.CaseMasterID)))];
      return { key, rows, caseIds, name: rows[0]?.AccusedName };
    })
    .filter((group) => group.caseIds.length > 1)
    .sort((a, b) => b.caseIds.length - a.caseIds.length)
    .slice(0, 4);

  if (!groups.length) {
    return {
      intent: 'repeat-offenders',
      confidence: 'Medium',
      answer: 'I did not find a repeat accused pattern in the current working set.',
      metrics: [{ label: 'Repeat entities', value: 0 }],
      references: [],
      reasoning: ['Grouped accused records by normalized name.', 'Counted distinct FIRs per accused entity.'],
      followUps: ['Show hotspot stations instead', 'Summarize active investigations'],
    };
  }

  const top = groups[0];
  const linkedCases = top.caseIds.map((caseId) => context.casesById.get(caseId)).filter(Boolean);
  return {
    intent: 'repeat-offenders',
    confidence: 'High',
    answer: `${top.name} is the strongest repeat-offender signal in the current data, appearing across ${top.caseIds.length} distinct FIRs. The pattern is worth prioritizing because repeated accused links can indicate habitual offending or a wider association chain.`,
    metrics: [
      { label: 'Repeat entities', value: groups.length },
      { label: 'Top linked FIRs', value: top.caseIds.length },
      { label: 'Network edges', value: context.payload.network.edges.length },
    ],
    references: linkedCases.slice(0, 4).map((item) => caseReference(item, context)),
    reasoning: [
      'Grouped accused records by normalized name.',
      'Counted distinct FIRs connected to each accused.',
      'Ranked entities by number of linked cases and exposed the top FIR evidence.',
    ],
    followUps: ['Open the network for this pattern', 'Which stations are linked?', 'Suggest investigative leads'],
  };
}

function networkAnswer(context) {
  const people = context.payload.network.nodes.filter((node) => node.kind === 'Person');
  const top = people[0];
  return {
    intent: 'network',
    confidence: people.length ? 'High' : 'Medium',
    answer: people.length
      ? `The relationship graph currently contains ${people.length} repeat accused nodes and ${context.payload.network.edges.length} evidence links. The highest-risk node is ${top.label}, scored at ${top.risk}/100 from repeated FIR associations.`
      : 'The relationship graph has no repeat accused nodes in the current working set.',
    metrics: [
      { label: 'Graph nodes', value: context.payload.network.nodes.length },
      { label: 'Evidence links', value: context.payload.network.edges.length },
      { label: 'Repeat accused', value: people.length },
    ],
    references: people.slice(0, 4).map((node) => ({
      type: 'Entity',
      id: node.id,
      title: node.label,
      detail: `${node.subtitle} | risk ${node.risk}/100`,
    })),
    reasoning: [
      'Built graph from accused-to-FIR relationships.',
      'Filtered to repeated entities and visible linked cases.',
      'Ranked nodes by risk score derived from linked-case count.',
    ],
    followUps: ['Show repeat offender details', 'Which FIRs connect this group?', 'Find top hotspot station'],
  };
}

function hotspotAnswer(context) {
  const top = context.payload.hotspots[0];
  return {
    intent: 'hotspots',
    confidence: top ? 'High' : 'Medium',
    answer: top
      ? `${top.station} is the leading hotspot with ${top.cases} FIRs and a ${top.risk.toLowerCase()} risk band. ${top.summary}`
      : 'No geocoded hotspot clusters are available in the current working set.',
    metrics: [
      { label: 'Station clusters', value: context.payload.hotspots.length },
      { label: 'Top cases', value: top?.cases || 0 },
      { label: 'High priority FIRs', value: context.payload.summary.highPriority },
    ],
    references: context.payload.hotspots.slice(0, 4).map((spot) => ({
      type: 'Hotspot',
      id: spot.id,
      title: spot.station,
      detail: `${spot.district} | ${spot.cases} FIRs | ${spot.risk}`,
    })),
    reasoning: [
      'Grouped FIRs by police station.',
      'Computed cluster size and heinous-case pressure.',
      'Projected clusters onto the local hotspot map.',
    ],
    followUps: ['Compare this by crime category', 'Show prevention recommendations', 'Open the hotspot map'],
  };
}

function trendAnswer(context) {
  const trend = context.payload.analytics.trend;
  const peak = [...trend].sort((a, b) => b.incidents - a.incidents)[0];
  const topCategory = context.payload.analytics.categories[0];
  return {
    intent: 'trends',
    confidence: 'High',
    answer: `${peak?.name || 'The current period'} has the highest registered volume with ${peak?.incidents || 0} incidents. ${topCategory?.label || 'The leading category'} is the dominant crime category with ${topCategory?.value || 0} FIRs, which suggests the immediate analytical focus should be category-specific hotspot prevention.`,
    metrics: [
      { label: 'Total FIRs', value: context.payload.summary.totalCases },
      { label: 'Peak month', value: peak?.name || '-' },
      { label: 'Top category', value: topCategory?.label || '-' },
    ],
    references: context.payload.analytics.categories.slice(0, 4).map((category) => ({
      type: 'Category',
      id: category.key,
      title: category.label,
      detail: `${category.value} registered FIRs`,
    })),
    reasoning: [
      'Aggregated FIRs by registered month.',
      'Stacked records into major crime categories.',
      'Compared category totals and monthly volume to identify the leading signal.',
    ],
    followUps: ['Show seasonal pattern', 'Which district drives the spike?', 'Give prevention intelligence'],
  };
}

function profilingAnswer(context) {
  const repeat = repeatOffenderAnswer(context);
  const severeCases = context.cases
    .filter((item) => number(item.GravityOffenceID) === 1)
    .sort((a, b) => String(b.CrimeRegisteredDate).localeCompare(String(a.CrimeRegisteredDate)))
    .slice(0, 4);
  return {
    intent: 'profiling',
    confidence: 'Medium',
    answer: `The current offender profile signal combines repeat appearances, offence gravity, and case recency. ${repeat.metrics[0].value} repeat entities and ${context.payload.summary.highPriority} high-priority FIRs should be reviewed first for habitual or escalating behavior.`,
    metrics: [
      { label: 'Repeat entities', value: repeat.metrics[0].value },
      { label: 'High priority FIRs', value: context.payload.summary.highPriority },
      { label: 'Arrests', value: context.payload.summary.arrests },
    ],
    references: severeCases.map((item) => caseReference(item, context)),
    reasoning: [
      'Used repeat accused links as habitual-offender evidence.',
      'Used offence gravity as severity evidence.',
      'Used recency to prioritize active investigative attention.',
    ],
    followUps: ['List repeat offenders', 'Suggest investigation leads', 'Find similar cases'],
  };
}

function caseSummaryAnswer(query, context) {
  const matches = findMatchingCases(query, context);
  const cases = matches.length ? matches : context.cases.slice(0, 4);
  const first = cases[0];
  return {
    intent: 'case-summary',
    confidence: matches.length ? 'High' : 'Medium',
    answer: first
      ? `I found ${cases.length} relevant FIR record${cases.length === 1 ? '' : 's'}. The strongest match is ${first.CaseNo || first.CrimeNo}, registered on ${first.CrimeRegisteredDate}, with status ${context.statusesById.get(String(first.CaseStatusID))?.CaseStatusName || 'available in case register'}.`
      : 'No FIR records are available in the current working set.',
    metrics: [
      { label: 'Matched FIRs', value: cases.length },
      { label: 'Under investigation', value: context.payload.summary.underInvestigation },
      { label: 'Charge-sheeted', value: context.payload.summary.chargeSheeted },
    ],
    references: cases.map((item) => caseReference(item, context)),
    reasoning: [
      'Searched FIR number, crime number, facts, station, district, crime head, and sub-head.',
      'Ranked matches by query-token overlap.',
      'Returned concise FIR evidence for investigator review.',
    ],
    followUps: ['Show similar FIRs', 'Build investigation timeline', 'Find linked accused'],
  };
}

function preventionAnswer(context) {
  const critical = context.payload.hotspots.filter((spot) => spot.risk === 'Critical');
  const elevated = context.payload.hotspots.filter((spot) => spot.risk === 'Elevated');
  const topCategory = context.payload.analytics.categories[0];
  const topHotspot = context.payload.hotspots[0];
  return {
    intent: 'prevention',
    confidence: 'Medium',
    answer: `Early warning should focus on ${topHotspot?.station || 'the highest-volume station'} and ${topCategory?.label || 'the leading category'} offences. Current prevention logic flags ${critical.length} critical and ${elevated.length} elevated station clusters for patrol planning, offender checks, and community interventions.`,
    metrics: [
      { label: 'Critical clusters', value: critical.length },
      { label: 'Elevated clusters', value: elevated.length },
      { label: 'Leading category', value: topCategory?.label || '-' },
    ],
    references: context.payload.hotspots.slice(0, 4).map((spot) => ({
      type: 'Prevention',
      id: spot.id,
      title: spot.station,
      detail: `${spot.risk} | ${spot.cases} FIRs | ${spot.change}`,
    })),
    reasoning: [
      'Ranked station clusters by case volume and heinous-case count.',
      'Used leading category pressure to target preventive measures.',
      'Converted analytics signals into operational recommendations.',
    ],
    followUps: ['Generate station action plan', 'Show monthly trend', 'Which accused are linked nearby?'],
  };
}

function languageAnswer(context) {
  return {
    intent: 'language',
    confidence: 'Low',
    answer: `Kannada support is planned, but this local prototype currently answers in English. The intelligence layer is structured so a translation step can be added before and after the evidence-grounded query.`,
    metrics: [
      { label: 'Current language', value: 'English' },
      { label: 'Records available', value: context.payload.summary.totalCases },
    ],
    references: [],
    reasoning: [
      'Detected a language-support request.',
      'Kept the answer grounded in current platform capability.',
    ],
    followUps: ['Ask in English about hotspots', 'Ask for repeat offenders', 'Ask for case status'],
  };
}

function overviewAnswer(context) {
  return {
    intent: 'overview',
    confidence: 'High',
    answer: `The current working set contains ${context.payload.summary.totalCases} FIRs, ${context.payload.summary.underInvestigation} under investigation, ${context.payload.summary.chargeSheeted} charge-sheeted, ${context.payload.summary.arrests} arrest records, and ${context.payload.summary.highPriority} high-priority matters. Ask about a station, accused, FIR, pattern, trend, hotspot, or prevention plan.`,
    metrics: [
      { label: 'FIRs', value: context.payload.summary.totalCases },
      { label: 'Investigations', value: context.payload.summary.underInvestigation },
      { label: 'Arrests', value: context.payload.summary.arrests },
    ],
    references: context.payload.investigations.slice(0, 3).map((item) => ({
      type: 'Investigation',
      id: item.id,
      title: item.title,
      detail: `${item.district} | ${item.status}`,
    })),
    reasoning: [
      'Read the live intelligence aggregate.',
      'Summarized investigation status, enforcement action, and priority load.',
    ],
    followUps: ['Show repeat offenders', 'Find top hotspot', 'Summarize monthly trend'],
  };
}

function answerQuery(query, payload, tables, history = []) {
  const recentHistory = (Array.isArray(history) ? history : [])
    .slice(-6)
    .map((message) => message.text || message.content || '')
    .join(' ');
  const context = buildContext(payload, tables);
  const intent = detectIntent(query, recentHistory);

  const response = {
    'repeat-offenders': () => repeatOffenderAnswer(context),
    network: () => networkAnswer(context),
    hotspots: () => hotspotAnswer(context),
    trends: () => trendAnswer(context),
    profiling: () => profilingAnswer(context),
    'case-summary': () => caseSummaryAnswer(query, context),
    prevention: () => preventionAnswer(context),
    language: () => languageAnswer(context),
    overview: () => overviewAnswer(context),
  }[intent]();

  return {
    ...response,
    generatedAt: payload.generatedAt,
    source: payload.source,
  };
}

module.exports = { answerQuery };
