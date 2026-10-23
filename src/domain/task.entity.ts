/**
 * Entidade de domínio: é como a tarefa existe DENTRO do sistema.
 * Usa Date de verdade — a conversão para string ISO acontece só no mapper,
 * quando a tarefa sai pela API (TaskResponseDto).
 */
export const TASK_STATUSES = ["pending", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3 };
