import type { Task } from "../../src/domain/task.entity";
import type { Clock } from "../../src/shared/clock";
import type { IdGenerator } from "../../src/shared/id-generator";

/** Cria uma tarefa válida; sobrescreva só o que importa para o teste. */
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Tarefa de teste",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: null,
    createdAt: new Date("2026-10-01T10:00:00.000Z"),
    updatedAt: new Date("2026-10-01T10:00:00.000Z"),
    ...overrides,
  };
}

/** Relógio controlável: começa numa data fixa e pode avançar. */
export class FakeClock implements Clock {
  constructor(private current = new Date("2026-10-23T12:00:00.000Z")) {}
  now() {
    return new Date(this.current);
  }
  advance(ms: number) {
    this.current = new Date(this.current.getTime() + ms);
  }
}

/** Gera UUIDs previsíveis: ...0001, ...0002, ... */
export class SequentialIds implements IdGenerator {
  private n = 0;
  next() {
    this.n += 1;
    return `00000000-0000-4000-8000-${String(this.n).padStart(12, "0")}`;
  }
}
