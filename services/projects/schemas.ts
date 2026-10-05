import { z } from "zod";

export const createProjectSchema = z.object({
  nome: z.string().trim().min(1, "Enter a project name"),
  descricao: z.string().trim().optional(),
});

export const updateProjectSchema = z.object({
  nome: z.string().trim().min(1, "Enter a project name").optional(),
  descricao: z.string().trim().optional(),
});

export const addProjectMemberSchema = z.object({
  usuarioId: z
    .number({ error: "Enter a valid user ID" })
    .int("User ID must be a whole number")
    .positive("User ID must be greater than zero"),
});
