require('dotenv').config();

const {
  createSession,
  findSessionById,
  updateSessionById,
  removeSessionById,
} = require('../models/session');

async function getSession(id) {
  let session = await findSessionById(id);
  if (session) {
    return session;
  }
  return null;
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
    updateSessionById(id, procedure, hospital);
  }
}

async function clearUserSession(id) {
  await removeSessionById(id);
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
    updateSessionById(id, procedure, hospital);
  }
}

module.exports = {
  addSession,
  getSession,
  updateSession,
  clearUserSession,
};
