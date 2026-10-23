import { describe, expect, it } from "vitest";
import {
  createTaskSchema,
  listTasksQuerySchema,
  replaceTaskSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "../../src/dtos";

describe("CreateTaskDto", () => {
  it("aplica padrões quando só o título é enviado", () => {
    expect(createTaskSchema.parse({ title: "  Estudar  " })).toEqual({
      title: "Estudar",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: null,
    });
  });

  it("converte dueDate em Date", () => {
    const dto = createTaskSchema.parse({ title: "x", dueDate: "2026-11-05" });
    expect(dto.dueDate).toBeInstanceOf(Date);
  });

  it.each([
    [{}, "title"],
    [{ title: "   " }, "title"],
    [{ title: "x", priority: "urgente" }, "priority"],
    [{ title: "x", status: "feito" }, "status"],
    [{ title: "x", dueDate: "amanhã" }, "dueDate"],
    [{ title: "a".repeat(121) }, "title"],
  ])("rejeita %j no campo %s", (input, field) => {
    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual([field]);
  });
});

describe("ReplaceTaskDto", () => {
  it("exige todos os campos", () => {
    expect(replaceTaskSchema.safeParse({ title: "x" }).success).toBe(false);
  });

  it("aceita dueDate null", () => {
    const dto = replaceTaskSchema.parse({
      title: "x",
      description: "",
      status: "done",
      priority: "low",
      dueDate: null,
    });
    expect(dto.dueDate).toBeNull();
  });
});

describe("UpdateTaskDto", () => {
  it("aceita atualização parcial", () => {
    expect(updateTaskSchema.parse({ status: "done" })).toEqual({ status: "done" });
  });

  it("rejeita corpo vazio", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });
});

describe("ListTasksQueryDto", () => {
  it("usa ordenação padrão", () => {
    expect(listTasksQuerySchema.parse({})).toEqual({ sort: "createdAt", order: "desc" });
  });

  it("rejeita campo de ordenação desconhecido", () => {
    expect(listTasksQuerySchema.safeParse({ sort: "senha" }).success).toBe(false);
  });
});

describe("TaskIdParamsDto", () => {
  it("aceita UUID e rejeita texto qualquer", () => {
    expect(taskIdParamsSchema.safeParse({ id: "6b5f1122-ff11-41b4-a667-b39a7e8e343f" }).success).toBe(true);
    expect(taskIdParamsSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});
