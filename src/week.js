'use strict';

const weekDayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const weekDayMapping = {
  0: 6,
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
};

class WeekDay {
  constructor(name) {
    this.name = name;
    this.dateWeekDay = weekDayNames.indexOf(name);
    this.weekDay = weekDayMapping[this.dateWeekDay];
  }

  valueOf() {
    return this.weekDay;
  }

  toString() {
    return this.name;
  }
}

const weekDays = {
  MONDAY: new WeekDay('Monday'),
  TUESDAY: new WeekDay('Tuesday'),
  WEDNESDAY: new WeekDay('Wednesday'),
  THURSDAY: new WeekDay('Thursday'),
  FRIDAY: new WeekDay('Friday'),
  SATURDAY: new WeekDay('Saturday'),
  SUNDAY: new WeekDay('Sunday'),
};

const weekDayValues = Object.values(weekDays);

const day = number => weekDayValues[number % 7];

const getDay = () => {
  const dateWeekDay = new Date().getDay();
  return weekDayValues.find(day => day.dateWeekDay === dateWeekDay);
};

const diff = (day1, day2) => {
  const primaryDiff = day2 - day1;

  if (primaryDiff > 0) return primaryDiff;

  const secondaryDiff = 7 - day1;
  return secondaryDiff + day2;
};

const next = day => {
  const currentDay = getDay();
  const daysLeft = diff(currentDay, day);
  const nextDate = new Date();
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + daysLeft);
  return nextDate.getTime() - Date.now();
};

module.exports = {
  day,
  getDay,
  diff,
  next,
  ...weekDays,
};
