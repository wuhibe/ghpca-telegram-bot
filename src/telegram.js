require("dotenv").config();
const axios = require("axios");

const token = process.env.TOKEN;
const telegramUrl = `https://api.telegram.org/bot${token}`;
const webAppUrl = process.env.APP_URI;

async function getMe(req, res) {
  const url = `${telegramUrl}/getMe`;
  const response = await axios.get(url);
  return res.json(await response);
}

async function setWebhook(req, res) {
  const url = `${telegramUrl}/setWebhook?url=${webAppUrl}`;
  const response = await axios.get(url);
  return res.json(await response);
}

async function sendMessage(id, text, inline_keyboard = null) {
  let url;
  if (inline_keyboard != null) {
    inline_keyboard = JSON.stringify({ "inline_keyboard": [inline_keyboard] });
    url = `${telegramUrl}/sendMessage?chat_id=${id}&text=${encodeURIComponent(text)}&reply_markup=${encodeURIComponent(inline_keyboard)}`;
  }
  else
    url = `${telegramUrl}/sendMessage?chat_id=${id}&text=${encodeURIComponent(text)}`;
  const response = await axios.get(url);
  return await response;
}

async function editMessage(id, messageId, text, inline_keyboard = null) {
  let url;
  if (inline_keyboard != null) {
    inline_keyboard = JSON.stringify({ "inline_keyboard": [inline_keyboard] });
    url = `${telegramUrl}/editMessageText?chat_id=${id}&message_id=${messageId}&text=${encodeURIComponent(text)}&reply_markup=${encodeURIComponent(inline_keyboard)}`;
  }
  else
    url = `${telegramUrl}/editMessageText?chat_id=${id}&message_id=${messageId}&text=${encodeURIComponent(text)}`;
  const response = await axios.get(url);
  return await response;
}

module.exports = {
  getMe,
  setWebhook,
  sendMessage,
  editMessage
}
