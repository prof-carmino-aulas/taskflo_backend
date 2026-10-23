import type { Task } from "../domain/task.entity";

/**
 * Contrato de persistência. Services dependem desta interface, nunca de uma
 * implementação concreta (inversão de dependência).
 */
export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>; // cria ou atualiza
  delete(id: string): Promise<boolean>;
}
