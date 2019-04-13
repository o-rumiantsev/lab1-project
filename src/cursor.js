'use strict';

const { JSDOM } = require('jsdom');

class DOMCursor {
  constructor(dom) {
    this.dom = dom;
  }

  static fromHTML(html) {
    const dom = new JSDOM(html);
    return new DOMCursor(dom);
  }

  select(query) {
    return new Cursor(this.dom.window.document.querySelectorAll(query));
  }

  close() {
    this.dom.window.close();
  }
}

class Cursor {
  constructor(nodeList) {
    if (!nodeList) {
      this.items = [];
    } else {
      this.items =
        nodeList[Symbol.iterator]
          ? Array.from(nodeList)
          : [nodeList];
    }
  }

  first() {
    if (this.items.length === 0) return new Cursor();
    const { innerHTML } = this.items[0];
    return DOMCursor.fromHTML(innerHTML);
  }

  project(property) {
    return new Cursor(this.items.map(item => item[property]));
  }

  fetch() {
    return this.items;
  }
}

module.exports = {
  Cursor,
  DOMCursor,
};
