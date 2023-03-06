const axios = require('axios');
const mongoose = require('./database');
require('dotenv').config();

let sheetsUrl = process.env.SHEETS_URI;

let PROCEDURES = [];

async function loadProcedures() {
  let response = await axios.get(`${sheetsUrl}?route=procedures`);
  PROCEDURES = await response;
  return PROCEDURES;
}

module.exports = {
  loadProcedures,
  PROCEDURES,
};
