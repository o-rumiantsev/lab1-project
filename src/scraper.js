'use strict';

const { JSDOM } = require('jsdom');
const createCursor = require('./cursor');

const defaultJsdomOptions = {
  runScripts: 'dangerously',
  resources: 'usable',
};

class Scraper {
  constructor(url) {
    this.url = url;
    this.dom = null;
    this.jsdomOptions = defaultJsdomOptions;
  }

  async fetch() {
    this.dom = await JSDOM.fromURL(this.url, this.jsdomOptions);
  }

  get plainHTML() {
    return this.dom && this.dom.serialize();
  }

  close() {
    this.dom.window.close();
  }

  extract(query) {
    return createCursor(this.dom.window.document.querySelector(query));
  }

  extractAll(query) {
    return createCursor(this.dom.window.document.querySelectorAll(query))
  }
}

(async () => {
  const scraper = new Scraper('http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx');
  await scraper.fetch();
  scraper.close();
})();


