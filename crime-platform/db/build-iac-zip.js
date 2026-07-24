'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const REQUIRED_TABLES = [
  'State', 'District', 'UnitType', 'Unit', 'Rank', 'Designation', 'Employee',
  'CaseCategory', 'GravityOffence', 'CrimeHead', 'CrimeSubHead', 'Act', 'Section',
  'CrimeHeadActSection', 'Court', 'CaseStatusMaster', 'CasteMaster',
  'ReligionMaster', 'OccupationMaster', 'CaseMaster', 'Inv_OccuranceTime',
  'ComplainantDetails', 'ActSectionAssociation', 'Victim', 'Accused',
  'ArrestSurrender', 'inv_arrestsurrenderaccused', 'ChargesheetDetails'
];

const template = {
  name: "project-template",
  version: "1.0.0",
  parameters: {},
  components: {
    Pipelines: [],
    ApplicationAlerts: [],
    Stratus: [],
    Functions: [{
      type: "function",
      name: "api_service",
      properties: {
        stack: "node18",
        code: { path: "functions/api_service.zip" },
        configuration: { environment: { variables: {} }, memory: 256 },
        type: "applogic",
        name: "api_service"
      },
      dependsOn: []
    }],
    AddOnServices: [],
    WebClient: [{
      type: "client",
      name: "crime_platform_client",
      properties: {
        app_name: "crime_platform_client",
        code: { path: "webclient/crime_platform_client.zip" }
      },
      dependsOn: []
    }],
    Cron: [],
    SchedulingJobpool: [],
    Filestore: [],
    Mail: [],
    Zia: [],
    Datastore: REQUIRED_TABLES.map(table => ({
      type: "table",
      name: table,
      properties: { table_name: table },
      dependsOn: []
    }))
  }
};

const jsonPath = path.join(__dirname, '..', 'project-template-1.0.0.json');
fs.writeFileSync(jsonPath, JSON.stringify(template, null, 2), 'utf8');
console.log(`Generated project-template-1.0.0.json with ${REQUIRED_TABLES.length} tables.`);
