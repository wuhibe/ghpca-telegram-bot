require('dotenv').config();

const { createUser, findUserById } = require('../models/user');
const { sendMessage } = require('./telegram');

const adminID = process.env.ADMIN_ID;

async function isValidUser(id) {
  let user = await findUserById(id);
  if (!user || !user[0]) {
    return 0;
  }
  user = user[user.length - 1];
  return user.status;
}

async function getUser(id) {
  let user = await findUserById(id);
  if (!user || !user[0]) {
    user = user[user.length - 1];
    return user;
  }
  return null;
}

async function addUser(id, username, first_name) {
  let user = await findUserById(id);
  if (!user || !user[0]) {
    let u = {
      id,
      username,
      first_name,
      status: 1,
    };
    createUser(u);
  } else {
    user = user[0];
    user.status = 1;
    user.save();
  }
}

function adminAddUser(userId, first_name, username) {
  sendMessage(
    adminID,
    `${first_name}(@${username}) is trying to use the bot.\nDo you wish to add this user?`,
    [
      {
        text: 'Yes',
        callback_data: `addUser_${userId}_${username}_${first_name}`,
      },
      { text: 'No', callback_data: `ignore` },
      {
        text: 'Block',
        callback_data: `blacklistUser_${userId}_${username}_${first_name}`,
      },
    ]
  );
}

async function blacklistUser(id, username, first_name) {
  let user = await findUserById(id);
  if (!user) {
    user = {
      id,
      username,
      first_name,
      status: -1,
    };
    createUser(user);
  } else {
    user = user[0];
    user.status = -1;
    user.save();
  }
}

module.exports = {
  isValidUser,
  getUser,
  addUser,
  adminAddUser,
  blacklistUser,
};
