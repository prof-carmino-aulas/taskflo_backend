import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Express } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { JsonTaskRepository } from "../../src/repositories/json-task.repository";

/**
 * End-to-end: requisições HTTP reais contra o app completo
 * (rotas → validação → controller → service → repositório JSON em disco).
 * Cada teste usa um arquivo novo numa pasta temporária.
 */
const MISSING_ID = "99999999-9999-4999-8999-999999999999";

let dir: string;
let file: string;
let app: Express;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "taskflow-e2e-"));
  file = path.join(dir, "tasks.json");
  app = createApp({ repository: new JsonTaskRepository(file) });
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const createTask = (body: object) => request(app).post("/api/tasks").send(body);

describe("GET /health", () => {
  it("responde ok", async () => {
    await request(app).get("/health").expect(200, { status: "ok" });
  });
});

describe("POST /api/tasks", () => {
  it("cria com padrões, devolve 201 + Location e grava no disco", async () => {
    const res = await createTask({ title: "Estudar Flutter" }).expect(201);

    expect(res.body).toMatchObject({
      title: "Estudar Flutter",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: null,
    });
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.headers.location).toBe(`/api/tasks/${res.body.id}`);

    const saved = JSON.parse(await readFile(file, "utf-8"));
    expect(saved).toHaveLength(1);
  });

  it("devolve dueDate no formato AAAA-MM-DD", async () => {
    const res = await createTask({ title: "Prova", dueDate: "2026-11-05" }).expect(201);
    expect(res.body.dueDate).toBe("2026-11-05");
  });

  it("400 com detalhes por campo quando inválido", async () => {
    const res = await createTask({ title: "", priority: "urgente" }).expect(400);
    expect(res.body.error).toBe("Dados inválidos");
    expect(res.body.details.map((d: { field: string }) => d.field)).toEqual(["title", "priority"]);
  });

  it("400 para JSON malformado", async () => {
    const res = await request(app).post("/api/tasks").set("Content-Type", "application/json").send("{oops").expect(400);
    expect(res.body).toEqual({ error: "JSON malformado" });
  });

  it("ignora campos que não fazem parte do DTO (ex.: id, createdAt)", async () => {
    const res = await createTask({ title: "x", id: "meu-id", createdAt: "2000-01-01" }).expect(201);
    expect(res.body.id).not.toBe("meu-id");
    expect(res.body.createdAt).not.toContain("2000");
  });
});

describe("GET /api/tasks", () => {
  beforeEach(async () => {
    await createTask({ title: "Comprar pão", priority: "low" });
    await createTask({ title: "Estudar Dart", priority: "high", status: "done" });
    await createTask({ title: "Preparar aula de Flutter", priority: "medium", dueDate: "2026-10-30" });
  });

  it("lista todas", async () => {
    const res = await request(app).get("/api/tasks").expect(200);
    expect(res.body).toHaveLength(3);
  });

  it("filtra por status e busca", async () => {
    const done = await request(app).get("/api/tasks?status=done").expect(200);
    expect(done.body.map((t: { title: string }) => t.title)).toEqual(["Estudar Dart"]);

    const search = await request(app).get("/api/tasks?search=flutter").expect(200);
    expect(search.body).toHaveLength(1);
  });

  it("ordena por prioridade", async () => {
    const res = await request(app).get("/api/tasks?sort=priority&order=desc").expect(200);
    expect(res.body.map((t: { priority: string }) => t.priority)).toEqual(["high", "medium", "low"]);
  });

  it("400 para filtro inválido", async () => {
    await request(app).get("/api/tasks?status=feito").expect(400);
  });
});

describe("GET /api/tasks/:id", () => {
  it("busca por id", async () => {
    const { body: created } = await createTask({ title: "Ler docs" });
    const res = await request(app).get(`/api/tasks/${created.id}`).expect(200);
    expect(res.body).toEqual(created);
  });

  it("404 quando não existe", async () => {
    const res = await request(app).get(`/api/tasks/${MISSING_ID}`).expect(404);
    expect(res.body).toEqual({ error: "Tarefa não encontrado(a)" });
  });

  it("400 quando o id não é UUID", async () => {
    await request(app).get("/api/tasks/123").expect(400);
  });
});

