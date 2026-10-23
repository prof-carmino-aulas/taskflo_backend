import { describe, expect, it } from "vitest";
import { InMemoryTaskRepository } from "../../src/repositories/in-memory-task.repository";
import { TaskStatsService } from "../../src/services/task-stats.service";
import { FakeClock, makeTask } from "../helpers/factories";

describe("TaskStatsService", () => {
  it("conta por status e identifica atrasadas", async () => {
    const clock = new FakeClock(new Date("2026-10-23T12:00:00Z"));
    const repo = new InMemoryTaskRepository([
      makeTask({ id: "1", status: "pending", dueDate: new Date("2026-10-20") }), // atrasada
      makeTask({ id: "2", status: "in_progress", dueDate: new Date("2026-10-23") }), // vence hoje
      makeTask({ id: "3", status: "done", dueDate: new Date("2026-10-01") }), // concluída não conta
      makeTask({ id: "4", status: "pending", dueDate: null }),
    ]);

    const stats = await new TaskStatsService(repo, clock).getStats();

    expect(stats).toEqual({ total: 4, pending: 2, inProgress: 1, done: 1, overdue: 1 });
  });

  it("retorna zeros sem tarefas", async () => {
    const stats = await new TaskStatsService(new InMemoryTaskRepository(), new FakeClock()).getStats();
    expect(stats).toEqual({ total: 0, pending: 0, inProgress: 0, done: 0, overdue: 0 });
  });
});
