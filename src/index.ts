import express from 'express';
import bodyParser from 'body-parser';
import { logger, LoggerOptions } from 'express-winston';

import { registerPackageRoutes } from './controllers/package';
import { createLoggerConfig, getLogger } from './modules/logging';
import { http as httpConfig } from './modules/config';

const log = getLogger('app');
const app = express();

app.use(logger(createLoggerConfig('http') as LoggerOptions), bodyParser.json());

registerPackageRoutes(app);

app.listen(httpConfig.port, () => {
  log.info(`Listening on http://localhost:${httpConfig.port}!`);
});
