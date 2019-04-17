'use strict';

const Scraper = require('./scraper');
const { time } = require('./time');
const {
  SCHEDULE_URL,
  FORM_ID,
  INPUT_ID,
  TABLES_CLASS,
  CURRENT_WEEK_CLASS_NAME,
  LESSON_DURATION
} = require('./constants');

const secretParams = {
  ctl00_ToolkitScriptManager_HiddenField: ';;AjaxControlToolkit, ' +
    'Version=3.5.60623.0, Culture=neutral, ' +
    'PublicKeyToken=28f01b0e84b6d53e::834c499a-b613-' +
    '438c-a778-d32ab4976134:22eca927:ce87be9:2d27a0fe:23389d96:' +
    '77aedcab:1bd6c8d4:7b704157',
};

const createGroupScraper = async groupName => {
  const scraper = await new Scraper(SCHEDULE_URL);
  const [form] = scraper.select(FORM_ID).fetch();
  const [input] = scraper.select(INPUT_ID).fetch();
  input.setAttribute('value', groupName);
  const groupScraper = await scraper.submitForm(form, secretParams);
  scraper.close();
  return groupScraper;
};

const processTableCell = tableCell => {
  const children = Array.from(tableCell.children);
  if (children.length === 0) return null;
  const subject = children.find(el => el.tagName === 'SPAN').textContent;
  const teachers = children.filter(el => el.tagName === 'A').map(a => a.text);
  let place = null;
  let type = null;
  if (/^(\d|-)/.test(teachers[teachers.length - 1])) {
    [place, type] = teachers.pop().split(' ');
  }
  return {
    subject,
    teachers,
    place,
    type,
  };
};

const processTableRow = tableRow => {
  const cells = Array.from(tableRow.cells);
  const meta = cells.shift().textContent;
  const [number, lessonStartTime] = [meta.slice(0, 1), meta.slice(1)];
  const lessons = cells.map(processTableCell);
  const startTime = time(lessonStartTime);
  const endTime = time(startTime + LESSON_DURATION);
  return {
    number,
    startTime,
    endTime,
    lessons,
  };
};

const prepareSchedule = (days, partialSchedule) => days.map((day, index) => {
  const lessons = partialSchedule
    .map(({ number, startTime, endTime, lessons }) => ({
      day,
      number,
      startTime,
      endTime,
      ...lessons[index],
    }))
    .filter(lesson => lesson.subject);
  const empty = lessons.length === 0;
  return {
    day,
    empty,
    lessons,
  };
});

const processTable = tableElement => {
  const rows = Array.from(tableElement.rows);
  const days =
    Array
      .from(rows.shift().cells)
      .map(cell => cell.textContent)
      .slice(1);
  const partialSchedule = rows.map(processTableRow);
  return prepareSchedule(days, partialSchedule);
};

const getWeekNumber = tables => {
  for (let i = 0; i < tables.length; ++i) {
    const rows = Array.from(tables[i].rows).slice(1);
    const isCurrentWeek = rows.some(row => {
      const cells = Array.from(row.children);
      if (cells.some(cell => cell.className === CURRENT_WEEK_CLASS_NAME)) {
        return true;
      }
    });
    if (isCurrentWeek) return i;
  }
};

const processGroupScraper = scraper => {
  const tables = scraper.select(TABLES_CLASS).fetch();
  scraper.close();
  const weekNumber = getWeekNumber(tables);
  const groupScheduleTables = tables.map(processTable);
  return [weekNumber, groupScheduleTables];
};

module.exports = {
  createGroupScraper,
  processGroupScraper,
};
