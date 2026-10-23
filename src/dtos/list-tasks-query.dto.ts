import { z } from "zod";
import { prioritySchema, statusSchema } from "./common";

/** Query string do GET /tasks. */
export const listTasksQuerySchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["createdAt", "dueDate", "priority", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;
