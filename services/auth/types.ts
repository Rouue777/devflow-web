import { type z } from "zod";

import {
  authResponseSchema,
  loginSchema,
  registerSchema,
} from "@/services/auth/schemas";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string;
  dataCadastro: string;
};
