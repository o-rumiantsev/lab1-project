'use strict';

const { JSDOM } = require('jsdom');
const DOMCursor = require('./cursor');

const defaultJsdomOptions = {
  runScripts: 'dangerously',
  resources: 'usable',
};

class Scraper {
  constructor(url, jsdomOptions) {
    this.url = url;
    this.jsdomOptions = jsdomOptions|| defaultJsdomOptions;
    return JSDOM
      .fromURL(this.url, this.jsdomOptions)
      .then(dom => {
        this.cursor = new DOMCursor(dom);
        return this;
      });
  }

  get plainHTML() {
    return this.dom.serialize();
  }

  extract(query) {
    return this.cursor.extract(query);
  }

  close() {
    this.cursor.close();
  }
}

module.exports = Scraper;
