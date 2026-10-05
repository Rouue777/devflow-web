import { apiClient } from "@/services/api/client";
import {
  assignTaskSchema,
  changeTaskStatusSchema,
  createTaskSchema,
  taskFiltersSchema,
  updateTaskSchema,
} from "@/services/tasks/schemas";
import {
  type AssignTaskInput,
  type ChangeTaskStatusInput,
  type CreateTaskInput,
  type Task,
  type TaskFilters,
  type TasksResponse,
  type UpdateTaskInput,
} from "@/services/tasks/types";

function taskPath(projectId: number, taskId?: number) {
  return `/projects/${projectId}/tasks${taskId ? `/${taskId}` : ""}`;
}

export async function getTasks(
  projectId: number,
  filters: TaskFilters,
): Promise<TasksResponse> {
  const params = taskFiltersSchema.parse(filters);
  const response = await apiClient.get<TasksResponse>(taskPath(projectId), {
    params,
  });
  return response.data;
}

export async function createTask(
  projectId: number,
  input: CreateTaskInput,
): Promise<Task> {
  const response = await apiClient.post<Task>(
    taskPath(projectId),
    createTaskSchema.parse(input),
  );
  return response.data;
}

export async function getTask(projectId: number, taskId: number): Promise<Task> {
  const response = await apiClient.get<Task>(taskPath(projectId, taskId));
  return response.data;
}

export async function updateTask(
  projectId: number,
  taskId: number,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await apiClient.patch<Task>(
    taskPath(projectId, taskId),
    updateTaskSchema.parse(input),
  );
  return response.data;
}

export async function assignTask(
  projectId: number,
  taskId: number,
  input: AssignTaskInput,
): Promise<Task> {
  const response = await apiClient.patch<Task>(
    `${taskPath(projectId, taskId)}/responsible`,
    assignTaskSchema.parse(input),
  );
  return response.data;
}

export async function changeTaskStatus(
  projectId: number,
  taskId: number,
  input: ChangeTaskStatusInput,
): Promise<Task> {
  const response = await apiClient.patch<Task>(
    `${taskPath(projectId, taskId)}/status`,
    changeTaskStatusSchema.parse(input),
  );
  return response.data;
}

export async function deleteTask(projectId: number, taskId: number): Promise<void> {
  await apiClient.delete(taskPath(projectId, taskId));
}
