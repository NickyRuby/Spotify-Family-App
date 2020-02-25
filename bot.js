const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config()
const token = process.env.TELEGRAM_TOKEN;
 
const app = express();
 
app.use(bodyParser.json());
 
app.listen(process.env.PORT);
app.post('/' + token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});


if (process.env.NODE_ENV === 'production') {
    robertBot = new TelegramBot(token);
    robertBot.setWebHook(process.env.HEROKU_URL + token);
 } else {
    robertBot = new TelegramBot(token, { polling: true });
 }

robertBot.on('text',(msg) => {
    robertBot.sendMessage(msg.chat.id, "Привет");
    console.log(msg.chat.id);
});

robertBot.on("polling_error", (err) => console.log(err));

module.exports = robertBot;