import type { TaskPriority, TaskStatus } from "../domain/task.entity";

/** Formato que sai pela API. Datas viram string; dueDate sai como "AAAA-MM-DD". */
export interface TaskResponseDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
