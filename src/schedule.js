'use strict';

const Scraper = require('./scraper');
const Time = require('./time');

const SCHEDULE_URL =
  'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';

const FORM_ID = '#aspnetForm';
const INPUT_ID = '#ctl00_MainContent_ctl00_txtboxGroup';
const TABLES_CLASS = '.table.table-bordered.table-hover';
const CURRENT_WEEK_CLASS_NAME = 'day_backlight';
const MSECS_IN_WEEK = 1000 * 60 * 60 * 24 * 7;
const LAST_LESSON = new Time('16:10');
const LESSON_DURATION = new Time('01:35');
const END_OF_LESSONS = new Time(LAST_LESSON + LESSON_DURATION);

const NO_LESSONS = 'Жодної пари в цей день:)';
const NO_LESSONS_TODAY = 'Сьогодні немає пар.';
const NO_LESSONS_TOMORROW = 'Завтра немає пар.';
const NO_LESSON_NOW = 'Зараз немає пари.';

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
  const [number, time] = [meta.slice(0, 1), meta.slice(1)];
  const lessons = cells.map(processTableCell);
  const startTime = new Time(time);
  const endTime = new Time(startTime + LESSON_DURATION);
  return {
    number,
    startTime,
    endTime,
    lessons,
  };
};

const prepareSchedule = (days, partialSchedule) => days.map((day, index) => ({
  day,
  lessons:
    partialSchedule
      .map(({ number, startTime, endTime, lessons }) => ({
        number,
        startTime,
        endTime,
        ...lessons[index],
      }))
      .filter(lesson => lesson.subject),
}));

const processTable = tableElement => {
  const rows = Array.from(tableElement.rows);
  const days =
    Array
      .from(rows.shift().cells)
      .map(cell => cell.textContent)
      .slice(1);
  const partialSchedule = rows.map(processTableRow);
  const schedule = prepareSchedule(days, partialSchedule);
  schedule.unshift({ day: 'Неділя', lessons: [] });
  return schedule;
};

const trackWeekNumber = schedule => {
  const timers = {};
  const nextWeekNumbers = {
    '0': 1,
    '1': 0,
  };

  const nextMonday = new Date();
  const daysToNextMonday = 7 - nextMonday.getDay();
  nextMonday.setHours(0, 0, 0, 0);
  nextMonday.setDate(nextMonday.getDate() + daysToNextMonday);
  const msecsToNextChange = nextMonday.getTime() - Date.now();

  const changeNextWeek = () => {
    const currentWeekNumber = schedule.weekNumber;
    schedule.weekNumber = nextWeekNumbers[currentWeekNumber];
  };

  timers.timeout = setTimeout(
    () => {
      timers.interval = setInterval(changeNextWeek, MSECS_IN_WEEK);
    },
    msecsToNextChange
  );
  return timers;
};

class Schedule {
  constructor(groupName) {
    this.groupName = groupName;
    this.weekNumber = 0;

    this.timers = trackWeekNumber(this);

    return createGroupScraper(groupName)
      .then(scraper => {
        const tables = scraper.select(TABLES_CLASS).fetch();
        for (let i = 0; i < tables.length; ++i) {
          const rows = Array.from(tables[i].rows).slice(1);
          const isCurrentWeek = rows.some(row => {
            const cells = Array.from(row.children);
            if (cells.some(cell => cell.className === CURRENT_WEEK_CLASS_NAME)) {
              return true;
            }
          });
          if (isCurrentWeek) {
            this.weekNumber = i;
            break;
          }
        }
        this.schedule = tables.map(processTable);
        scraper.close();
        return this;
      });
  }

  static weekName(weekNumber) {
    return weekNumber === 0 ? 'Перший тиждень' : 'Другий тиждень';
  }

  static lessonToString(lesson) {
    return `${lesson.number}. ${lesson.startTime}\n` +
      `Дисципліна: ${lesson.subject}\n` +
      `Викладачі: ${lesson.teachers}\n` +
      `Аудиторія: ${lesson.place || ''}\n` +
      `Тип заняття: ${lesson.type || ''}`;
  }

  static lessonToStringShort(lesson) {
    return `${lesson.number}. ${lesson.subject} ` +
      `${lesson.place || ''} ${lesson.type || ''}`;
  }

  static dayToString({ day, lessons }, detailed = false) {
    const serializer =
      detailed
        ? Schedule.lessonToString
        : Schedule.lessonToStringShort;
    const sLessons = lessons.map(serializer).join('\n') || NO_LESSONS;
    return `${day}\n${sLessons}`;
  }

