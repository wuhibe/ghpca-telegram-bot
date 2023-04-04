require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  return await User.findOne({ id: id })
    .then((p) => p)
    .catch((err) => null);
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
  updateUserStatus,
};
