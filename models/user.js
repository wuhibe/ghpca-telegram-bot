const mongoose = require('./database');

let userSchema = new mongoose.Schema({
  id: Number,
  username: String,
  first_name: String,
  status: Number,
});
let User = mongoose.model('User', userSchema);

const createUser = (user) => {
  let usr = new User(user);
  usr.save();
};

const findUserById = async (id) => {
  let data = await User.findOne({ id: id })
    .then((p) => p)
    .catch((err) => null);
  data = await data;
  return data;
};

function updateUserStatus(id, status) {
  User.findOneAndUpdate({ id: id }, { status: status })
    .then((p) => p)
    .catch((err) => null);
}

module.exports = {
  User,
  createUser,
  findUserById,
  updateUserStatus
};
