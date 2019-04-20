'use strict';

const Message = require('./message');
const Schedule = require('./schedule');
const constants = require('./constants');
const serializer = require('./serializer');
const { nextWeekNumber } = require('./utils');
const { Time } = require('./time');
const week = require('./week');

const dailyReport = (
  schedule,
  dailySchedule,
  day,
  noLessonsMessage,
  detailed
) => {
  const report = [];
  if (!dailySchedule || dailySchedule.empty) {
    const nextDailySchedule = schedule.nextDailySchedule(day);
    report.push(noLessonsMessage, '');
    report.push(nextDailySchedule.day);
    report.push(serializer.dailySchedule(nextDailySchedule, detailed));
  } else {
    report.push(dailySchedule.day);
    report.push(serializer.dailySchedule(dailySchedule, detailed));
  }
  return report.join('\n');
};

const weeklyReport = (table, detailed) => {
  const report = [];
  for (const dailySchedule of table) {
    report.push(dailySchedule.day);
    if (dailySchedule.empty) {
      report.push(new Message(Message.codes.NO_LESSONS));
    } else {
      report.push(serializer.dailySchedule(dailySchedule, detailed));
    }
    report.push('');
  }
  return report;
};

class ScheduleCollection {
  constructor() {
    // TODO: use PostgreSQL instead of Map
    this.chatSchedules = new Map();
    this.groupSchedules = new Map();
  }

  async setGroup(chatId, groupName) {
    const schedule = this.groupSchedules.get(groupName)
      || await new Schedule(groupName);

    if (schedule.tables.length === 0) {
      throw new Message(Message.codes.INVALID_GROUP);
    }

    this.groupSchedules.set(groupName, schedule);
    this.chatSchedules.set(chatId, schedule);
  }

  today(chatId, detailed) {
    const schedule = this.chatSchedules.get(chatId);

    if (!schedule) {
      throw new Message(Message.codes.NO_GROUP_SET);
    }

    const dailySchedule = schedule.today();
    const today = week.getDay();

    return dailyReport(
      schedule,
      dailySchedule,
      today,
      new Message(Message.codes.NO_LESSONS_TODAY),
      detailed
    );
  }

  tomorrow(chatId, detailed) {
    const schedule = this.chatSchedules.get(chatId);

    if (!schedule) {
      throw new Message(Message.codes.NO_GROUP_SET);
    }

    const dailySchedule = schedule.tomorrow();
    const tomorrow = week.day(week.getDay() + 1);

    return dailyReport(
      schedule,
      dailySchedule,
      tomorrow,
      new Message(Message.codes.NO_LESSONS_TOMORROW),
      detailed
    );
  }

  currentWeek(chatId, detailed) {
    const schedule = this.chatSchedules.get(chatId);

    if (!schedule) {
      throw new Message(Message.codes.NO_GROUP_SET);
    }

    const table = schedule.currentWeek();
    const weekName = serializer.weekName(schedule.weekNumber);
    const report = [];
    report.push(weekName, '');
    report.push(...weeklyReport(table, detailed));
    return report.join('\n');
  }

  nextWeek(chatId, detailed) {
    const schedule = this.chatSchedules.get(chatId);

    if (!schedule) {
      throw new Message(Message.codes.NO_GROUP_SET);
    }

    const table = schedule.nextWeek();
    const weekName = serializer.weekName(nextWeekNumber(schedule.weekNumber));
    const report = [];
    report.push(weekName, '');
    report.push(...weeklyReport(table, detailed));
    return report.join('\n');
  }

  currentLesson(chatId, detailed) {
    const schedule = this.chatSchedules.get(chatId);

    if (!schedule) {
      throw new Message(Message.codes.NO_GROUP_SET);
    }

    const currentTime = Time.now();
    const dayNumber = +week.getDay();
    const dailySchedule = schedule.currentWeek()[dayNumber];
    const lesson = dailySchedule.lessons.find(lesson => {
      return lesson.startTime <= currentTime &&
        lesson.endTime >= currentTime
    });

    if (!lesson) {
      throw new Message(Message.codes.NO_LESSON_NOW);
    }

    const timeToEnd = Time.diff(lesson.endTime, currentTime);
    const report = [];
    report.push(serializer.lesson(lesson, detailed));
    report.push('');
    report.push(
      new Message(
        Message.codes.LESSON_TIME_TO_END,
        timeToEnd.inWords()
      )
    );
    return report.join('\n');
  }

  nextLesson(chatId, detailed) {
    const schedule = this.chatSchedules.get(chatId);

    if (!schedule) {
      throw new Message(Message.codes.NO_GROUP_SET);
    }

    const currentTime = Time.now();
    const today = week.getDay();
    const dailySchedule = schedule.currentWeek()[+today];
    const lesson = dailySchedule.lessons.find(lesson => {
      return lesson.startTime >= currentTime;
    });

    const report = [];

    if (lesson) {
      const timeToStart = Time.diff(currentTime, lesson.startTime);
      report.push(lesson.day);
      report.push(serializer.lesson(lesson, detailed));
      report.push('');
      report.push(
        new Message(
          Message.codes.LESSON_TIME_TO_START,
          timeToStart.inWords()
        )
      );
      return report.join('\n');
    }

    const nextDailySchedule = schedule.nextDailySchedule(today);
    const [nextDayLesson] = nextDailySchedule.lessons;
    report.push(nextDayLesson.day);
    report.push(serializer.lesson(nextDayLesson, detailed));
    return report.join('\n');
  }
}

module.exports = ScheduleCollection;

(async () => {
  const sc = new ScheduleCollection();
  await sc.setGroup(1, 'ІП-71');

  console.log(sc.tomorrow(1));
})().catch(console.error);
