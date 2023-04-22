import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function omit<T, Key extends keyof T>(
  model: T,
  keys: Key[]
): Omit<T, Key> {
  for (const key of keys) {
    delete model[key];
  }

  return model;
}

export function omitEach<T, Key extends keyof T>(
  models: Array<T>,
  keys: Key[]
): Array<Omit<T, Key>> {
  return models.map((model) => omit(model, keys));
}

export function throwOnValidateError(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!validationResult(req).isEmpty()) {
    return res.sendStatus(400);
  }

  next();
}
