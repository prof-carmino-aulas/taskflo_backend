import { beforeEach, describe, expect, it } from "vitest";
import { NotFoundError } from "../../src/errors/app-error";
import { InMemoryTaskRepository } from "../../src/repositories/in-memory-task.repository";
import { TaskService } from "../../src/services/task.service";
import { FakeClock, makeTask, SequentialIds } from "../helpers/factories";

const MISSING_ID = "99999999-9999-4999-8999-999999999999";

describe("TaskService", () => {
  let repo: InMemoryTaskRepository;
  let clock: FakeClock;
  let service: TaskService;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
    clock = new FakeClock();
    service = new TaskService(repo, clock, new SequentialIds());
  });

  describe("create", () => {
    it("gera id e datas e persiste a tarefa", async () => {
      const task = await service.create({
        title: "Estudar Flutter",
        description: "",
        status: "pending",
        priority: "high",
        dueDate: null,
      });

      expect(task.id).toBe("00000000-0000-4000-8000-000000000001");
      expect(task.createdAt).toEqual(clock.now());
      expect(task.updatedAt).toEqual(task.createdAt);
      expect(await repo.findById(task.id)).toEqual(task);
    });
  });

  describe("getById", () => {
    it("retorna a tarefa existente", async () => {
      const seeded = await repo.save(makeTask());
      expect(await service.getById(seeded.id)).toEqual(seeded);
    });

    it("lança NotFoundError quando não existe", async () => {
      await expect(service.getById(MISSING_ID)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("list", () => {
    it("aplica filtro e ordenação", async () => {
      await repo.save(makeTask({ id: "a", title: "B", priority: "low" }));
      await repo.save(makeTask({ id: "b", title: "A", priority: "high" }));
      await repo.save(makeTask({ id: "c", title: "C", priority: "high", status: "done" }));

      const result = await service.list({ status: "pending", sort: "title", order: "asc" });

      expect(result.map((t) => t.title)).toEqual(["A", "B"]);
    });
  });

  describe("update / replace", () => {
    it("PATCH altera só os campos enviados e atualiza updatedAt", async () => {
      const original = await repo.save(makeTask({ title: "Antigo", priority: "low" }));
      clock.advance(60_000);

      const updated = await service.update(original.id, { priority: "high" });

      expect(updated.title).toBe("Antigo");
      expect(updated.priority).toBe("high");
      expect(updated.createdAt).toEqual(original.createdAt);
      expect(updated.updatedAt).toEqual(clock.now());
      expect(updated.updatedAt.getTime()).toBeGreaterThan(original.updatedAt.getTime());
    });

    it("PUT substitui todos os campos editáveis", async () => {
      const original = await repo.save(makeTask({ description: "velha" }));

      const replaced = await service.replace(original.id, {
        title: "Novo",
        description: "",
        status: "in_progress",
        priority: "low",
        dueDate: new Date("2026-12-01"),
      });

      expect(replaced).toMatchObject({ title: "Novo", description: "", status: "in_progress", priority: "low" });
      expect(replaced.dueDate).toEqual(new Date("2026-12-01"));
    });

    it("não deixa o DTO trocar o id", async () => {
      const original = await repo.save(makeTask());
      const updated = await service.update(original.id, { id: "hack" } as never);
      expect(updated.id).toBe(original.id);
    });

    it("lança NotFoundError ao atualizar inexistente", async () => {
      await expect(service.update(MISSING_ID, { title: "x" })).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("toggle", () => {
    it.each([
      ["pending", "done"],
      ["in_progress", "done"],
      ["done", "pending"],
    ] as const)("%s → %s", async (from, to) => {
      const task = await repo.save(makeTask({ status: from }));
      expect((await service.toggle(task.id)).status).toBe(to);
    });
  });

  describe("remove", () => {
    it("exclui a tarefa", async () => {
      const task = await repo.save(makeTask());
      await service.remove(task.id);
      expect(await repo.findById(task.id)).toBeNull();
    });

    it("lança NotFoundError ao excluir inexistente", async () => {
      await expect(service.remove(MISSING_ID)).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
