import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "../domain/task.entity";

export const statusSchema = z.enum(TASK_STATUSES);
export const prioritySchema = z.enum(TASK_PRIORITIES);
export const titleSchema = z.string().trim().min(1, "title é obrigatório").max(120);
export const descriptionSchema = z.string().trim().max(1000);

/** Aceita "2026-11-05" ou ISO completo; entrega um Date para o service. */
export const dueDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "dueDate deve ser uma data ISO válida")
  .transform((v) => new Date(v))
  .nullable();
