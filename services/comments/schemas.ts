import { z } from "zod";

export const createTaskCommentSchema = z.object({
  conteudo: z.string().trim().min(1, "Escreva um comentário antes de enviar"),
});
