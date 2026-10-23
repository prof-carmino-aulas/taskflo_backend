import cors from "cors";
import express, { type Express } from "express";
import { buildContainer, type Dependencies } from "./container";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";
import { taskRoutes } from "./routes/task.routes";

export function createApp(deps: Partial<Dependencies> = {}): Express {
  const { taskController } = buildContainer(deps);
  const app = express();

  app.use(cors()); // necessário para o Flutter Web
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/tasks", taskRoutes(taskController));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
