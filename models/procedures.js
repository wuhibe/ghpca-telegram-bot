const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const sheetsUrl = process.env.SHEETS_URI;

let PROCEDURES = [];
let update = new Date();

let procedureSchema = new mongoose.Schema({
  name: String,
  hospital: String,
  count: Number,
});
let Procedure = mongoose.model('Procedure', procedureSchema);

async function loadProcedures() {
  let response = await axios.get(`${sheetsUrl}?route=procedures`);
  PROCEDURES = (await response).data;
  update = new Date();
  return PROCEDURES;
}

async function allProcedures() {
  if (PROCEDURES.length != 0 && update - new Date() > 1000 * 60 * 60) {
    return PROCEDURES;
  }
  return await loadProcedures();
}

async function getProcedure(name, hospital = null) {
  return await Procedure.findOne({ name: name, hospital: hospital })
    .then((p) => p)
    .catch((err) => null);
}

async function getProcedureCount(name, hospital) {
  let procedure = await getProcedure(name, hospital);
  if (procedure) {
    return procedure.count;
  }
  return 0;
}

async function getProcedureDetail(procedure) {
  let response = await axios.get(`${sheetsUrl}?route=${procedure}`);
  let data = (await response).data;
  let hospitals = Object.keys(data);
  let h = [];
  for (let i = 0; i < hospitals.length; i++) {
    let detail = await getProcedure(procedure, hospitals[i]);
    if (detail && detail.count >= data[hospitals[i]]) {
      continue;
    }
    h.push(hospitals[i]);
  }
  return h;
}

async function updateProcedureCount(name, hospital) {
  let procedure = await getProcedure(name, hospital);
  if (procedure) {
    Procedure.findOneAndUpdate(
      { name: name, hospital: hospital },
      { count: procedure.count + 1 }
    )
      .then((p) => p)
      .catch((err) => null);
  } else {
    procedure = new Procedure({
      name: name,
      hospital: hospital,
      count: 1,
    });
    procedure.save();
  }
}

module.exports = {
  allProcedures,
  getProcedure,
  getProcedureDetail,
  getProcedureCount,
  updateProcedureCount,
};
