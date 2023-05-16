import { Express } from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';

import { session as config } from './config';
import { getLogger } from './logging';

const log = getLogger('session');
const MemoryStore = createMemoryStore(session);

export function registerSessionMiddleware(app: Express) {
  const maxAge = config.maxCookieAgeHours * 60 * 60 * 1000;

  log.info(`Session configured to last for ${config.maxCookieAgeHours} hours`);
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: maxAge
      }),
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge
      }
    })
  );
}
