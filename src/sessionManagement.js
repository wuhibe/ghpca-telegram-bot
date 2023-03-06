require('dotenv').config();

const {
  createSession,
  findSessionById,
  removeSessionById,
} = require('../models/session');

const { sendMessage } = require('./telegram');

const adminID = process.env.ADMIN_ID;

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
    session = session[0];
    session.date = new Date();
    session.save();
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
    session = session[0];
    session.date = new Date();
    session.procedure = procedure;
    session.hospital = hospital;
    session.save();
  }
}

module.exports = {
  addSession,
  getSession,
  updateSession,
  clearUserSession,
};
