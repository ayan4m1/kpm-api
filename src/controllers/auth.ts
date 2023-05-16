import { Express, Request, Response } from 'express';
import { User } from '@prisma/client';
import { formatISO } from 'date-fns';

import { authenticate } from '../modules/auth';
import { auth as authConfig } from '../modules/config';
import { getAccessToken } from '../modules/database';
import { getLogger } from '../modules/logging';

const log = getLogger('auth-controller');

export function registerAuthRoutes(app: Express) {
  app.get('/auth', authenticate({ failWithError: true }));
  app.get(
    '/auth/callback',
    authenticate({ failWithError: true }),
    async (req: Request, res: Response) => {
      const user = req.user as User;
      if (!user) {
        log.error('Auth callback called with no user!');
        return res.sendStatus(500);
      }

      const result = await getAccessToken(user.id);

      if (!result) {
        log.warn('User had no access token!');
        res.sendStatus(403);
      } else {
        log.info(`Redirecting user to ${authConfig.uiUrl}`);
        res.redirect(
          302,
          `${authConfig.uiUrl}?token=${result.token}&expiresAt=${formatISO(
            result.expiresAt
          )}`
        );
      }
    }
  );
}
