import { Express, Request, Response } from 'express';
import { param, query } from 'express-validator';

import { authenticate } from '../modules/auth';
import { getUser, getUsers } from '../modules/database';
import { throwOnValidateError } from '../modules/utils';
import { getLogger } from '../modules/logging';

const log = getLogger('controller-user');

export function registerUserRoutes(app: Express) {
  app.get(
    '/users',
    query('skip').isNumeric().optional(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      try {
        let skip = null;

        if (req.query['skip']) {
          skip = parseInt((req.query['skip'] as string) ?? '0', 10);
        }

        const users = await getUsers(skip);

        if (!users) {
          return res.sendStatus(500);
        }

        res.json(users).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );

  app.get(
    '/user/:uuid',
    param('uuid').isUUID(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      try {
        const user = await getUser(req.params['uuid']);

        if (!user) {
          return res.sendStatus(500);
        }

        res.json(user).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );

  app.get(
    '/user',
    authenticate({ failureRedirect: '/auth' }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as User;
        const result = await getUser(user?.id);

        return res.json(result).end();
      } catch (error) {
        return res.status(500).json(error).end();
      }
    }
  );
}
