import { Express, Response } from 'express';

import { authenticate } from '../modules/auth';

export function registerUserRoutes(app: Express) {
  app.get(
    '/user',
    authenticate({ failWithError: true }),
    (_, res: Response) => {
      res.send('sup bitch').end();
    }
  );
}
