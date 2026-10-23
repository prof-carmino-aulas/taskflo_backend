import type { Task } from "../domain/task.entity";
import type { TaskRepository } from "./task.repository";

/** Guarda em memória. Usado nos testes unitários e útil para protótipos. */
export class InMemoryTaskRepository implements TaskRepository {
  private readonly items = new Map<string, Task>();

  constructor(seed: Task[] = []) {
    seed.forEach((t) => this.items.set(t.id, { ...t }));
  }

  async findAll() {
    return [...this.items.values()].map((t) => ({ ...t }));
  }

  async findById(id: string) {
    const t = this.items.get(id);
    return t ? { ...t } : null;
  }

  async save(task: Task) {
    this.items.set(task.id, { ...task });
    return { ...task };
  }

  async delete(id: string) {
    return this.items.delete(id);
  }
}
