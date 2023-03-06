const { createUser, findUserById } = require("../models/user");


function isValidUser(id) {
    let user = findUserById(id);
    if (user == null) {
        return 0;
    }
    return user.status;
}

function addUser(id, username, first_name) {
    let user = {
        id, username, first_name,
        status: 1
    }
    createUser(user);
    return;
}

function adminAddUser(userId, first_name, username) {
    sendText(adminID,
      `${first_name}(@${username}) is trying to use the bot.\nDo you wish to add this user?`,
      [
        { "text": "Yes", "callback_data": `addUser_${userId}_${username}_${first_name}` },
        { "text": "No", "callback_data": `ignore` },
        { "text": "Block", "callback_data": `blacklistUser_${userId}_${username}_${first_name}` },
      ]);
  }

function blacklistUser(id, username, first_name) {
    let user = {
        id, username, first_name,
        status: -1
    }
    createUser(user);
    return;
}

module.exports = {
    isValidUser,
    addUser,
    adminAddUser,
    blacklistUser
}
