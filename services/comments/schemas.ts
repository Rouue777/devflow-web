import { z } from "zod";

export const createTaskCommentSchema = z.object({
  conteudo: z.string().trim().min(1, "Write a comment before submitting"),
});
