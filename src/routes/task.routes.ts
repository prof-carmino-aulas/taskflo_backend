import { Router } from "express";
import type { TaskController } from "../controllers/task.controller";
import {
  createTaskSchema,
  listTasksQuerySchema,
  replaceTaskSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "../dtos";
import { validate } from "../middlewares/validate";

/** Só liga URL + validação de DTO + método do controller. */
export function taskRoutes(c: TaskController): Router {
  const r = Router();
  const withId = { params: taskIdParamsSchema };

  r.get("/", validate({ query: listTasksQuerySchema }), c.list);
  r.get("/stats", c.getStats);
  r.get("/:id", validate(withId), c.getById);
  r.post("/", validate({ body: createTaskSchema }), c.create);
  r.put("/:id", validate({ ...withId, body: replaceTaskSchema }), c.replace);
  r.patch("/:id", validate({ ...withId, body: updateTaskSchema }), c.update);
  r.patch("/:id/toggle", validate(withId), c.toggle);
  r.delete("/:id", validate(withId), c.remove);

  return r;
}
