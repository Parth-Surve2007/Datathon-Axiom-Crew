'use strict';

process.env.LOCAL_API_ONLY = 'true';

const express = require('express');
const api = require('./index');

const port = Number(process.env.PORT || 3001);
const app = express();

app.use('/server/api_service', api);
app.use('/', api);

app.listen(port, () => {
  console.log(`Local crime intelligence API running at http://localhost:${port}/server/api_service`);
});
