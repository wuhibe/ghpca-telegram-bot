require('dotenv').config();
const axios = require('axios');

const token = process.env.TOKEN;
const telegramUrl = `https://api.telegram.org/bot${token}`;
const webAppUrl = process.env.APP_URI;

class Telegram {
  static async getMe(req, res) {
    const url = `${telegramUrl}/getMe`;
    await axios
      .get(url)
      .then((response) => res.send(response.data))
      .catch((error) => res.send(error));
  }

  static async setWebhook(req, res) {
    const url = `${telegramUrl}/setWebhook?url=${webAppUrl}`;
    await axios
      .get(url)
      .then((response) => res.send(response.data))
      .catch((error) => res.send(error));
  }

  static async sendMessage(id, text, inline_keyboard = null) {
    let url;
    if (inline_keyboard != null) {
      inline_keyboard = JSON.stringify({
        inline_keyboard: inline_keyboard,
      });
      url = `${telegramUrl}/sendMessage?chat_id=${id}&text=${encodeURIComponent(
        text
      )}&reply_markup=${encodeURIComponent(inline_keyboard)}`;
    } else
      url = `${telegramUrl}/sendMessage?chat_id=${id}&text=${encodeURIComponent(
        text
      )}`;
    axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => error);
  }

  static async editMessage(id, messageId, text, inline_keyboard = null) {
    let url;
    if (inline_keyboard != null) {
      inline_keyboard = JSON.stringify({
        inline_keyboard: inline_keyboard,
      });
      url = `${telegramUrl}/editMessageText?chat_id=${id}&message_id=${messageId}&text=${encodeURIComponent(
        text
      )}&reply_markup=${encodeURIComponent(inline_keyboard)}`;
    } else
      url = `${telegramUrl}/editMessageText?chat_id=${id}&message_id=${messageId}&text=${encodeURIComponent(
        text
      )}`;
    await axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => error);
  }
}

module.exports = Telegram;
