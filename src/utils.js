'use strict';

const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync(__dirname + '/../cert/localhost.key'),
  cert: fs.readFileSync(__dirname + '/../cert/localhost.crt'),
};

const log = {
  incomingMessage: im => {
    console.info(`Incoming message:
  HTTP Version: ${im.httpVersion},
  Method: ${im.method},
  Status code: ${im.statusCode},
  Status message: ${im.statusMessage},
  Host: ${im.headers.host},
  URL: ${im.url}`);
    console.info(im.headers);
  },

  redirect: po => {
    console.info(`Redirecting:
  Method: ${po.method},
  URL: ${po.url}`);
    console.info(po.headers);
  },
};

module.exports = {
  log,
  httpsOptions,
};
