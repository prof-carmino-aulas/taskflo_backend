import { describe, expect, it } from "vitest";
import { filterTasks, sortTasks } from "../../src/services/task-query";
import { makeTask } from "../helpers/factories";

const tasks = [
  makeTask({
    id: "1",
    title: "Comprar pão",
    description: "padaria",
    status: "pending",
    priority: "low",
    dueDate: new Date("2026-11-10"),
    createdAt: new Date("2026-10-01"),
  }),
  makeTask({
    id: "2",
    title: "Estudar Dart",
    status: "done",
    priority: "high",
    dueDate: null,
    createdAt: new Date("2026-10-03"),
  }),
  makeTask({
    id: "3",
    title: "Apresentar aula",
    description: "Flutter",
    status: "in_progress",
    priority: "medium",
    dueDate: new Date("2026-10-30"),
    createdAt: new Date("2026-10-02"),
  }),
];
const ids = (list: { id: string }[]) => list.map((t) => t.id);

describe("filterTasks", () => {
  it("sem filtros devolve tudo", () => {
    expect(filterTasks(tasks, {})).toHaveLength(3);
  });

  it("filtra por status", () => {
    expect(ids(filterTasks(tasks, { status: "done" }))).toEqual(["2"]);
  });

  it("filtra por prioridade", () => {
    expect(ids(filterTasks(tasks, { priority: "low" }))).toEqual(["1"]);
  });

  it("busca no título e na descrição, sem diferenciar maiúsculas", () => {
    expect(ids(filterTasks(tasks, { search: "DART" }))).toEqual(["2"]);
    expect(ids(filterTasks(tasks, { search: "flutter" }))).toEqual(["3"]);
  });

  it("combina filtros", () => {
    expect(filterTasks(tasks, { status: "pending", search: "dart" })).toEqual([]);
  });
});

describe("sortTasks", () => {
  it("createdAt desc (padrão)", () => {
    expect(ids(sortTasks(tasks, "createdAt", "desc"))).toEqual(["2", "3", "1"]);
  });

  it("prioridade asc usa o peso, não a ordem alfabética", () => {
    expect(ids(sortTasks(tasks, "priority", "asc"))).toEqual(["1", "3", "2"]);
  });

  it("título asc", () => {
    expect(ids(sortTasks(tasks, "title", "asc"))).toEqual(["3", "1", "2"]);
  });

  it.each(["asc", "desc"] as const)("dueDate %s deixa tarefas sem prazo no fim", (order) => {
    expect(sortTasks(tasks, "dueDate", order).at(-1)?.id).toBe("2");
  });

  it("não altera o array original", () => {
    const copy = [...tasks];
    sortTasks(tasks, "title", "asc");
    expect(tasks).toEqual(copy);
  });
});
