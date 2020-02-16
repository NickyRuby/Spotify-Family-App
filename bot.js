const TelegramBot = require('node-telegram-bot-api');

const token = '868829603:AAELWomDRhYjmH2ulBOPDQ9bO0KXIME9J_o';


const robertBot = new TelegramBot(token, {polling: true});

robertBot.on('text',(msg) => {
    robertBot.sendMessage(msg.chat.id, "Привет");
    console.log(msg.chat.id);
});

robertBot.on("polling_error", (err) => console.log(err));

module.exports = robertBot;