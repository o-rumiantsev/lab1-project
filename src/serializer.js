'use strict';

const weekName = weekNumber => ['Перший тиждень', 'Другий тиждень'][weekNumber];

const lessonDetailed = lesson => {
  return (
    `${lesson.number}. ${lesson.startTime}\n` +
    `Дисципліна: ${lesson.subject}\n` +
    `Викладачі: ${lesson.teachers}\n` +
    `Аудиторія: ${lesson.place || ''}\n` +
    `Тип заняття: ${lesson.type || ''}`
  );
};

const lessonShort = lesson => {
  return (
    `${lesson.number}. ${lesson.subject} ` +
    `${lesson.place || ''} ${lesson.type || ''}`
  );
};

const lesson = (lesson, detailed = false) =>
  detailed ? lessonDetailed(lesson) : lessonShort(lesson);

const dailySchedule = ({ lessons }, detailed = false) => {
  const serializer = detailed ? lesson : lessonShort;
  const sLessons = lessons.map(serializer).join('\n');
  return `${sLessons}`;
};

module.exports = {
  weekName,
  lesson,
  dailySchedule,
};
