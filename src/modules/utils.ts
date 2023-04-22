import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { validateAccessToken } from './database';

/**
 * Omit the specified array of keys from the specified object.
 * @param model Model to strip data from.
 * @param keys List of keys to remove.
 * @returns Model with keys removed.
 */
export function omit<T, Key extends keyof T>(
  model: T,
  keys: Key[]
): Omit<T, Key> {
  for (const key of keys) {
    delete model[key];
  }

  return model;
}

/**
 * Omit the specified array of keys from each instance of the object in the specified array.
 * @param models Array of models to strip data from.
 * @param keys List of keys to remove.
 * @returns Array of models with keys removed.
 */
export function omitEach<T, Key extends keyof T>(
  models: Array<T>,
  keys: Key[]
): Array<Omit<T, Key>> {
  return models.map((model) => omit(model, keys));
}

/**
 * Express middleware which returns an HTTP 400 and halts if a validation error occurred.
 * @param req Request
 * @param res Response
 * @param next Callback
 */
export function throwOnValidateError(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!validationResult(req).isEmpty()) {
    res.sendStatus(400);
    return;
  }

  next();
}

/**
 * Express middleware which returns HTTP 401/403 if a valid token is not present in the Authorization header.
 * @param req Request
 * @param res Response
 * @param next Callback
 */
export function checkAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }

  const token = req.headers.authorization.replace(/^Bearer\s+/, '');

  if (!validateAccessToken(token)) {
    res.sendStatus(403);
    return;
  }

  next();
}

/**
 * Applied validation rules for package names.
 * @param chain Validation chain
 * @returns New validation chain
 */
export function validatePackageName(chain: ValidationChain): ValidationChain {
  return chain.isString().isLength({ min: 3, max: 256 });
}

/**
 * Applies validation rules for usernames.
 * @param chain Validation chain
 * @returns New validation chain
 */
export function validateUsername(chain: ValidationChain): ValidationChain {
  return chain.isString().isLength({ min: 1, max: 256 }).isAlphanumeric();
}
