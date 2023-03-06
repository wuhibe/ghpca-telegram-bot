require('dotenv').config();

const {
  createSession,
  findSessionById,
  updateSession,
  removeSessionById,
} = require('../models/session');

async function getSession(id) {
  let session = await findSessionById(id);
  if (!session || !session[0]) {
    return null;
  }
  return session[session.length - 1];
}

async function addSession(id, procedure = null, hospital = null) {
  let session = await findSessionById(id);
  if (!session) {
    session = {
      id,
      procedure,
      hospital,
      date: new Date(),
    };
    createSession(session);
  } else {
    updateSession(id, procedure, hospital);
  }
}

async function clearUserSession(id) {
  removeSessionById(id);
}

async function updateSession(id, procedure = null, hospital = null) {
  let session = await findSessionById(id);
  if (!session) {
    session = {
      id,
      procedure,
      hospital,
      date: new Date(),
    };
    createSession(session);
  } else {
    updateSession(id, procedure, hospital);
}

module.exports = {
  addSession,
  getSession,
  updateSession,
  clearUserSession,
};
