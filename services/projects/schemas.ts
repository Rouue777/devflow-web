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
  email: z
    .string()
    .trim()
    .min(1, "Enter the member email")
    .email("Enter a valid email"),
});
