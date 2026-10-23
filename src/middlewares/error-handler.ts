import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

/** Traduz qualquer erro em uma resposta HTTP padronizada. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // JSON malformado no corpo (gerado pelo express.json)
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON malformado" });
  }
  if (process.env.NODE_ENV !== "test") console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}
