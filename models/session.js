const mongoose = require('./database');

let sessionSchema = new mongoose.Schema({
  id: Number,
  date: Date,
  procedure: String,
  hospital: String,
});
let Session = mongoose.model('Session', sessionSchema);

const createSession = (session) => {
  let usr = new Session(session);
  usr.save();
};

const findSessionById = async (id) => {
  return await Session.find({ id: id })
    .then((p) => p)
    .catch((err) => null);
};

const removeSessionById = (id) => {
  Session.deleteMany({ id: id });
};

module.exports = {
  Session,
  createSession,
  findSessionById,
  removeSessionById,
};
