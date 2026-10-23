import { z } from 'zod';
import { descriptionSchema, dueDateSchema, prioritySchema, statusSchema, titleSchema } from './common';

/** Entrada do POST /tasks. Só title é obrigatório; o resto tem padrão. */
export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.default(''),
  status: statusSchema.default('pending'),
  priority: prioritySchema.default('medium'),
  dueDate: dueDateSchema.default(null),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
