import { Express, Response } from 'express';
// import { passport } from './auth';

export function registerUserRoutes(app: Express) {
  app.get(
    '/user',
    // passport.authenticate('github', { failWithError: true }),
    (_, res: Response) => {
      res.send('sup bitch');
    }
  );
}
