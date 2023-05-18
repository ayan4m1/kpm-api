import { Express, Request, Response } from 'express';
import { User } from '@prisma/client';
import { formatISO } from 'date-fns';

import { authenticate } from '../modules/auth';
import { auth as authConfig } from '../modules/config';
import { getAccessToken } from '../modules/database';
import { getLogger } from '../modules/logging';

const log = getLogger('controller-auth');

const checkContinueUrl = (continueUrl: string): boolean =>
  continueUrl?.startsWith(authConfig.uiUrl);

export function registerAuthRoutes(app: Express) {
  app.get('/auth', (req: Request, res: Response, next: CallableFunction) => {
    const continueUrl =
      (req.query['continueUrl'] as string) ?? authConfig.uiUrl;

    if (!checkContinueUrl(continueUrl)) {
      log.error(`Someone tried to redirect to ${continueUrl}!`);
      return res.sendStatus(400);
    }

    return authenticate({ failWithError: true, state: encodeURI(continueUrl) })(
      req,
      res,
      next
    );
  });
  app.get(
    '/auth/callback',
    authenticate({ failWithError: true }),
    async (req: Request, res: Response) => {
      const user = req.user as User;

      if (!user) {
        log.error('Auth callback called with no user!');
        return res.sendStatus(401);
      }

      const result = await getAccessToken(user.id);

      if (!result) {
        log.warn('User had no access token!');
        res.sendStatus(403);
      } else {
        const continueString = decodeURI(req.query['state'] as string);

        if (!checkContinueUrl(continueString)) {
          log.error(`Someone tried to redirect to ${continueString}!`);
          return res.sendStatus(400);
        }

        const continueUrl = new URL(continueString);
        const queryString = `?token=${result.token}&expiresAt=${formatISO(
          result.expiresAt
        )}`;

        continueUrl.hash = queryString;

        log.info(`Redirecting user to ${continueUrl}`);
        res.redirect(302, continueUrl.toString());
      }
    }
  );
}
