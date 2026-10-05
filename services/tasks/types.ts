import { type z } from "zod";

import {
  assignTaskSchema,
  changeTaskStatusSchema,
  createTaskSchema,
  taskFiltersSchema,
  taskPrioritySchema,
  taskStatusSchema,
  updateTaskSchema,
} from "@/services/tasks/schemas";

export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export type TaskResponsible = {
  id: number;
  nome: string;
  email: string;
};

export type Task = {
  id: number;
  titulo: string;
  descricao: string | null;
  prioridade: TaskPriority;
  status: TaskStatus;
  prazo: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  projetoId: number;
  responsavelId: number | null;
  responsavel: TaskResponsible | null;
};

export type TasksResponse = {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
