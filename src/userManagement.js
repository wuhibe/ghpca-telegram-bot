require('dotenv').config();

const {
  createUser,
  findUserById,
  updateUserStatus,
} = require('../models/user');
const { sendMessage } = require('./telegram');

const adminID = process.env.ADMIN_ID;

async function isValidUser(id) {
  let user = await findUserById(id);
  if (!user) {
    return 0;
  }
  return user.status;
}

async function getUser(id) {
  let user = await findUserById(id);
  if (user) {
    return user;
  }
  return null;
}

async function addUser(id, username, first_name) {
  let user = await findUserById(id);
  if (!user) {
    let u = {
      id,
      username,
      first_name,
      status: 1,
    };
    createUser(u);
  } else {
    updateUserStatus(id, 1);
  }
}

function adminAddUser(userId, first_name, username) {
  sendMessage(
    adminID,
    `${first_name}(@${username}) is trying to use the bot.\nDo you wish to add this user?`,
    [
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
      ],
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
    updateUserStatus(id, -1);
  }
}

module.exports = {
  isValidUser,
  getUser,
  addUser,
  adminAddUser,
  blacklistUser,
};
