import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InMemoryTaskRepository } from "../../src/repositories/in-memory-task.repository";
import { JsonTaskRepository } from "../../src/repositories/json-task.repository";
import type { TaskRepository } from "../../src/repositories/task.repository";
import { makeTask } from "../helpers/factories";

/**
 * O mesmo conjunto de testes roda contra as duas implementações:
 * garante que ambas cumprem o contrato TaskRepository.
 */
let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "taskflow-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const implementations: [string, () => TaskRepository][] = [
  ["InMemoryTaskRepository", () => new InMemoryTaskRepository()],
  ["JsonTaskRepository", () => new JsonTaskRepository(path.join(dir, "tasks.json"))],
];

describe.each(implementations)("%s (contrato)", (_name, factory) => {
  it("começa vazio", async () => {
    expect(await factory().findAll()).toEqual([]);
  });

  it("save cria e findById encontra", async () => {
    const repo = factory();
    const task = makeTask();
    await repo.save(task);
    expect(await repo.findById(task.id)).toEqual(task);
  });

  it("save com id existente atualiza em vez de duplicar", async () => {
    const repo = factory();
    await repo.save(makeTask({ title: "v1" }));
    await repo.save(makeTask({ title: "v2" }));
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("v2");
  });

  it("findById devolve null quando não existe", async () => {
    expect(await factory().findById("x")).toBeNull();
  });

  it("delete remove e informa se removeu", async () => {
    const repo = factory();
    await repo.save(makeTask());
    expect(await repo.delete(makeTask().id)).toBe(true);
    expect(await repo.delete(makeTask().id)).toBe(false);
    expect(await repo.findAll()).toEqual([]);
  });

  it("devolve cópias: mudar o objeto retornado não altera o armazenado", async () => {
    const repo = factory();
    await repo.save(makeTask());
    const found = (await repo.findById(makeTask().id))!;
    found.title = "mutado";
    expect((await repo.findById(found.id))!.title).toBe("Tarefa de teste");
  });
});

describe("JsonTaskRepository (específico)", () => {
  it("grava no disco e outra instância lê os mesmos dados", async () => {
    const file = path.join(dir, "sub", "tasks.json");
    await new JsonTaskRepository(file).save(makeTask());

    expect(JSON.parse(await readFile(file, "utf-8"))).toHaveLength(1);
    expect(await new JsonTaskRepository(file).findAll()).toEqual([makeTask()]);
  });

  it("propaga erro se o arquivo estiver corrompido", async () => {
    const file = path.join(dir, "tasks.json");
    await writeFile(file, "{corrompido");
    await expect(new JsonTaskRepository(file).findAll()).rejects.toThrow(SyntaxError);
  });
});
