import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

type Schemas = { body?: ZodType; query?: ZodType; params?: ZodType };

export interface ValidatedLocals {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

/**
 * Valida e converte a requisição em DTOs ANTES do controller.
 * Os DTOs prontos ficam em res.locals.dto (req.query é somente leitura no Express 5).
 * Erros de validação seguem para o errorHandler.
 */
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const dto: ValidatedLocals = {};
    if (schemas.params) dto.params = schemas.params.parse(req.params);
    if (schemas.query) dto.query = schemas.query.parse(req.query);
    if (schemas.body) dto.body = schemas.body.parse(req.body ?? {});
    res.locals.dto = dto;
    next();
  };
}
