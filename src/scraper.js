'use strict';

const qs = require('querystring');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Cursor, DOMCursor } = require('./cursor');

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
        this.dom = dom;
        this.cursor = new DOMCursor(dom);
        return this;
      });
  }

  get plainHTML() {
    return this.dom.serialize();
  }

  select(query) {
    return this.cursor.select(query);
  }

  async submitForm(form, specificParams) {
    const actionUrl = form.action;
    const formParams = new Cursor(form.elements)
      .fetch()
      .reduce((args, element) => {
        args[element.name] = element.value;
        return args;
      }, {});
    const params = qs.stringify(Object.assign(formParams, specificParams));

    const response = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params
    });

    return new Scraper(response.url, this.jsdomOptions);
  }

  close() {
    this.cursor.close();
  }
}

module.exports = Scraper;
