import { type z } from "zod";

import { createTaskCommentSchema } from "@/services/comments/schemas";

export type TaskCommentAuthor = {
  id: number;
  nome: string;
  email: string;
};

export type TaskComment = {
  id: number;
  conteudo: string;
  dataCriacao: string;
  tarefaId: number;
  usuarioId: number;
  usuario: TaskCommentAuthor;
};

export type CreateTaskCommentInput = z.infer<typeof createTaskCommentSchema>;
