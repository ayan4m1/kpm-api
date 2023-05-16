import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { logger, LoggerOptions } from 'express-winston';

import { createLoggerConfig, getLogger } from './modules/logging';
import { http as httpConfig, auth as authConfig } from './modules/config';
import { registerSessionMiddleware } from './modules/session';

import { registerAuthRoutes } from './controllers/auth';
import { registerPackageRoutes } from './controllers/package';
import { registerUserRoutes } from './controllers/user';

const log = getLogger('app');
const app = express();

app.use(
  logger(createLoggerConfig('http') as LoggerOptions),
  bodyParser.json(),
  cors({
    origin: authConfig.uiUrl
  })
);

registerSessionMiddleware(app);

registerAuthRoutes(app);
registerPackageRoutes(app);
registerUserRoutes(app);

app.listen(httpConfig.port, () => {
  log.info(`Listening on http://localhost:${httpConfig.port}!`);
});
