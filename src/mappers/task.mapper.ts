import type { Task } from "../domain/task.entity";
import type { TaskResponseDto } from "../dtos";

/** Única responsabilidade: converter entidade em/para formatos externos. */
export const TaskMapper = {
  toResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  },

  toResponseList(tasks: Task[]): TaskResponseDto[] {
    return tasks.map(TaskMapper.toResponse);
  },

  /** Formato gravado no arquivo JSON (mesmo shape do response, todas as datas ISO). */
  toPersistence(task: Task): Record<string, unknown> {
    return {
      ...task,
      dueDate: task.dueDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  },

  fromPersistence(raw: Record<string, any>): Task {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      priority: raw.priority,
      dueDate: raw.dueDate ? new Date(raw.dueDate) : null,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  },
};
