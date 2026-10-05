import { apiClient } from "@/services/api/client";
import { createTaskCommentSchema } from "@/services/comments/schemas";
import {
  type CreateTaskCommentInput,
  type TaskComment,
} from "@/services/comments/types";

function commentsPath(projectId: number, taskId: number, commentId?: number) {
  const basePath = `/projects/${projectId}/tasks/${taskId}/comments`;
  return commentId ? `${basePath}/${commentId}` : basePath;
}

export async function getTaskComments(
  projectId: number,
  taskId: number,
): Promise<TaskComment[]> {
  const response = await apiClient.get<TaskComment[]>(
    commentsPath(projectId, taskId),
  );
  return response.data;
}

export async function createTaskComment(
  projectId: number,
  taskId: number,
  input: CreateTaskCommentInput,
): Promise<TaskComment> {
  const response = await apiClient.post<TaskComment>(
    commentsPath(projectId, taskId),
    createTaskCommentSchema.parse(input),
  );
  return response.data;
}

export async function deleteTaskComment(
  projectId: number,
  taskId: number,
  commentId: number,
): Promise<void> {
  await apiClient.delete(commentsPath(projectId, taskId, commentId));
}
