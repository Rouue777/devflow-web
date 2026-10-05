import { z } from "zod";

export const createProjectSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do projeto"),
  descricao: z.string().trim().optional(),
});

export const updateProjectSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do projeto").optional(),
  descricao: z.string().trim().optional(),
});

export const addProjectMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail do membro")
    .email("Informe um e-mail válido"),
});
