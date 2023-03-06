require('dotenv').config();

const { sendMessage, editMessage } = require('./telegram');

const {
  addUser,
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
    sendMessage(adminID, JSON.stringify(e));
  }
}

async function processCommands(userId, first_name, username, text) {
  if (text == '/start') {
    if ((await isValidUser(userId)) == 1)
      sendMessage(
        userId,
        'Welcome to the bot. Select /help to see the available commands.'
      );
    else if ((await isValidUser(userId)) == 0) {
      sendMessage(userId, 'You are not registered to use this bot.');
      adminAddUser(userId, first_name, username);
    } else {
      sendMessage(userId, 'You are blocked from using this bot.');
    }
  } else if (text == '/help') {
    sendMessage(userId, 'Available commands:\n\t/start\n\t/help\n\t/addRecord');
  } else if (text == '/addRecord') {
    addNewRecord(userId);
  } else {
    sendMessage(
      userId,
      'Unknown command. Select /help to see the available commands.'
    );
  }
  return;
}

async function handleCallbacks(data) {
  let message = data.callback_query.data;
  let userId = data.callback_query.message.chat.id;
  let msg = data.callback_query.message.message_id;

  editMessage(userId, msg, data.callback_query.message.text, []);

  if (message.startsWith('addUser')) {
    let id = message.split('_')[1];
    let callbackUsername = message.split('_')[2];
    let callbackFname = message.split('_')[3];
    await addUser(+id, callbackUsername, callbackFname);
    sendMessage(
      adminID,
      `User ${callbackFname}(@${callbackUsername}) is added.`
    );
    sendMessage(userId, 'You can now use the bot.');
  } else if (message.startsWith('blacklistUser')) {
    let id = message.split('_')[1];
    let callbackUsername = message.split('_')[2];
    let callbackFname = message.split('_')[3];
    await blacklistUser(+id, callbackUsername, callbackFname);
    sendMessage(
      adminID,
      `User ${callbackFname}(@${callbackUsername}) is blocked.`
    );
    sendMessage(userId, 'You have been blocked.');
  } else if (message.startsWith('procedure')) {
    let procedure = message.split('_')[1];
    await updateSession(userId, procedure);
    chooseHospital(userId, msg);
  } else if (message.startsWith('hospital')) {
    let procedure = message.split('_')[1];
    let hospital = message.split('_')[2];
    await updateSession(userId, procedure, hospital);
    getPatient(userId);
  } else if (message.startsWith('addRecord')) {
    let id = message.split('_')[1];
    let name = message.split('_')[2];
    addRecord(id, msg, name);
  } else if (message.startsWith('cancelRecord')) {
    let id = message.split('_')[1];
    clearUserSession(id);
    sendMessage(id, 'Record cancelled');
  } else if (message.startsWith('ignore')) {
    return;
  } else {
    sendMessage(adminID, JSON.stringify(data));
    sendMessage(userId, 'Something went wrong. Please try again.');
    clearUserSession(userId);
  }
}

function addRecord(id, msg, patient) {
  // editMessage
  return;
}

function addNewRecord(id) {
  addSession(id);
  populateProcedures();

  sendMessage(
    id,
    'Please select a procedure:',
    PROCEDURES.map((item) => {
      return [{ text: item, callback_data: `procedure_${item}` }];
    })
  );
}

function recordMessage(id, text, date) {
  let session = getSession(id);
  let diff = date - Date.parse(session.date);

  // if its been >30 mins or the procedure hasn't been filled/doesn't exist
  if (
    Math.floor(diff / 1000 / 60) > 30 ||
    PROCEDURES.indexOf(session.procedure) == -1
  ) {
    clearUserSession(id);
    processCommands(id, '', '', '/help');
    return;
  }
  completeRecord(id, text);
}

function chooseHospital(procedure) {
  let p = getProcedure(procedure);
  if (p) {
    let hospitals = Object.keys(p);
    sendMessage(
      id,
      'Please select a hospital:',
      hospitals.map((item) => {
        return {
          text: item,
          callback_data: `hospital_${procedure}_${item}`,
        };
      })
    );
  } else {
    clearUserSession(id);
    sendMessage(
      id,
      'This Investigation/Service has been used up for this month.'
    );
  }
}

function completeRecord(id, name) {
  let session = getSession(id);
  sendMessage(
    id,
    `Do you want to add ${session.procedure} at ${session.hospital} for ${name}?`,
    [
      { text: 'Yes', callback_data: `addRecord_${id}_${name}` },
      { text: 'No', callback_data: `cancelRecord_${id}` },
    ]
  );
}

function getPatient(id) {
  sendMessage(id, `Please enter the patient's name:`);
}

module.exports = {
  parseRequest,
  handleCallbacks,
};
