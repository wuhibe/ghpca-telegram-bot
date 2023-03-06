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

const findUserById = async (id) => {
  return await User.find({ id: id })
    .then(p => p)
    .catch(err => null);
};

module.exports = {
  userModel: User,
  createUser: createUser,
  findUserById: findUserById
};
