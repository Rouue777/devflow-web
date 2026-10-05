import type { Metadata } from "next";

import { RegisterForm } from "@/app/(auth)/register/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta DevFlow.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
