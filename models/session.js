const mongoose = require('./database');

let sessionSchema = new mongoose.Schema({
  id: Number,
  date: Date,
  procedure: String,
  hospital: String,
});
let Session = mongoose.model('Session', sessionSchema);

const removeSessionById = (id) => {
  Session.deleteMany({ id: id });
};

const createSession = (session) => {
  removeSessionById(session.id);
  let newSession = new Session(session);
  newSession.save();
};

const findSessionById = async (id) => {
  return await Session.find({ id: id })
    .then((p) => p)
    .catch((err) => null);
};

function updateSession(id, procedure='', hospital='') {
  Session.findOneAndUpdate({ id: id }, { procedure: procedure, hospital: hospital, date: new Date() })
    .then((p) => p)
    .catch((err) => null);
}

module.exports = {
  Session,
  createSession,
  findSessionById,
  updateSession,
  removeSessionById,
};
