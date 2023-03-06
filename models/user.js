const mongoose = require("./database");

let userSchema = new mongoose.Schema({
  id: Number,
  username: String,
  first_name: String,
  status: Number,
});
let User = mongoose.model("User", userSchema);

const createUser = (user) => {
  let usr = new User(user);
  usr.save();
};

const findUserById = (id) => {
  User.find({ id: id })
    .then((p) => {
      return p;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
};

module.exports = {
  userModel: User,
  createUser: createUser,
  findUserById: findUserById
};
