'use strict';

// const Bot = require('./src/bot');
// const Message = require('./src/message');
// const { TOKEN, DOC } = require('./src/constants');

// const bot = new Bot(TOKEN);
//
// bot.on(/\/setgroup.*/, async (chatId, groupName) => {
//   try {
//     await bot.scheduleCollection.setGroup(chatId, groupName);
//     const message = new Message(Message.codes.GROUP_SET_SUCCESS);
//     bot.sendMessage(chatId, message.toString());
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/today.*/, (chatId, detailed) => {
//   try {
//     const report = bot.scheduleCollection.today(chatId, detailed);
//     bot.sendMessage(chatId, report);
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/tomorrow.*/, (chatId, detailed) => {
//   try {
//     const report = bot.scheduleCollection.tomorrow(chatId, detailed);
//     bot.sendMessage(chatId, report);
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/currentweek.*/, (chatId, detailed) => {
//   try {
//     const report = bot.scheduleCollection.currentWeek(chatId, detailed);
//     bot.sendMessage(chatId, report);
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/nextweek.*/, (chatId, detailed) => {
//   try {
//     const report = bot.scheduleCollection.nextWeek(chatId, detailed);
//     bot.sendMessage(chatId, report);
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/currentlesson.*/, (chatId, detailed) => {
//   try {
//     const report = bot.scheduleCollection.currentLesson(chatId, detailed);
//     bot.sendMessage(chatId, report);
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/nextlesson.*/, (chatId, detailed) => {
//   try {
//     const report = bot.scheduleCollection.nextLesson(chatId, detailed);
//     bot.sendMessage(chatId, report);
//   } catch (message) {
//     bot.sendMessage(chatId, message.toString());
//   }
// });
//
// bot.on(/\/help.*/, chatId => bot.sendMessage(chatId, DOC));

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  webHook: {
    host: `${process.env.WEBHOOK}/${process.env.TELEGRAM_TOKEN}`,
    port: 443,
  },
});

bot.setWebHook(`${process.env.WEBHOOK}/${process.env.TELEGRAM_TOKEN}`);

bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'I am alive on Zeit Now!');
});

module.exports = (req, res) => {
  console.log(req.body);
  res.writeHead(200);
  res.end();
};
