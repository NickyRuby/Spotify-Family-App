process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config();
const token = process.env.TELEGRAM_TOKEN;
const client = require('./app.js')
 
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

// robertBot.on('text',(msg) => {
//     robertBot.sendMessage(msg.chat.id, "Привет");
//     console.log(msg.chat.id);
// });

// robertBot.on('callback_query', (callbackData) => {
//       let trackLikesAndUrl;
//       client.hgetall(`track:${callbackData.data}`,(err,rep) => {
//          trackLikesAndUrl = { url: rep.url, likes: rep.likes}
//       });

//       let newMarkup = {
//          inline_keyboard: [
//             [{text: "Cлушать", url: trackLikesAndUrl.url}],
//             [{text: `🖤 ${trackLikesAndUrl.likes}`, callback_data: `${trackIndexInDB}`}]
//         ]
//      };
 
//      let form = {
//      chat_id: callbackData.message.chat.id,
//      message_id: callbackData.message.message_id,
//      }

//      slaveBot.editMessageReplyMarkup(newMarkup, form);
//      client.hmset(`track:${callbackData.data}`, 'likes', trackLikesAndUrl.likes + 1);
//    });

robertBot.on("polling_error", (err) => console.log(err));


module.exports = robertBot;