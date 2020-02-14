const TelegramBot = require('node-telegram-bot-api');

const token = '868829603:AAELWomDRhYjmH2ulBOPDQ9bO0KXIME9J_o';

const robertBot = new TelegramBot(token, {polling: true});

robertBot.onText('message',(msg) => {
    const chatId = msg.chat.id;
    console.log(chatId);

    robertBot.sendMessage(chatId, 'Не заебуй');
});

robertBot.onText('/start',(msg) => {
    const chatId = msg.chat.id;
    console.log(chatId);
    robertBot.sendMessage(chatId, 'Здорова');
});
