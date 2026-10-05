import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email"),
  senha: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  nome: z.string().trim().min(1, "Enter your name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email"),
  senha: z.string().min(6, "Password must be at least 6 characters"),
});

export const authResponseSchema = z.object({
  access_token: z.string().min(1),
});
