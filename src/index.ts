import express from 'express';
import bodyParser from 'body-parser';
import { logger, LoggerOptions } from 'express-winston';
import session from 'express-session';
import createConnectConstructor from 'connect-pg-simple';

import { registerPackageRoutes } from './controllers/package';
import { createLoggerConfig, getLogger } from './modules/logging';
import { http as httpConfig } from './modules/config';
import { registerAuthRoutes } from './controllers/auth';

const log = getLogger('app');
const app = express();

const ConnectPgSimple = createConnectConstructor(session);

app.use(
  session({
    store: new ConnectPgSimple({
      createTableIfMissing: true,
      conString: process.env.KPM_DATABASE_URL
    }),
    secret: 'foobar',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);
app.use(logger(createLoggerConfig('http') as LoggerOptions), bodyParser.json());

registerAuthRoutes(app);
registerPackageRoutes(app);

app.listen(httpConfig.port, () => {
  log.info(`Listening on http://localhost:${httpConfig.port}!`);
});
