import { Express, Request, Response } from 'express';
import { query, param, body } from 'express-validator';

import { authenticate } from '../modules/auth';
import { getPackages, getPackage } from '../modules/database';
import {
  throwOnValidateError,
  validatePackageName,
  validateUsername
} from '../modules/utils';

export function registerPackageRoutes(app: Express) {
  app.get(
    '/packages',
    validatePackageName(query('name')).optional(),
    validateUsername(query('author')).optional(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      const packages = await getPackages(
        req.query.name as string,
        req.query.author as string
      );

      if (!packages) {
        return res.sendStatus(500);
      }

      res.json(packages).end();
    }
  );

  app.get(
    '/package/:name',
    query('all_releases').optional().isBoolean(),
    validatePackageName(param('name')),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      const pkg = await getPackage(req.params.name);

      if (!pkg) {
        return res.sendStatus(404);
      }

      res.status(200).json(pkg).end();
    }
  );

  app.get(
    '/package/uuid/:uuid',
    query('all_releases').isBoolean().optional(),
    param('uuid').isUUID(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      const pkg = await getPackage(null, req.params.uuid);

      if (!pkg) {
        return res.sendStatus(404);
      }

      res.status(200).json(pkg).end();
    }
  );

  app.put(
    '/package',
    authenticate({ failureRedirect: '/auth' }),
    validatePackageName(body('package_name'))
  );
}
