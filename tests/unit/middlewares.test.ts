import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z, ZodError } from "zod";
import { AppError, NotFoundError } from "../../src/errors/app-error";
import { errorHandler } from "../../src/middlewares/error-handler";
import { validate } from "../../src/middlewares/validate";

function mockRes() {
  const res = { locals: {} as Record<string, any> } as Response & { body?: unknown };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn((body) => {
    res.body = body;
    return res;
  });
  return res;
}

describe("validate", () => {
  const schemas = {
    params: z.object({ id: z.string() }),
    query: z.object({ page: z.coerce.number().default(1) }),
    body: z.object({ name: z.string().trim() }),
  };

  it("coloca os DTOs convertidos em res.locals.dto e chama next", () => {
    const req = { params: { id: "a" }, query: {}, body: { name: " Ana " } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    validate(schemas)(req, res, next);

    expect(res.locals.dto).toEqual({ params: { id: "a" }, query: { page: 1 }, body: { name: "Ana" } });
    expect(next).toHaveBeenCalledOnce();
  });

  it("lança ZodError quando inválido (o errorHandler trata)", () => {
    const req = { params: { id: "a" }, query: {}, body: {} } as unknown as Request;
    expect(() => validate(schemas)(req, mockRes(), vi.fn())).toThrow(ZodError);
  });
});

describe("errorHandler", () => {
  const run = (err: unknown) => {
    const res = mockRes();
    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);
    return res;
  };

  it("ZodError → 400 com detalhes por campo", () => {
    const err = z.object({ title: z.string() }).safeParse({}).error;
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toMatchObject({ error: "Dados inválidos", details: [{ field: "title" }] });
  });

  it("NotFoundError → 404", () => {
    const res = run(new NotFoundError("Tarefa"));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body).toEqual({ error: "Tarefa não encontrado(a)" });
  });

  it("AppError genérico usa o statusCode", () => {
    expect(run(new AppError(409, "Conflito")).status).toHaveBeenCalledWith(409);
  });

  it("JSON malformado → 400", () => {
    const err = Object.assign(new SyntaxError("Unexpected token"), { body: "{oops" });
    expect(run(err).body).toEqual({ error: "JSON malformado" });
  });

  it("erro desconhecido → 500 sem vazar detalhes", () => {
    const res = run(new Error("senha do banco: 123"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: "Erro interno do servidor" });
  });
});
