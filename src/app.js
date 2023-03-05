const { createUser, User } = require("../database/user");

function abc(id, first_name, username, status) {
  let user = {
    id: id,
    first_name: first_name,
    username: username,
    status: status,
  };
  createUser(user, (err, data) => {
    if (err) console.log(err);
    else console.log(data);
  });
}

module.exports = abc;