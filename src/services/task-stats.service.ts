import type { TaskStatsDto } from "../dtos";
import type { TaskRepository } from "../repositories/task.repository";
import type { Clock } from "../shared/clock";

/** Responsabilidade separada do CRUD: calcular indicadores para o dashboard. */
export class TaskStatsService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly clock: Clock,
  ) {}

  async getStats(): Promise<TaskStatsDto> {
    const tasks = await this.repo.findAll();
    const today = this.clock.now().toISOString().slice(0, 10);
    const count = (status: string) => tasks.filter((t) => t.status === status).length;

    return {
      total: tasks.length,
      pending: count("pending"),
      inProgress: count("in_progress"),
      done: count("done"),
      overdue: tasks.filter(
        (t) => t.status !== "done" && t.dueDate !== null && t.dueDate.toISOString().slice(0, 10) < today,
      ).length,
    };
  }
}
