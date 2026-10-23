import type { Request, Response } from "express";
import type { CreateTaskDto, ListTasksQueryDto, ReplaceTaskDto, TaskIdParamsDto, UpdateTaskDto } from "../dtos";
import { TaskMapper } from "../mappers/task.mapper";
import type { TaskService } from "../services/task.service";
import type { TaskStatsService } from "../services/task-stats.service";

/**
 * Camada HTTP: lê os DTOs já validados, chama o service e devolve
 * o TaskResponseDto com o status certo. Sem regra de negócio aqui.
 */
export class TaskController {
  constructor(
    private readonly tasks: TaskService,
    private readonly stats: TaskStatsService,
  ) {}

  list = async (_req: Request, res: Response) => {
    const query = res.locals.dto.query as ListTasksQueryDto;
    res.json(TaskMapper.toResponseList(await this.tasks.list(query)));
  };

  getStats = async (_req: Request, res: Response) => {
    res.json(await this.stats.getStats());
  };

  getById = async (_req: Request, res: Response) => {
    const { id } = res.locals.dto.params as TaskIdParamsDto;
    res.json(TaskMapper.toResponse(await this.tasks.getById(id)));
  };

  create = async (_req: Request, res: Response) => {
    const body = res.locals.dto.body as CreateTaskDto;
    const task = await this.tasks.create(body);
    res.status(201).location(`/api/tasks/${task.id}`).json(TaskMapper.toResponse(task));
  };

  replace = async (_req: Request, res: Response) => {
    const { id } = res.locals.dto.params as TaskIdParamsDto;
    const body = res.locals.dto.body as ReplaceTaskDto;
    res.json(TaskMapper.toResponse(await this.tasks.replace(id, body)));
  };

  update = async (_req: Request, res: Response) => {
    const { id } = res.locals.dto.params as TaskIdParamsDto;
    const body = res.locals.dto.body as UpdateTaskDto;
    res.json(TaskMapper.toResponse(await this.tasks.update(id, body)));
  };

  toggle = async (_req: Request, res: Response) => {
    const { id } = res.locals.dto.params as TaskIdParamsDto;
    res.json(TaskMapper.toResponse(await this.tasks.toggle(id)));
  };

  remove = async (_req: Request, res: Response) => {
    const { id } = res.locals.dto.params as TaskIdParamsDto;
    await this.tasks.remove(id);
    res.status(204).send();
  };
}
