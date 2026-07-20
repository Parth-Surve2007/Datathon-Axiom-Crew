'use strict';

function answerQuery(query, payload) {
  const text = String(query || '').toLowerCase();
  const { summary, hotspots, investigations, analytics } = payload;
  if (text.includes('repeat') || text.includes('linked') || text.includes('network')) {
    const repeatPeople = payload.network.nodes.filter((node) => node.kind === 'Person').slice(0, 3);
    return repeatPeople.length
      ? `The live accused register shows ${repeatPeople.length} leading repeat entities: ${repeatPeople.map((node) => node.label).join(', ')}. Open the network view to inspect their linked FIRs.`
      : 'No repeat accused entities are present in the current Data Store result.';
  }
  if (text.includes('station') || text.includes('location') || text.includes('hotspot')) {
    const top = hotspots[0];
    return top
      ? `${top.station} is the highest-volume live cluster with ${top.cases} registered cases. Its current risk band is ${top.risk.toLowerCase()}.`
      : 'No geocoded station clusters are available in the current Data Store result.';
  }
  if (text.includes('category') || text.includes('crime') || text.includes('trend')) {
    const top = analytics.categories[0];
    return top
      ? `${top.label} is the largest recorded category at ${top.value} incidents. The dataset contains ${summary.totalCases} FIRs in total.`
      : `The dataset contains ${summary.totalCases} FIRs, with no category metadata available.`;
  }
  const recent = investigations[0];
  return `Live Data Store check complete: ${summary.totalCases} FIRs, ${summary.underInvestigation} under investigation, ${summary.chargeSheeted} charge-sheeted, and ${summary.arrests} arrest records.${recent ? ` The latest indexed FIR is ${recent.id}.` : ''}`;
}

module.exports = { answerQuery };
