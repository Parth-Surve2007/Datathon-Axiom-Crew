'use strict';

const number = (value) => Number(value || 0);
const compact = (items) => items.filter(Boolean);
const stopWords = new Set([
  'show', 'give', 'find', 'list', 'what', 'which', 'with', 'about', 'into', 'from',
  'this', 'that', 'case', 'cases', 'crime', 'crimes', 'please', 'tell', 'me', 'the',
  'and', 'for', 'are', 'was', 'were', 'has', 'have', 'fir', 'firs',
]);

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(value) {
  return normalize(value).split(/\s+/).filter((token) => token.length >= 3 && !stopWords.has(token));
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

function avg(rows, key) {
  const values = rows.map((row) => number(row[key])).filter(Boolean);
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
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
  const current = normalize(query);
  const text = `${current} ${normalize(historyText)}`;
  if (/\b(kannada|translate|regional)\b/.test(current)) return 'language';
  if (/\b(similar|matching|past cases|same modus|same pattern)\b/.test(current)) return 'similar-cases';
  if (/\b(lead|leads|next step|investigate|recommend|action plan)\b/.test(current)) return 'leads';
  if (/\b(timeline|sequence|chronology)\b/.test(current)) return 'timeline';
  if (/\b(socio|demographic|age|gender|occupation|caste|religion|social)\b/.test(current)) return 'socio-demographic';
  if (/\b(financial|transaction|account|money trail|bank|upi)\b/.test(current)) return 'financial';
  if (/\b(repeat|habitual|history|criminal history|prior)\b/.test(text)) return 'repeat-offenders';
  if (/\b(network|linked|association|associate|ring|gang|co accused|relationship)\b/.test(text)) return 'network';
  if (/\b(hotspot|location|station|district|map|where|area)\b/.test(text)) return 'hotspots';
  if (/\b(trend|month|season|spike|compare|category|pattern|distribution)\b/.test(text)) return 'trends';
  if (/\b(profile|behaviour|behavior|modus|risk score|offender)\b/.test(text)) return 'profiling';
  if (/\b(summary|status|fir|case|crime no|case no)\b/.test(text)) return 'case-summary';
  if (/\b(prevent|forecast|early warning|predict|proactive)\b/.test(text)) return 'prevention';
  return 'overview';
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
  const actsById = byId(tables.Act, 'ActCode');
  const sectionsByAct = groupBy(tables.Section || [], (row) => String(row.ActCode));
  const accusedByCase = groupBy(accused, (row) => String(row.CaseMasterID));
  const victimsByCase = groupBy(tables.Victim || [], (row) => String(row.CaseMasterID));
  const complainantsByCase = groupBy(tables.ComplainantDetails || [], (row) => String(row.CaseMasterID));
  const arrestsByCase = groupBy(tables.ArrestSurrender || [], (row) => String(row.CaseMasterID));
  const chargesheetsByCase = groupBy(tables.ChargesheetDetails || [], (row) => String(row.CaseMasterID));
  const occurrenceByCase = byId(tables.Inv_OccuranceTime || [], 'CaseMasterID');
  const sectionsByCase = groupBy(tables.ActSectionAssociation || [], (row) => String(row.CaseMasterID));
  const casesById = byId(cases, 'CaseMasterID');
  return {
    payload, tables, cases, accused, unitsById, districtsById, headsById, subHeadsById,
    statusesById, gravitiesById, actsById, sectionsByAct, accusedByCase, victimsByCase,
    complainantsByCase, arrestsByCase, chargesheetsByCase, occurrenceByCase, sectionsByCase,
    casesById,
  };
}

function caseProfile(item, context) {
  const unit = context.unitsById.get(String(item.PoliceStationID));
  const district = context.districtsById.get(String(unit?.DistrictID));
  const head = context.headsById.get(String(item.CrimeMajorHeadID));
  const subHead = context.subHeadsById.get(String(item.CrimeMinorHeadID));
  const status = context.statusesById.get(String(item.CaseStatusID));
  const gravity = context.gravitiesById.get(String(item.GravityOffenceID));
  const accused = context.accusedByCase.get(String(item.CaseMasterID)) || [];
  const victims = context.victimsByCase.get(String(item.CaseMasterID)) || [];
  const complainants = context.complainantsByCase.get(String(item.CaseMasterID)) || [];
  const occurrence = context.occurrenceByCase.get(String(item.CaseMasterID));
  const sections = context.sectionsByCase.get(String(item.CaseMasterID)) || [];
  return { item, unit, district, head, subHead, status, gravity, accused, victims, complainants, occurrence, sections };
}

function caseReference(item, context, prefix = 'FIR') {
  const profile = caseProfile(item, context);
  const sectionText = profile.sections.slice(0, 2).map((section) => `${section.ActID}-${section.SectionID}`).join(', ');
  return {
    type: prefix,
    id: String(item.CaseNo || item.CrimeNo || item.CaseMasterID),
    title: profile.subHead?.CrimeHeadName || 'Registered incident',
    detail: compact([
      profile.district?.DistrictName || profile.unit?.UnitName,
      profile.status?.CaseStatusName,
      profile.gravity?.LookupValue,
      `${profile.accused.length} accused`,
      `${profile.victims.length} victim${profile.victims.length === 1 ? '' : 's'}`,
      sectionText && `Sections ${sectionText}`,
    ]).join(' | '),
  };
}

function searchableText(item, context) {
  const profile = caseProfile(item, context);
  return [
    item.CaseNo, item.CrimeNo, item.BriefFacts, item.CrimeRegisteredDate,
    profile.unit?.UnitName, profile.district?.DistrictName, profile.head?.CrimeGroupName,
    profile.subHead?.CrimeHeadName, profile.status?.CaseStatusName, profile.gravity?.LookupValue,
    profile.occurrence?.PlaceOfOccurrence,
    ...profile.accused.map((row) => row.AccusedName),
    ...profile.victims.map((row) => row.VictimName),
    ...profile.complainants.map((row) => row.ComplainantName),
    ...profile.sections.map((row) => `${row.ActID} ${row.SectionID}`),
  ].join(' ');
}

function findMatchingCases(query, context) {
  const queryTokens = tokens(query);
  const exact = normalize(query).match(/\b(?:fir|crime|case)?\s*([a-z]{0,4}[-/]?\d{2,}[-/]?\d{0,4})\b/i)?.[1];
  const results = [];
  for (const item of context.cases) {
    const haystack = normalize(searchableText(item, context));
    let score = 0;
    for (const token of queryTokens) if (haystack.includes(token)) score += 2;
    if (exact && haystack.includes(normalize(exact))) score += 12;
    if (score > 0) results.push({ item, score });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 8).map((entry) => entry.item);
}

function focusCase(query, context) {
  return findMatchingCases(query, context)[0] || context.cases[0];
}

function similarityScore(target, candidate, context) {
  if (!target || !candidate || target.CaseMasterID === candidate.CaseMasterID) return 0;
  const targetProfile = caseProfile(target, context);
  const candidateProfile = caseProfile(candidate, context);
  let score = 0;
  if (target.CrimeMajorHeadID === candidate.CrimeMajorHeadID) score += 25;
  if (target.CrimeMinorHeadID === candidate.CrimeMinorHeadID) score += 30;
  if (target.PoliceStationID === candidate.PoliceStationID) score += 12;
  if (targetProfile.district?.DistrictID === candidateProfile.district?.DistrictID) score += 8;
  if (target.GravityOffenceID === candidate.GravityOffenceID) score += 10;
  const targetTerms = new Set(tokens(target.BriefFacts));
  const candidateTerms = new Set(tokens(candidate.BriefFacts));
  for (const term of targetTerms) if (candidateTerms.has(term)) score += 3;
  return score;
}

function similarCases(target, context, limit = 5) {
  return context.cases
    .map((item) => ({ item, score: similarityScore(target, item, context) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function repeatGroups(context) {
  return [...groupBy(context.accused, (row) => normalize(row.AccusedName)).entries()]
    .map(([key, rows]) => {
      const caseIds = [...new Set(rows.map((row) => String(row.CaseMasterID)))];
      return { key, rows, caseIds, name: rows[0]?.AccusedName };
    })
    .filter((group) => group.caseIds.length > 1)
    .sort((a, b) => b.caseIds.length - a.caseIds.length);
}

function repeatOffenderAnswer(context) {
  const groups = repeatGroups(context).slice(0, 4);
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
  const districts = new Set(linkedCases.map((item) => caseProfile(item, context).district?.DistrictName).filter(Boolean));
  return {
    intent: 'repeat-offenders',
    confidence: 'High',
    answer: `${top.name} is the strongest repeat-offender signal, appearing across ${top.caseIds.length} distinct FIRs in ${districts.size || 1} district context${districts.size === 1 ? '' : 's'}. This is a good candidate for habitual-offender review and associate mapping.`,
    metrics: [
      { label: 'Repeat entities', value: groups.length },
      { label: 'Top linked FIRs', value: top.caseIds.length },
      { label: 'District spread', value: districts.size || 1 },
    ],
    references: linkedCases.slice(0, 4).map((item) => caseReference(item, context)),
    reasoning: [
      'Grouped accused records by normalized name.',
      'Counted distinct FIRs and district spread per accused entity.',
      'Ranked entities by linked-case volume and exposed FIR evidence.',
    ],
    followUps: ['Suggest investigative leads', 'Find similar cases', 'Open the network for this pattern'],
  };
}

function networkAnswer(context) {
  const people = context.payload.network.nodes.filter((node) => node.kind === 'Person');
  const top = people[0];
  return {
    intent: 'network',
    confidence: people.length ? 'High' : 'Medium',
    answer: people.length
      ? `The relationship graph contains ${people.length} repeat accused nodes and ${context.payload.network.edges.length} evidence links. The highest-risk node is ${top.label}, scored at ${top.risk}/100 from repeated FIR associations.`
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
    followUps: ['Show repeat offender details', 'Which FIRs connect this group?', 'Suggest investigative leads'],
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
    followUps: ['Compare this by crime category', 'Show prevention recommendations', 'Which accused are linked nearby?'],
  };
}

function trendAnswer(context) {
  const trend = context.payload.analytics.trend;
  const peak = [...trend].sort((a, b) => b.incidents - a.incidents)[0];
  const topCategory = context.payload.analytics.categories[0];
  return {
    intent: 'trends',
    confidence: 'High',
    answer: `${peak?.name || 'The current period'} has the highest registered volume with ${peak?.incidents || 0} incidents. ${topCategory?.label || 'The leading category'} is the dominant category with ${topCategory?.value || 0} FIRs, so analysis should drill into that category's hotspot and repeat-offender overlap.`,
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

function similarCasesAnswer(query, context) {
  const target = focusCase(query, context);
  const profile = caseProfile(target, context);
  const matches = similarCases(target, context, 5);
  return {
    intent: 'similar-cases',
    confidence: matches.length ? 'High' : 'Medium',
    answer: `Using ${target.CaseNo || target.CrimeNo} as the focus FIR, I found ${matches.length} similar case${matches.length === 1 ? '' : 's'} based on crime head, sub-head, station/district, offence gravity, and fact-pattern terms. The strongest comparator shares ${profile.subHead?.CrimeHeadName || 'the same incident class'} context.`,
    metrics: [
      { label: 'Focus FIR', value: target.CaseNo || target.CrimeNo },
      { label: 'Similar FIRs', value: matches.length },
      { label: 'Category', value: categoryKey(profile.head?.CrimeGroupName) },
    ],
    references: [caseReference(target, context, 'Focus'), ...matches.slice(0, 4).map((entry) => caseReference(entry.item, context, 'Similar'))],
    reasoning: [
      'Selected the best focus FIR from the query.',
      'Scored every other FIR by category, sub-head, geography, gravity, and fact-token overlap.',
      'Ranked the highest similarity scores for investigator comparison.',
    ],
    followUps: ['Suggest investigative leads', 'Build investigation timeline', 'Show linked accused'],
  };
}

function timelineAnswer(query, context) {
  const target = focusCase(query, context);
  const profile = caseProfile(target, context);
  const arrests = context.arrestsByCase.get(String(target.CaseMasterID)) || [];
  const chargesheets = context.chargesheetsByCase.get(String(target.CaseMasterID)) || [];
  const events = [
    { label: 'Incident window opened', value: target.IncidentFromDate || profile.occurrence?.IncidentFromDate },
    { label: 'Incident window closed', value: target.IncidentToDate || profile.occurrence?.IncidentToDate },
    { label: 'Information received at PS', value: target.InfoReceivedPSDate },
    { label: 'FIR registered', value: target.CrimeRegisteredDate },
    ...arrests.slice(0, 2).map((row) => ({ label: 'Arrest/surrender recorded', value: row.ArrestSurrenderDate })),
    ...chargesheets.slice(0, 2).map((row) => ({ label: 'Charge-sheet filed', value: row.csdate })),
  ].filter((event) => event.value);
  return {
    intent: 'timeline',
    confidence: events.length > 2 ? 'High' : 'Medium',
    answer: `${target.CaseNo || target.CrimeNo} has ${events.length} timeline event${events.length === 1 ? '' : 's'} available. Current status is ${profile.status?.CaseStatusName || 'recorded'}, with ${arrests.length} arrest/surrender record${arrests.length === 1 ? '' : 's'} and ${chargesheets.length} charge-sheet record${chargesheets.length === 1 ? '' : 's'}.`,
    metrics: [
      { label: 'Timeline events', value: events.length },
      { label: 'Arrests', value: arrests.length },
      { label: 'Chargesheets', value: chargesheets.length },
    ],
    references: [
      caseReference(target, context, 'FIR'),
      ...events.slice(0, 4).map((event, index) => ({
        type: 'Event',
        id: String(index + 1),
        title: event.label,
        detail: String(event.value),
      })),
    ],
    reasoning: [
      'Selected a focus FIR from the query.',
      'Merged incident, registration, arrest, and charge-sheet dates.',
      'Sorted the available case-file milestones into an investigation chronology.',
    ],
    followUps: ['Find similar FIRs', 'Suggest next investigative steps', 'Show linked accused'],
  };
}

function leadsAnswer(query, context) {
  const target = focusCase(query, context);
  const profile = caseProfile(target, context);
  const repeats = repeatGroups(context);
  const similar = similarCases(target, context, 3);
  const hotspot = context.payload.hotspots.find((spot) => spot.station === profile.unit?.UnitName) || context.payload.hotspots[0];
  const repeatNames = new Set(repeats.slice(0, 6).map((group) => normalize(group.name)));
  const linkedRepeatAccused = profile.accused.filter((row) => repeatNames.has(normalize(row.AccusedName)));
  return {
    intent: 'leads',
    confidence: 'Medium',
    answer: `For ${target.CaseNo || target.CrimeNo}, the strongest leads are: check ${similar.length} similar FIR outcomes, review ${profile.accused.length} accused profile${profile.accused.length === 1 ? '' : 's'}, verify activity around ${profile.unit?.UnitName || 'the registering station'}, and prioritize ${linkedRepeatAccused.length || repeats.length} repeat-offender signal${(linkedRepeatAccused.length || repeats.length) === 1 ? '' : 's'}.`,
    metrics: [
      { label: 'Similar FIRs', value: similar.length },
      { label: 'Accused in FIR', value: profile.accused.length },
      { label: 'Station risk', value: hotspot?.risk || '-' },
    ],
    references: [
      caseReference(target, context, 'Focus'),
      ...similar.map((entry) => caseReference(entry.item, context, 'Lead')),
      ...(hotspot ? [{ type: 'Hotspot', id: hotspot.id, title: hotspot.station, detail: `${hotspot.cases} FIRs | ${hotspot.risk}` }] : []),
    ].slice(0, 5),
    reasoning: [
      'Selected the most relevant FIR from the query.',
      'Compared it with similar past cases for reusable investigation paths.',
      'Cross-checked accused, station hotspot pressure, and repeat-offender signals.',
    ],
    followUps: ['Build investigation timeline', 'Show similar FIRs', 'Profile the accused'],
  };
}

function socioDemographicAnswer(context) {
  const victims = context.tables.Victim || [];
  const complainants = context.tables.ComplainantDetails || [];
  const accused = context.accused || [];
  const accusedAge = avg(accused, 'AgeYear');
  const victimAge = avg(victims, 'AgeYear');
  const complainantAge = avg(complainants, 'AgeYear');
  const youthAccused = accused.filter((row) => number(row.AgeYear) && number(row.AgeYear) < 30).length;
  const casesWithVictims = new Set(victims.map((row) => String(row.CaseMasterID))).size;
  return {
    intent: 'socio-demographic',
    confidence: victims.length || complainants.length ? 'Medium' : 'Low',
    answer: `The local dataset has demographic coverage for ${accused.length} accused, ${victims.length} victims, and ${complainants.length} complainants. Average accused age is ${accusedAge || 'not available'}, average victim age is ${victimAge || 'not available'}, and ${youthAccused} accused records are under 30, which is useful for youth-risk and repeat-offender prevention analysis.`,
    metrics: [
      { label: 'Avg accused age', value: accusedAge || '-' },
      { label: 'Avg victim age', value: victimAge || '-' },
      { label: 'Youth accused', value: youthAccused },
    ],
    references: [
      { type: 'Dataset', id: 'Victim', title: 'Victim demographics', detail: `${victims.length} records across ${casesWithVictims} FIRs` },
      { type: 'Dataset', id: 'Complainant', title: 'Complainant demographics', detail: `${complainants.length} records | avg age ${complainantAge || 'not available'}` },
      { type: 'Dataset', id: 'Accused', title: 'Accused demographics', detail: `${accused.length} records | avg age ${accusedAge || 'not available'}` },
    ],
    reasoning: [
      'Read accused, victim, and complainant demographic tables.',
      'Computed average ages and youth accused count.',
      'Converted demographic coverage into prevention-oriented social indicators.',
    ],
    followUps: ['Compare demographics by crime category', 'Show prevention intelligence', 'Profile repeat offenders'],
  };
}

function financialAnswer(context) {
  const financialCases = context.cases.filter((item) => categoryKey(context.headsById.get(String(item.CrimeMajorHeadID))?.CrimeGroupName) === 'financial');
  const cyberCases = context.cases.filter((item) => categoryKey(context.headsById.get(String(item.CrimeMajorHeadID))?.CrimeGroupName) === 'cyber');
  return {
    intent: 'financial',
    confidence: 'Medium',
    answer: `The current crime schema identifies ${financialCases.length} financial FIRs and ${cyberCases.length} cyber FIRs, but it does not yet include bank-account or transaction tables. For now, financial intelligence can rank FIRs and linked accused; true money-trail analysis needs transaction/account entities added to Catalyst.`,
    metrics: [
      { label: 'Financial FIRs', value: financialCases.length },
      { label: 'Cyber FIRs', value: cyberCases.length },
      { label: 'Transaction rows', value: 0 },
    ],
    references: financialCases.slice(0, 4).map((item) => caseReference(item, context, 'Financial')),
    reasoning: [
      'Filtered FIRs by financial and cyber crime heads.',
      'Checked available schema scope for account or transaction evidence.',
      'Separated current FIR intelligence from future money-trail requirements.',
    ],
    followUps: ['Add financial transaction schema', 'Find similar financial FIRs', 'Show cyber hotspots'],
  };
}

function profilingAnswer(context) {
  const repeats = repeatGroups(context);
  const severeCases = context.cases
    .filter((item) => number(item.GravityOffenceID) === 1)
    .sort((a, b) => String(b.CrimeRegisteredDate).localeCompare(String(a.CrimeRegisteredDate)))
    .slice(0, 4);
  const topRepeat = repeats[0];
  return {
    intent: 'profiling',
    confidence: 'Medium',
    answer: `The offender profile combines repeat appearances, offence gravity, geography, and recency. ${repeats.length} repeat entities and ${context.payload.summary.highPriority} high-priority FIRs should be reviewed first; ${topRepeat?.name || 'the leading repeat entity'} is the primary watch-list candidate.`,
    metrics: [
      { label: 'Repeat entities', value: repeats.length },
      { label: 'High priority FIRs', value: context.payload.summary.highPriority },
      { label: 'Arrests', value: context.payload.summary.arrests },
    ],
    references: severeCases.map((item) => caseReference(item, context)),
    reasoning: [
      'Used repeat accused links as habitual-offender evidence.',
      'Used offence gravity and recency as risk-prioritization evidence.',
      'Used station/district spread to separate local repetition from wider mobility.',
    ],
    followUps: ['List repeat offenders', 'Suggest investigative leads', 'Find similar cases'],
  };
}

function caseSummaryAnswer(query, context) {
  const matches = findMatchingCases(query, context);
  const cases = matches.length ? matches.slice(0, 5) : context.cases.slice(0, 4);
  const first = cases[0];
  const profile = first ? caseProfile(first, context) : null;
  return {
    intent: 'case-summary',
    confidence: matches.length ? 'High' : 'Medium',
    answer: first
      ? `I found ${cases.length} relevant FIR record${cases.length === 1 ? '' : 's'}. Strongest match: ${first.CaseNo || first.CrimeNo}, ${profile.subHead?.CrimeHeadName || 'registered incident'}, filed at ${profile.unit?.UnitName || 'the registering station'} with status ${profile.status?.CaseStatusName || 'available in the case register'}.`
      : 'No FIR records are available in the current working set.',
    metrics: [
      { label: 'Matched FIRs', value: cases.length },
      { label: 'Accused in top FIR', value: profile?.accused.length || 0 },
      { label: 'Victims in top FIR', value: profile?.victims.length || 0 },
    ],
    references: cases.map((item) => caseReference(item, context)),
    reasoning: [
      'Searched FIR number, crime number, facts, station, district, crime head, people, and sections.',
      'Ranked matches by query-token overlap and exact case identifiers.',
      'Returned concise FIR evidence for investigator review.',
    ],
    followUps: ['Show similar FIRs', 'Build investigation timeline', 'Suggest investigative leads'],
  };
}

function preventionAnswer(context) {
  const critical = context.payload.hotspots.filter((spot) => spot.risk === 'Critical');
  const elevated = context.payload.hotspots.filter((spot) => spot.risk === 'Elevated');
  const topCategory = context.payload.analytics.categories[0];
  const topHotspot = context.payload.hotspots[0];
  const repeats = repeatGroups(context);
  return {
    intent: 'prevention',
    confidence: 'Medium',
    answer: `Early warning should focus on ${topHotspot?.station || 'the highest-volume station'}, ${topCategory?.label || 'the leading category'} offences, and the top ${Math.min(repeats.length, 5)} repeat-offender signal${Math.min(repeats.length, 5) === 1 ? '' : 's'}. Current prevention logic flags ${critical.length} critical and ${elevated.length} elevated station clusters for patrol planning and offender checks.`,
    metrics: [
      { label: 'Critical clusters', value: critical.length },
      { label: 'Elevated clusters', value: elevated.length },
      { label: 'Repeat entities', value: repeats.length },
    ],
    references: context.payload.hotspots.slice(0, 4).map((spot) => ({
      type: 'Prevention',
      id: spot.id,
      title: spot.station,
      detail: `${spot.risk} | ${spot.cases} FIRs | ${spot.change}`,
    })),
    reasoning: [
      'Ranked station clusters by case volume and heinous-case count.',
      'Combined category pressure with repeat-offender signals.',
      'Converted analytics signals into operational prevention recommendations.',
    ],
    followUps: ['Generate station action plan', 'Show monthly trend', 'Which accused are linked nearby?'],
  };
}

function languageAnswer(context) {
  return {
    intent: 'language',
    confidence: 'Low',
    answer: 'Kannada support is planned, but this local prototype currently answers in English. The intelligence layer is structured so a translation step can be added before and after the evidence-grounded query.',
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
    answer: `The current working set contains ${context.payload.summary.totalCases} FIRs, ${context.payload.summary.underInvestigation} under investigation, ${context.payload.summary.chargeSheeted} charge-sheeted, ${context.payload.summary.arrests} arrest records, and ${context.payload.summary.highPriority} high-priority matters. I can now retrieve FIRs, compare similar cases, build timelines, suggest leads, profile repeat offenders, and explain hotspot or demographic patterns.`,
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
      'Read the live intelligence aggregate and supporting case-file tables.',
      'Summarized investigation status, enforcement action, and priority load.',
    ],
    followUps: ['Find similar cases', 'Suggest investigative leads', 'Show socio-demographic insights'],
  };
}

function answerQuery(query, payload, tables, history = []) {
  const recentHistory = (Array.isArray(history) ? history : [])
    .slice(-6)
    .map((message) => message.text || message.content || '')
    .join(' ');
  const context = buildContext(payload, tables);
  const intent = detectIntent(query, recentHistory);

  const handlers = {
    'repeat-offenders': () => repeatOffenderAnswer(context),
    network: () => networkAnswer(context),
    hotspots: () => hotspotAnswer(context),
    trends: () => trendAnswer(context),
    profiling: () => profilingAnswer(context),
    'case-summary': () => caseSummaryAnswer(query, context),
    'similar-cases': () => similarCasesAnswer(query, context),
    timeline: () => timelineAnswer(query, context),
    leads: () => leadsAnswer(query, context),
    'socio-demographic': () => socioDemographicAnswer(context),
    financial: () => financialAnswer(context),
    prevention: () => preventionAnswer(context),
    language: () => languageAnswer(context),
    overview: () => overviewAnswer(context),
  };

  const response = handlers[intent]();
  console.warn('Fallback activated because: Frontend is routing to the legacy api_service instead of the new backend. No Catalyst exception occurred.');
  response.answer += ' (Answer provided by local fallback model).';

  return {
    ...response,
    generatedAt: payload.generatedAt,
    source: payload.source,
  };
}

module.exports = { answerQuery };
