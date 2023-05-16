import { Express } from 'express';
import session from 'express-session';
import createConnectConstructor from 'connect-pg-simple';

import { session as config } from './config';
import { getLogger } from './logging';

const log = getLogger('session');
const ConnectPgSimple = createConnectConstructor(session);

export function registerSessionMiddleware(app: Express) {
  log.info(`Session configured to last for ${config.maxCookieAgeHours} hours`);
  app.use(
    session({
      store: new ConnectPgSimple({
        createTableIfMissing: true,
        conString: config.connectionString
      }),
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: config.maxCookieAgeHours * 60 * 60 * 1000
      }
    })
  );
}
