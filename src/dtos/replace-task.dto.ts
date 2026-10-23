import { z } from "zod";
import { descriptionSchema, dueDateSchema, prioritySchema, statusSchema, titleSchema } from "./common";

/** Entrada do PUT /tasks/:id — todos os campos editáveis são obrigatórios. */
export const replaceTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  priority: prioritySchema,
  dueDate: dueDateSchema,
});

export type ReplaceTaskDto = z.infer<typeof replaceTaskSchema>;
