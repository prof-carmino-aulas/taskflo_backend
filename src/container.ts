import { TaskController } from "./controllers/task.controller";
import { JsonTaskRepository } from "./repositories/json-task.repository";
import type { TaskRepository } from "./repositories/task.repository";
import { TaskService } from "./services/task.service";
import { TaskStatsService } from "./services/task-stats.service";
import { systemClock, type Clock } from "./shared/clock";
import { uuidGenerator, type IdGenerator } from "./shared/id-generator";

export interface Dependencies {
  repository: TaskRepository;
  clock: Clock;
  ids: IdGenerator;
}

/**
 * Composition root: o ÚNICO lugar que conhece as classes concretas.
 * Nos testes, basta passar dependências diferentes.
 */
export function buildContainer(overrides: Partial<Dependencies> = {}) {
  const deps: Dependencies = {
    repository: overrides.repository ?? new JsonTaskRepository(),
    clock: overrides.clock ?? systemClock,
    ids: overrides.ids ?? uuidGenerator,
  };

  const taskService = new TaskService(deps.repository, deps.clock, deps.ids);
  const statsService = new TaskStatsService(deps.repository, deps.clock);
  const taskController = new TaskController(taskService, statsService);

  return { ...deps, taskService, statsService, taskController };
}
