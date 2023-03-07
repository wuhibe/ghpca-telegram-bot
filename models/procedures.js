const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const sheetsUrl = process.env.SHEETS_URI;

let PROCEDURES = [];

let procedureSchema = new mongoose.Schema({
  name: String,
  hospital: String,
  count: Number,
});
let Procedure = mongoose.model('Procedure', procedureSchema);

async function loadProcedures() {
  let response = await axios.get(`${sheetsUrl}?route=procedures`);
  PROCEDURES = await response;
  return PROCEDURES;
}

async function loadTotalData() {
  let response = await axios.get(`${sheetsUrl}`);
  let data = (await response).data;
  let names = [];
  let procedures = [];
  for (let i = 1; i < data.length; i++) {
    for (let j = 1; j < data[i].length; j++) {
      if (data[i][j] && data[i][j] != [] && names.indexOf(data[0][j]) == -1) {
        let procedure = {
          name: data[0][j],
          hospital: data[i][0],
          count: data[i][j],
        };
        procedures.push(procedure);
        names.push(data[0][j]);
      }
    }
  }
  return procedures;
}

async function allProcedures() {
  let procs = await loadTotalData();
  procs.filter(async (p) => {
    let detail = await getProcedure(p.name, p.hospital);
    if (!detail) return p.count > 0;
    else return p.count - detail.count > 0;
  });
  return procs;
}

async function getProcedure(name, hospital) {
  return await Procedure.findOne({ name, hospital })
    .then((p) => p)
    .catch((err) => null);
}

async function getProcedureCount(name, hospital) {
  let procedure = await getProcedure(name, hospital);
  if (procedure) {
    return procedure[0].count;
  }
  return 0;
}

async function updateProcedureCount(name, hospital) {
  let procedure = await getProcedure(name, hospital);
  if (procedure) {
    procedure[0].count++;
    procedure[0].save();
  } else {
    procedure = new Procedure({
      name,
      hospital,
      count: 1,
    });
    procedure.save();
  }
}

module.exports = {
  loadProcedures,
  loadTotalData,
  allProcedures,
  getProcedure,
  getProcedureCount,
  updateProcedureCount,
  PROCEDURES,
};
