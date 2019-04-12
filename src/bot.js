'use strict';

const TelegramBot = require('node-telegram-bot-api');
const ScheduleCollection = require('./schedule-collection');

class Bot {
  constructor(token) {
    this.telegram = new TelegramBot(token, { polling: true });
    this.scheduleCollection = new ScheduleCollection();
  }

  on(regexp, fn) {
    this.telegram.onText(regexp, message => {
      const chatId = message.chat.id;
      const args = message.text.split(/\s/g).slice(1);
      fn(chatId, ...args);
    });
  }

  sendMessage(chatId, message) {
    this.telegram.sendMessage(chatId, message);
  }
}

module.exports = Bot;
