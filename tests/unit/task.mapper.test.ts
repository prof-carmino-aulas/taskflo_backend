import { describe, expect, it } from "vitest";
import { TaskMapper } from "../../src/mappers/task.mapper";
import { makeTask } from "../helpers/factories";

describe("TaskMapper", () => {
  it("toResponse converte datas para string e dueDate para AAAA-MM-DD", () => {
    const dto = TaskMapper.toResponse(makeTask({ dueDate: new Date("2026-11-05T00:00:00Z") }));

    expect(dto).toEqual({
      id: "00000000-0000-4000-8000-000000000001",
      title: "Tarefa de teste",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: "2026-11-05",
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:00:00.000Z",
    });
  });

  it("toResponse mantém dueDate nulo", () => {
    expect(TaskMapper.toResponse(makeTask()).dueDate).toBeNull();
  });

  it("toPersistence → fromPersistence preserva a entidade", () => {
    const task = makeTask({ dueDate: new Date("2026-12-24T00:00:00Z") });
    const roundTrip = TaskMapper.fromPersistence(JSON.parse(JSON.stringify(TaskMapper.toPersistence(task))));
    expect(roundTrip).toEqual(task);
  });
});
