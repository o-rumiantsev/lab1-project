'use strict';

const TelegramBot = require('node-telegram-bot-api');
const Schedule = require('./src/schedule');

const TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });
const chatSchedules = new Map();
const schedules = new Map();

bot.onText(/\/setgroup.*/, async message => {
  const chatId = message.chat.id;
  const groupName = message.text.split(' ')[1];

  if (!groupName) {
    bot.sendMessage(chatId, 'Вкажіть назву групи, будь ласка');
    return;
  }

  const schedule = schedules.get(groupName) || await new Schedule(groupName);

  schedules.set(groupName, schedule);
  chatSchedules.set(chatId, schedule);

  bot.sendMessage(chatId, 'Групу успішно обрано.');
});

bot.onText(/\/today.*/, message => {
  const chatId = message.chat.id;
  const schedule = chatSchedules.get(chatId);

  if (!schedule) {
    bot.sendMessage(
      chatId,
      'Ви не вказали назву групи (/setgroup <назва групи>)'
    );
    return;
  }

  const detailed = message.text.split(' ')[1] === '+';
  const response = schedule.today(detailed);
  bot.sendMessage(chatId, response);
});

bot.onText(/\/tomorrow.*/, message => {
  const chatId = message.chat.id;
  const schedule = chatSchedules.get(chatId);

  if (!schedule) {
    bot.sendMessage(
      chatId,
      'Ви не вказали назву групи (/setgroup <назва групи>)'
    );
    return;
  }

  const detailed = message.text.split(' ')[1] === '+';
  const response = schedule.tomorrow(detailed);
  bot.sendMessage(chatId, response);
});

bot.onText(/\/currentweek.*/, message => {
  const chatId = message.chat.id;
  const schedule = chatSchedules.get(chatId);

  if (!schedule) {
    bot.sendMessage(
      chatId,
      'Ви не вказали назву групи (/setgroup <назва групи>)'
    );
    return;
  }

  const detailed = message.text.split(' ')[1] === '+';
  const response = schedule.currentWeek(detailed);
  bot.sendMessage(chatId, response);
});

bot.onText(/\/nextweek.*/, message => {
  const chatId = message.chat.id;
  const schedule = chatSchedules.get(chatId);

  if (!schedule) {
    bot.sendMessage(
      chatId,
      'Ви не вказали назву групи (/setgroup <назва групи>)'
    );
    return;
  }

  const detailed = message.text.split(' ')[1] === '+';
  const response = schedule.nextWeek(detailed);
  bot.sendMessage(chatId, response);
});

bot.onText(/\/currentlesson.*/, message => {
  const chatId = message.chat.id;
  const schedule = chatSchedules.get(chatId);

  if (!schedule) {
    bot.sendMessage(
      chatId,
      'Ви не вказали назву групи (/setgroup <назва групи>)'
    );
    return;
  }

  const detailed = message.text.split(' ')[1] === '+';
  const response = schedule.currentLesson(detailed);
  bot.sendMessage(chatId, response);
});

bot.onText(/\/nextlesson.*/, message => {
  const chatId = message.chat.id;
  const schedule = chatSchedules.get(chatId);

  if (!schedule) {
    bot.sendMessage(
      chatId,
      'Ви не вказали назву групи (/setgroup <назва групи>)'
    );
    return;
  }

  const detailed = message.text.split(' ')[1] === '+';
  const response = schedule.nextLesson(detailed);
  bot.sendMessage(chatId, response);
});

bot.onText(/\/help.*/, message => {
  const chatId = message.chat.id;

  const helpMessage = 'Для виводу більш детальної інформації, ' +
    'використовуйте параметр "+" (/<команда> +)';

  bot.sendMessage(chatId, helpMessage);
});
