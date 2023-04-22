import { Express } from 'express';
import { query, param } from 'express-validator';

import { getPackages, getPackage } from '../modules/database';
import { throwOnValidateError } from '../modules/utils';
import { Request, Response } from 'express';

export function registerPackageRoutes(app: Express) {
  app.get(
    '/packages',
    query('name').isLength({ min: 3, max: 256 }).optional().isString(),
    query('author').isLength({ max: 256 }).optional().isString(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      const packages = await getPackages(
        req.query.name as string,
        req.query.author as string
      );

      if (!packages) {
        return res.sendStatus(500);
      }

      const statusCode = packages.length ? 200 : 204;

      res.status(statusCode);

      if (packages.length) {
        res.json(packages);
      }

      res.end();
    }
  );

  app.get(
    '/package/:name',
    query('all_releases').optional().isBoolean(),
    param('name').isLength({ min: 3, max: 256 }).isString(),
    throwOnValidateError,
    async (req: Request, res: Response) => {
      const pkg = await getPackage(req.params.name);

      if (!pkg) {
        return res.sendStatus(404);
      }

      res.status(200).json(pkg).end();
    }
  );
}
