import type { Metadata } from "next";

import { LoginForm } from "@/app/(auth)/login/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your DevFlow account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string | string[] }>;
}) {
  const { registered } = await searchParams;

  return <LoginForm registrationSucceeded={registered === "1"} />;
}
