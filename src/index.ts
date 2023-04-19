import express from 'express';
import { logger, LoggerOptions } from 'express-winston';

import { createLoggerConfig, getLogger } from './modules/logging';
import { http as httpConfig } from './modules/config';

const log = getLogger('app');
const app = express();

app.use(logger(createLoggerConfig('http') as LoggerOptions));

app.listen(httpConfig.port, () => {
  log.info(`Listening on http://localhost:${httpConfig.port}!`);
});
