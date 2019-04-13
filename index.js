'use strict';

const Scraper = require('./src/scraper');

(async () => {
  const scraper = await new Scraper('https://www.facebook.com/');
  const data =
    scraper
      .extract('#pageFooter ul')
      .first()
      .extract('li')
      .project('textContent')
      .fetch();

  console.log(data);

  scraper.close();
})();

