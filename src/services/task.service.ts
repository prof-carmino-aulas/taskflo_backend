import type { Task } from '../domain/task.entity';
import type { CreateTaskDto, ListTasksQueryDto, ReplaceTaskDto, UpdateTaskDto } from '../dtos';
import { NotFoundError } from '../errors/app-error';
import type { TaskRepository } from '../repositories/task.repository';
import type { Clock } from '../shared/clock';
import type { IdGenerator } from '../shared/id-generator';
import { filterTasks, sortTasks } from './task-query';

/** Regras de negócio do CRUD. Não conhece HTTP nem formato de resposta. */
export class TaskService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async list(query: ListTasksQueryDto): Promise<Task[]> {
    const all = await this.repo.findAll();
    return sortTasks(filterTasks(all, query), query.sort, query.order);
  }

  async getById(id: string): Promise<Task> {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundError('Tarefa');
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const now = this.clock.now();
    return this.repo.save({ id: this.ids.next(), ...dto, createdAt: now, updatedAt: now });
  }

  async replace(id: string, dto: ReplaceTaskDto): Promise<Task> {
    return this.applyChanges(id, dto);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    return this.applyChanges(id, dto);
  }

  async toggle(id: string): Promise<Task> {
    const current = await this.getById(id);
    return this.applyChanges(id, { status: current.status === 'done' ? 'pending' : 'done' });
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError('Tarefa');
  }

  private async applyChanges(id: string, changes: Partial<Task>): Promise<Task> {
    const current = await this.getById(id);
    return this.repo.save({ ...current, ...changes, id, updatedAt: this.clock.now() });
  }
}
