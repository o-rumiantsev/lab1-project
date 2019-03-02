'use strict';

const http = require('http');
const https = require('https');
const { log, httpsOptions } = require('./src/utils');
const proxify = require('./src/proxify');

const providers = { http, https };

const isSystemHost = requestHost => {
  if (!process.env.HOST) return false;
  const [host] = requestHost.split(':');
  const [systemHost] = process.env.HOST.split(':');
  return host === systemHost;
};

const createServer = providerName => {
  const provider = providers[providerName];

  const listener = (req, res) => {
    log.incomingMessage(req);

    if (isSystemHost(req.headers.host)) {
      res.writeHead(200);
      res.write('OK');
      res.end();
      return;
    }

    proxify(provider, req, res);
  };

  const args = [listener];

  if (providerName === 'https') args.unshift(httpsOptions);

  return provider.createServer(...args);
};

const startServer = (providerName, port) =>
  createServer(providerName).listen(port, () => {
    console.log('%s server started', providerName);
  });

const startServers = config =>
  Object
    .entries(config)
    .forEach(([providerName, port]) =>
      startServer(providerName, port)
    );

startServers({
  http: 3000,
});
