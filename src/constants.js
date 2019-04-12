'use strict';

const fs = require('fs');
const path = require('path');
const { time } = require('./time');

module.exports = {
  MSECS_IN_WEEK: 1000 * 60 * 60 * 24 * 7,

  LESSON_DURATION: time('01:35'),
  LAST_LESSON: time('16:10'),
  LESSONS_START: time('08:30'),
  LESSONS_END: time('17:45'),

  SCHEDULE_URL: 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx',
  FORM_ID: '#aspnetForm',
  INPUT_ID: '#ctl00_MainContent_ctl00_txtboxGroup',
  TABLES_CLASS: '.table.table-bordered.table-hover',
  CURRENT_WEEK_CLASS_NAME: 'day_backlight',

  TOKEN: process.env.TELEGRAM_TOKEN,
  DOC: fs.readFileSync(path.join(__dirname, '../doc/help.txt')),
};
