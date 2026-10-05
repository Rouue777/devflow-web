import type { Metadata } from "next";

import { RegisterForm } from "@/app/(auth)/register/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your DevFlow account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
