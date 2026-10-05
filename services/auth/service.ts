import { apiClient } from "@/services/api/client";
import {
  authResponseSchema,
  loginSchema,
  registerSchema,
} from "@/services/auth/schemas";
import { clearAccessToken, setAccessToken } from "@/services/auth/session";
import {
  type AuthenticatedUser,
  type LoginInput,
  type RegisterInput,
} from "@/services/auth/types";

export async function login(credentials: LoginInput): Promise<void> {
  const payload = loginSchema.parse(credentials);
  const response = await apiClient.post("/auth/login", payload);
  const { access_token } = authResponseSchema.parse(response.data);

  setAccessToken(access_token);
}

export async function register(data: RegisterInput): Promise<unknown> {
  const payload = registerSchema.parse(data);
  const response = await apiClient.post<unknown>("/users/register", payload);

  return response.data;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const response = await apiClient.get<AuthenticatedUser>("/users/me");

  return response.data;
}

export function logout(): void {
  clearAccessToken();
}