describe("PUT /api/tasks/:id", () => {
  it("substitui a tarefa", async () => {
    const { body: created } = await createTask({ title: "Antigo", description: "algo" });

    const res = await request(app)
      .put(`/api/tasks/${created.id}`)
      .send({ title: "Novo", description: "", status: "in_progress", priority: "high", dueDate: null })
      .expect(200);

    expect(res.body).toMatchObject({ id: created.id, title: "Novo", description: "", status: "in_progress" });
    expect(res.body.createdAt).toBe(created.createdAt);
  });

  it("400 quando falta campo", async () => {
    const { body: created } = await createTask({ title: "x" });
    await request(app).put(`/api/tasks/${created.id}`).send({ title: "y" }).expect(400);
  });

  it("404 quando não existe", async () => {
    await request(app)
      .put(`/api/tasks/${MISSING_ID}`)
      .send({ title: "y", description: "", status: "done", priority: "low", dueDate: null })
      .expect(404);
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("altera só o que foi enviado", async () => {
    const { body: created } = await createTask({ title: "Manter", priority: "low" });

    const res = await request(app).patch(`/api/tasks/${created.id}`).send({ priority: "high" }).expect(200);

    expect(res.body).toMatchObject({ title: "Manter", priority: "high" });
  });

  it("400 com corpo vazio", async () => {
    const { body: created } = await createTask({ title: "x" });
    await request(app).patch(`/api/tasks/${created.id}`).send({}).expect(400);
  });
});

describe("PATCH /api/tasks/:id/toggle", () => {
  it("conclui e reabre", async () => {
    const { body: created } = await createTask({ title: "Alternar" });

    const first = await request(app).patch(`/api/tasks/${created.id}/toggle`).expect(200);
    expect(first.body.status).toBe("done");

    const second = await request(app).patch(`/api/tasks/${created.id}/toggle`).expect(200);
    expect(second.body.status).toBe("pending");
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("exclui e depois responde 404", async () => {
    const { body: created } = await createTask({ title: "Apagar" });

    await request(app).delete(`/api/tasks/${created.id}`).expect(204);
    await request(app).get(`/api/tasks/${created.id}`).expect(404);
    await request(app).delete(`/api/tasks/${created.id}`).expect(404);
  });
});

describe("GET /api/tasks/stats", () => {
  it("resume as tarefas", async () => {
    await createTask({ title: "a" });
    await createTask({ title: "b", status: "done" });
    await createTask({ title: "c", status: "in_progress", dueDate: "2020-01-01" });

    const res = await request(app).get("/api/tasks/stats").expect(200);

    expect(res.body).toEqual({ total: 3, pending: 1, inProgress: 1, done: 1, overdue: 1 });
  });
});

describe("fluxo completo do app", () => {
  it("cria → lista → edita → conclui → exclui", async () => {
    const { body: task } = await createTask({ title: "Fluxo", priority: "medium" }).expect(201);

    let list = await request(app).get("/api/tasks").expect(200);
    expect(list.body).toHaveLength(1);

    await request(app).patch(`/api/tasks/${task.id}`).send({ title: "Fluxo editado" }).expect(200);
    await request(app).patch(`/api/tasks/${task.id}/toggle`).expect(200);

    const { body: final } = await request(app).get(`/api/tasks/${task.id}`).expect(200);
    expect(final).toMatchObject({ title: "Fluxo editado", status: "done" });

    await request(app).delete(`/api/tasks/${task.id}`).expect(204);
    list = await request(app).get("/api/tasks").expect(200);
    expect(list.body).toEqual([]);
  });

  it("rota inexistente → 404", async () => {
    await request(app).get("/api/nada").expect(404, { error: "Rota não encontrada" });
  });

  it("permite CORS (Flutter Web)", async () => {
    const res = await request(app).get("/api/tasks").set("Origin", "http://localhost:5000");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });
});
