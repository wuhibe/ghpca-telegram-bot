require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  return await Session.findOne({ id: id })
    .then((p) => p)
    .catch((err) => null);
};

function updateSessionById(id, procedure = '', hospital = '') {
  Session.findOneAndUpdate(
    { id: id },
    { procedure: procedure, hospital: hospital, date: new Date() }
  )
    .then((p) => p)
    .catch((err) => null);
}

module.exports = {
  Session,
  createSession,
  findSessionById,
  updateSessionById,
  removeSessionById,
};
