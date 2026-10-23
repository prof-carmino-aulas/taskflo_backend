import { PRIORITY_WEIGHT, type Task } from "../domain/task.entity";
import type { ListTasksQueryDto } from "../dtos";

/** Funções puras de filtro e ordenação — fáceis de testar isoladamente. */

export function filterTasks(tasks: Task[], q: Pick<ListTasksQueryDto, "status" | "priority" | "search">): Task[] {
  const term = q.search?.toLowerCase();
  return tasks.filter(
    (t) =>
      (!q.status || t.status === q.status) &&
      (!q.priority || t.priority === q.priority) &&
      (!term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
  );
}

export function sortTasks(tasks: Task[], sort: ListTasksQueryDto["sort"], order: ListTasksQueryDto["order"]): Task[] {
  const dir = order === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    switch (sort) {
      case "priority":
        return (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]) * dir;
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "dueDate":
        // sem prazo vai sempre para o fim, independente da direção
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (a.dueDate.getTime() - b.dueDate.getTime()) * dir;
      default:
        return (a.createdAt.getTime() - b.createdAt.getTime()) * dir;
    }
  });
}
