import type { Metadata } from "next";

import { RegisterForm } from "@/app/(auth)/register/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta no DevFlow.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
