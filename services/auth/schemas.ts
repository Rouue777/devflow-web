import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail")
    .email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export const registerSchema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome"),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail")
    .email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const authResponseSchema = z.object({
  access_token: z.string().min(1),
});
