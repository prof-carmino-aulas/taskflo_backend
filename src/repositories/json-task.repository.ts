import { promises as fs } from "node:fs";
import path from "node:path";
import type { Task } from "../domain/task.entity";
import { TaskMapper } from "../mappers/task.mapper";
import type { TaskRepository } from "./task.repository";

/** Persiste num arquivo JSON — dispensa instalar banco para a aula. */
export class JsonTaskRepository implements TaskRepository {
  constructor(private readonly filePath = path.resolve("data", "tasks.json")) {}

  private async read(): Promise<Task[]> {
    try {
      const raw = JSON.parse(await fs.readFile(this.filePath, "utf-8")) as Record<string, unknown>[];
      return raw.map(TaskMapper.fromPersistence);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  private async write(tasks: Task[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(tasks.map(TaskMapper.toPersistence), null, 2));
  }

  async findAll() {
    return this.read();
  }

  async findById(id: string) {
    return (await this.read()).find((t) => t.id === id) ?? null;
  }

  async save(task: Task) {
    const tasks = await this.read();
    const i = tasks.findIndex((t) => t.id === task.id);
    if (i === -1) tasks.push(task);
    else tasks[i] = task;
    await this.write(tasks);
    return task;
  }

  async delete(id: string) {
    const tasks = await this.read();
    const remaining = tasks.filter((t) => t.id !== id);
    if (remaining.length === tasks.length) return false;
    await this.write(remaining);
    return true;
  }
}
