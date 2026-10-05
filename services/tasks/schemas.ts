import { z } from "zod";

export const taskPrioritySchema = z.enum(["BAIXA", "MEDIA", "ALTA"]);
export const taskStatusSchema = z.enum([
  "CRIADO",
  "EM_PROGRESSO",
  "EM_REVIEW",
  "FEITO",
]);

const optionalText = z.string().trim().optional();
const optionalIsoDate = z.iso.datetime({ message: "Enter a valid date" }).optional();

export const createTaskSchema = z.object({
  titulo: z.string().trim().min(1, "Enter a task title"),
  descricao: optionalText,
  prioridade: taskPrioritySchema,
  status: z.enum(["CRIADO", "EM_PROGRESSO"]).optional(),
  prazo: optionalIsoDate,
  responsavelId: z.number().int().positive().optional(),
});

export const updateTaskSchema = z.object({
  titulo: z.string().trim().min(1, "Enter a task title").optional(),
  descricao: optionalText,
  prioridade: taskPrioritySchema.optional(),
  prazo: optionalIsoDate,
});

export const assignTaskSchema = z.object({
  responsavelId: z
    .number({ error: "Select a valid assignee" })
    .int("Assignee ID must be a whole number")
    .positive("Select a valid assignee"),
});

export const changeTaskStatusSchema = z.object({ status: taskStatusSchema });

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  prioridade: taskPrioritySchema.optional(),
  responsavelId: z.number().int().min(1).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
