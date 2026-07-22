'use strict';
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { createApp } = require('./src/app');

module.exports = createApp();
