import { Express, Request, Response } from 'express';
import { query, param, body } from 'express-validator';

import { authenticate } from '../modules/auth';
import { getRelease, getReleases } from '../modules/database';
import { throwOnValidateError, validatePackageName } from '../modules/utils';
import { getLogger } from '../modules/logging';

const log = getLogger('controller-release');

export function registerReleaseRoutes(app: Express) {
  app.get(
    '/releases',
    query('skip').isNumeric().optional(),
    async (req: Request, res: Response) => {
      try {
        let skip = null;

        if (req.query['skip']) {
          skip = parseInt((req.query['skip'] as string) ?? '0', 10);
        }

        const releases = await getReleases(skip);

        if (!releases) {
          return res.sendStatus(500);
        }

        res.json(releases).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );

  app.get(
    '/release/:uuid',
    param('uuid').isUUID(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      try {
        const release = await getRelease(req.params['uuid']);

        if (!release) {
          return res.sendStatus(500);
        }

        res.json(release).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );

  app.put(
    '/release',
    authenticate({ failureRedirect: '/auth' }),
    validatePackageName(body('package_name')),
    async (req: Request, res: Response) => {
      try {
        // todo: get request files and copy it to disk
        // todo: ensure package exists (create new if necessary)
        // todo: do pre-flight checks and commit release
        res.sendStatus(200).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );
}
