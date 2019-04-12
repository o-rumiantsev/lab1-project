'use strict';

const week = require('./week');
const { Time } = require('./time');
const { MSECS_IN_WEEK } = require('./constants');
const { nextWeekNumber } = require('./utils');
const {
  createGroupScraper,
  processGroupScraper,
} = require('./schedule-processor');

const trackWeekNumber = schedule => {
  const timers = {};
  const msecsToNextChange = week.next(week.MONDAY);
  const changeNextWeek = () => {
    schedule.weekNumber = nextWeekNumber(schedule.weekNumber);
  };

  timers.timeout = setTimeout(() => {
    changeNextWeek();
    timers.interval = setInterval(changeNextWeek, MSECS_IN_WEEK);
  }, msecsToNextChange);
  return timers;
};

class Schedule {
  constructor(groupName) {
    this.groupName = groupName;
    this.weekNumber = 0;
    this.tables = [];

    this.timers = trackWeekNumber(this);

    return createGroupScraper(groupName)
      .then(processGroupScraper)
      .then(([weekNumber, tables]) => {
        this.tables = tables;
        this.weekNumber = weekNumber;
        return this;
      });
  }

  nextDailySchedule(initialDay) {
    const currentWeek = this.currentWeek();

    for (let dayNumber = initialDay + 1; dayNumber < 7; ++dayNumber) {
      const dailySchedule = currentWeek[dayNumber];
      if (dailySchedule && !dailySchedule.empty) return dailySchedule;
    }

    const nextWeek = this.nextWeek();

    for (let dayNumber = 0; dayNumber < initialDay; ++dayNumber) {
      const dailySchedule = nextWeek[dayNumber];
      if (dailySchedule && !dailySchedule.empty) return dailySchedule;
    }

    return currentWeek[initialDay];
  }

  async refresh() {
    const scraper = await createGroupScraper(this.groupName);
    const [weekNumber, schedule] = processGroupScraper(scraper);
    this.tables = schedule;
    this.weekNumber = weekNumber;
  }

  week(weekNumber) {
    return this.tables[weekNumber];
  }

  currentWeek() {
    return this.week(this.weekNumber);
  }

  nextWeek() {
    return this.week(nextWeekNumber(this.weekNumber));
  }

  day(dayNumber) {
    const table = this.currentWeek();
    return table[dayNumber];
  }

  today() {
    return this.day(+week.getDay());
  }

  tomorrow() {
    return this.day(+week.day(week.getDay() + 1));
  }

  currentLesson() {
    const currentTime = Time.now();
    const dayNumber = +week.getDay();
    const dailySchedule = this.currentWeek()[dayNumber];
    return dailySchedule.lessons.find(lesson => {
      return lesson.startTime <= currentTime && lesson.endTime >= currentTime;
    });
  }

  nextLesson() {
    const currentTime = Time.now();
    const today = week.getDay().weekDay;

    const todaySchedule = this.currentWeek()[today];
    const todayLesson = todaySchedule.lessons.find(lesson => {
      return lesson.startTime >= currentTime;
    });
    if (todayLesson) return todayLesson;

    const nextDailySchedule = this.nextDailySchedule(today);
    return nextDailySchedule.lessons[0];
  }

  stopTrackingWeekNumber() {
    const { timeout, interval } = this.timers;
    clearTimeout(timeout);
    clearInterval(interval);
  }
}

module.exports = Schedule;
