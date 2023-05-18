import { Express, Request, Response } from 'express';
import { query, param } from 'express-validator';

import { getPackages, getPackage } from '../modules/database';
import {
  throwOnValidateError,
  validatePackageName,
  validateUsername
} from '../modules/utils';
import { getLogger } from '../modules/logging';

const log = getLogger('controller-package');

export function registerPackageRoutes(app: Express) {
  app.get(
    '/packages',
    query('skip').isNumeric().optional(),
    validatePackageName(query('name')).optional(),
    validateUsername(query('author')).optional(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      try {
        let skip = null;

        if (req.query['skip']) {
          skip = parseInt((req.query['skip'] as string) ?? '0', 10);
        }

        const packages = await getPackages(
          req.query['name'] as string,
          req.query['author'] as string,
          skip
        );

        if (!packages) {
          return res.sendStatus(500);
        }

        res.json(packages).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );

  app.get(
    '/package/:uuid',
    query('all_releases').isBoolean().optional(),
    param('uuid').isUUID(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      try {
        const pkg = await getPackage(
          null,
          req.params.uuid,
          (req.query['all_releases'] as string)?.toLowerCase() === 'true'
        );

        if (!pkg) {
          return res.sendStatus(404);
        }

        res.status(200).json(pkg).end();
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
        return res.status(500).json(error).end();
      }
    }
  );
}
