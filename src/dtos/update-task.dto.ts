import { z } from "zod";
import { replaceTaskSchema } from "./replace-task.dto";

/** Entrada do PATCH /tasks/:id — qualquer subconjunto, mas não vazio. */
export const updateTaskSchema = replaceTaskSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, "Envie ao menos um campo para atualizar");

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
