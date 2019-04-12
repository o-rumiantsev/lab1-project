'use strict';

const util = require('util');

const codes = {
  INVALID_GROUP: 1,
  GROUP_SET_SUCCESS: 2,
  NO_GROUP_SET: 3,
  NO_LESSONS: 4,
  NO_LESSONS_TODAY: 5,
  NO_LESSONS_TOMORROW: 6,
  NO_LESSON_NOW: 7,
  LESSON_TIME_TO_END: 8,
  LESSON_TIME_TO_START: 9,
};

const message = {
  [codes.INVALID_GROUP]: 'Некорректна назва группи.',
  [codes.GROUP_SET_SUCCESS]: 'Групу успішно обрано.',
  [codes.NO_GROUP_SET]: 'Ви не вказали назву групи (/setgroup <назва групи>)',
  [codes.NO_LESSONS]: 'Жодної пари в цей день.',
  [codes.NO_LESSONS_TODAY]: 'Сьогодні немає пар.',
  [codes.NO_LESSONS_TOMORROW]: 'Завтра немає пар.',
  [codes.NO_LESSON_NOW]: 'Зараз немає пари.',
  [codes.LESSON_TIME_TO_END]: 'До кінця пари залишилось: %s',
  [codes.LESSON_TIME_TO_START]: 'До наступної пари залишилось: %s',
};

class Message {
  constructor(code, ...parameters) {
    this.code = code;
    this.text = util.format(message[code], ...parameters);
  }

  static get codes() {
    return codes;
  }

  toString() {
    return this.text;
  }
}

module.exports = Message;
