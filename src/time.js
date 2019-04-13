'use strict';

class Time {
  constructor(hours = 0, mins = 0) {
    if (typeof hours === 'string') return Time.fromString(hours);
    if (hours > 24) return Time.fromMinutes(hours);
    this.hours = hours;
    this.mins = mins;
  }

  static fromMinutes(countOfMinutes) {
    const mins = countOfMinutes % 60;
    const hours = (countOfMinutes - mins) / 60;
    return new Time(hours, mins);
  }

  static fromString(string) {
    const [sHours, sMins] = string.split(':');
    const hours = parseInt(sHours) || 0;
    const mins = parseInt(sMins) || 0;
    return new Time(hours, mins);
  };

  static diff(t1, t2) {
    [t1, t2] = [t1, t2].sort();
    return Time.fromMinutes(t2 - t1);
  }

  static now() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return new Time(hours, minutes);
  }

  valueOf() {
    return this.hours * 60 + this.mins;
  }

  toString() {
    const hours = this.hours < 10 ? `0${this.hours}` : `${this.hours}`;
    const mins = this.mins < 10 ? `0${this.mins}` : `${this.mins}`;
    return `${hours}:${mins}`;
  }
}

module.exports = Time;
