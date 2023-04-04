require('dotenv').config();

const Telegram = require('./Telegram/telegram');
const { createRecord } = require('./recordData');

const {
  addUser,
  getUser,
  isValidUser,
  adminAddUser,
  blacklistUser,
} = require('./userManagement');

const {
  addSession,
  getSession,
  clearUserSession,
  updateSession,
} = require('./sessionManagement');

const {
  allProcedures,
  updateProcedureCount,
  getProcedureDetail,
} = require('../models/procedures');

const adminID = process.env.ADMIN_ID;

async function parseRequest(data) {
  try {
    var text = data.message.text;
    var userId = data.message.chat.id;
    var first_name = data.message.chat.first_name;
    var username = data.message.chat.username;

    if (text.startsWith('/')) {
      return processCommands(userId, first_name, username, text);
    } else if ((await isValidUser(userId)) != 1) {
      return;
    }
    recordMessage(userId, text, new Date());
  } catch (e) {
    Telegram.sendMessage(adminID, JSON.stringify(e));
  }
}

async function processCommands(userId, first_name, username, text) {
  text = text.toLowerCase();
  switch (text) {
    case '/start':
      if ((await isValidUser(userId)) == 1)
        Telegram.sendMessage(
          userId,
          'Welcome to the bot. Select /help to see the available commands.'
        );
      else if ((await isValidUser(userId)) == 0) {
        Telegram.sendMessage(userId, 'You are not registered to use this bot.');
        adminAddUser(userId, first_name, username);
      } else {
        Telegram.sendMessage(userId, 'You are blocked from using this bot.');
      }
      break;
    case '/help':
      Telegram.sendMessage(userId, 'Available commands:\n\t/start\n\t/help\n\t/addrecord');
      break;
    case '/addrecord':
      addNewRecord(userId);
      break;
    default:
      Telegram.sendMessage(
        userId,
        'Unknown command. Select /help to see the available commands.'
      );
  }
}

async function handleCallbacks(data) {
  let message = data.callback_query.data;
  let userId = data.callback_query.message.chat.id;
  let msg = data.callback_query.message.message_id;

  Telegram.editMessage(userId, msg, data.callback_query.message.text, []);

  const cb_data = message.split('_@@_');
  if (message.startsWith('addUser')) {
    let [_, id, callbackUsername, callbackFname] = cb_data;
    await addUser(+id, callbackUsername, callbackFname);
    Telegram.sendMessage(
      adminID,
      `User ${callbackFname}(@${callbackUsername}) is added.`
    );
    Telegram.sendMessage(id, 'You can now use the bot.');
  } else if (message.startsWith('blacklistUser')) {
    let [_, id, callbackUsername, callbackFname] = cb_data;
    await blacklistUser(+id, callbackUsername, callbackFname);
    Telegram.sendMessage(
      adminID,
      `User ${callbackFname}(@${callbackUsername}) is blocked.`
    );
    Telegram.sendMessage(id, 'You have been blocked.');
  } else if (message.startsWith('procedure')) {
    let procedure = cb_data[1];
    await updateSession(userId, procedure);
    chooseHospital(userId, msg, procedure);
  } else if (message.startsWith('hospital')) {
    let [_, procedure, hospital] = cb_data;
    await updateSession(userId, procedure, hospital);
    getPatient(userId);
  } else if (message.startsWith('addrecord')) {
    let [_, id, name] = cb_data;
    await addRecord(id, name);
    clearUserSession(id);
  } else if (message.startsWith('cancelRecord')) {
    let id = cb_data[1];
    await clearUserSession(id);
    Telegram.sendMessage(id, 'Record cancelled');
  } else if (message.startsWith('ignore')) {
    return;
  } else {
    Telegram.sendMessage(adminID, JSON.stringify(data));
    Telegram.sendMessage(userId, 'Something went wrong. Please try again.');
    clearUserSession(userId);
  }
}

async function addRecord(id, patient) {
  let session = await getSession(id);
  if (session) {
    let user = await getUser(id);
    let record = {
      date: new Date(),
      first_name: user.first_name,
      username: user.username,
      patient,
      procedure: session.procedure,
      hospital: session.hospital,
    };
    createRecord(record);
    updateProcedureCount(session.procedure, session.hospital);
    Telegram.sendMessage(id, 'Record added successfully.');
  } else {
    Telegram.sendMessage(id, 'Something went wrong. Please try again.');
  }
}

async function addNewRecord(id) {
  addSession(id);
  let procedures = await allProcedures();

  if (procedures && procedures.length != 0) {
    let callBacks = [];
    let sa = [];
    for (let i = 0; i < procedures.length; i++) {
      sa.push({
        text: procedures[i],
        callback_data: `procedure_@@_${procedures[i]}`,
      });
      if (i != 0 && i % 3 == 0) {
        callBacks.push(sa);
        sa = [];
      }
    }
    if (sa.length != 0) callBacks.push(sa);

    Telegram.sendMessage(id, 'Please select a procedure:', callBacks);
  } else {
    Telegram.sendMessage(id, "Something isn't right. Please try again later.");
  }
}

async function recordMessage(id, text, date) {
  let session = await getSession(id);
  if (session && session.procedure && session.hospital) {
    let diff = date - Date.parse(session.date);

    // if its been >30 mins
    if (Math.floor(diff / 1000 / 60) > 30) {
      clearUserSession(id);
      processCommands(id, '', '', '/help');
      return;
    }
    await completeRecord(session.id, text);
  } else {
    Telegram.sendMessage(
      id,
      'Unknown command. Select /help to see the available commands.'
    );
  }
}

async function chooseHospital(id, msg, procedure) {
  let hospitals = await getProcedureDetail(procedure);
  if (hospitals && hospitals.length > 0) {
    Telegram.editMessage(
      id,
      msg,
      'Please select a hospital:',
      hospitals.map((name) => {
        return [
          {
            text: name,
            callback_data: `hospital_@@_${procedure}_@@_${name}`,
          },
        ];
      })
    );
  } else {
    clearUserSession(id);
    Telegram.editMessage(
      id,
      msg,
      'This Investigation/Service has been used up for this month.'
    );
  }
}

async function completeRecord(id, name) {
  let session = await getSession(id);
  Telegram.sendMessage(
    id,
    `Do you want to add ${session.procedure} at ${session.hospital} for ${name}?`,
    [
      [
        { text: 'Yes', callback_data: `addrecord_@@_${id}_@@_${name}` },
        { text: 'No', callback_data: `cancelRecord_@@_${id}` },
      ]
    ]
  );
}

function getPatient(id) {
  Telegram.sendMessage(id, `Please enter the patient's name:`);
}

module.exports = {
  parseRequest,
  handleCallbacks,
  addNewRecord,
};