  static nextDailySchedule(schedule, initialWeekNumber, initialDay) {
    let weekNumber = initialWeekNumber;

    for (let day = initialDay + 1; day < 7; ++day) {
      const dailySchedule = schedule[weekNumber][day];
      if (dailySchedule.lessons.length !== 0) return dailySchedule;
    }

    weekNumber = initialWeekNumber === 0 ? 1 : 0;

    for (let day = 0; day < initialDay; ++day) {
      const dailySchedule = schedule[weekNumber][day];
      if (dailySchedule.lessons.length !== 0) return dailySchedule;
    }

    return table[initialDay];
  }

  week(weekNumber, detailed) {
    const table = this.schedule[weekNumber];
    const sDays =
      table
        .slice(1) // Exclude Sunday.
        .map(day => Schedule.dayToString(day, detailed))
        .join('\n\n');
    return `${Schedule.weekName(weekNumber)}\n\n${sDays}`;
  }

  currentWeek(detailed) {
    return this.week(this.weekNumber, detailed);
  }

  nextWeek(detailed) {
    const nextWeekNumber = this.weekNumber === 0 ? 1 : 0;
    return this.week(nextWeekNumber, detailed);
  }

  day(day, detailed, message = NO_LESSONS) {
    const table = this.schedule[this.weekNumber];
    const dailySchedule = table[day];
    if (!dailySchedule.lessons.length) {
      const nextDailySchedule = Schedule.nextDailySchedule(
        this.schedule,
        this.weekNumber,
        day
      );
      return `${message}\n\n` + Schedule.dayToString(
        nextDailySchedule,
        detailed
      );
    }
    return Schedule.dayToString(dailySchedule, detailed);
  }

  today(detailed) {
    const day = new Date().getDay();
    return this.day(day, detailed, NO_LESSONS_TODAY);
  }

  tomorrow(detailed) {
    const day = (new Date().getDay() + 1) % 7;
    return this.day(day, detailed, NO_LESSONS_TOMORROW);
  }

  currentLesson(detailed) {
    const currentTime = Time.now();

    if (currentTime >= END_OF_LESSONS) return NO_LESSON_NOW;

    const day = new Date().getDay();
    const dailySchedule = this.schedule[this.weekNumber][day];
    const lesson = dailySchedule.lessons.find(lesson => {
      return lesson.startTime <= currentTime &&
        lesson.endTime >= currentTime
    });

    if (!lesson) return NO_LESSON_NOW;

    const serializer =
      detailed
        ? Schedule.lessonToString
        : Schedule.lessonToStringShort;

    const endWith = {
      '0': 'хвилин',
      '1': 'хвилина',
      '2': 'хвилини',
      '3': 'хвилини',
      '4': 'хвилини',
      '5': 'хвилин',
      '6': 'хвилин',
      '7': 'хвилин',
      '8': 'хвилин',
      '9': 'хвилин',
    };

    const timeLeft = Time.diff(lesson.endTime, currentTime);
    let timeLeftMessage = 'До кінця пари залишилось';
    if (timeLeft.hours) timeLeftMessage += ` ${timeLeft.hours} година`;
    const minsLeft = timeLeft.mins.toString();
    const ending = minsLeft[minsLeft.length - 1];
    timeLeftMessage += ` ${minsLeft} ${endWith[ending]}`;

    return `${serializer(lesson)}\n\n${timeLeftMessage}`;
  }

  nextLesson(detailed) {
    const currentTime = Time.now();
    const day = new Date().getDay();

    const serializer =
      detailed
        ? Schedule.lessonToString
        : Schedule.lessonToStringShort;

    if (currentTime <= LAST_LESSON) {
      const dailySchedule = this.schedule[this.weekNumber][day];
      const lesson = dailySchedule.lessons.find(lesson => {
          return lesson.startTime >= currentTime
      });
      if (lesson) return `${serializer(lesson)}`;
    }

    const dailySchedule = Schedule.nextDailySchedule(
      this.schedule,
      this.weekNumber,
      day
    );
    const [lesson] = dailySchedule.lessons;
    return `${dailySchedule.day}\n${serializer(lesson)}`;
  }

  stopTrackingWeekNumber() {
    const { timeout, interval } = this.timers;
    clearTimeout(timeout);
    clearInterval(interval);
  }
}

module.exports = Schedule;
