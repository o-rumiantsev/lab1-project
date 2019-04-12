'use strict';

const map = (prototype, cursor, items) =>
  Object
    .keys(prototype)
    .forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      if (!descriptor) return;

      const newDescriptor = {
        configurable: false,
        enumerable: true,
      };

      if (descriptor.value && typeof descriptor.value === 'function') {
        newDescriptor.value = (...args) => items.map(item =>
          item[prop](...args)
        );
      } else {
        newDescriptor.get = () => items.map(item => item[prop]);
        newDescriptor.set = val => items.map(item => item[prop] = val);
      }

      Object.defineProperty(cursor, prop, newDescriptor);
    });

const createCursor = nodeList => {
  const items = nodeList[Symbol.iterator] ? Array.from(nodeList) : [nodeList];
  const first = () => items[0];
  const cursor = { first };
  const { prototype } = items[0].constructor;
  map(prototype, cursor, items);
  return cursor;
};

module.exports = createCursor;
