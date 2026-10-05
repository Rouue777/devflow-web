"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { getApiErrorMessage } from "@/services/api/error";
import { registerSchema } from "@/services/auth/schemas";
import { register } from "@/services/auth/service";
import { type RegisterInput } from "@/services/auth/types";

export function RegisterForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const result = registerSchema.safeParse({
      nome: formData.get("nome"),
      email: formData.get("email"),
      senha: formData.get("senha"),
    });

    if (!result.success) {
      const errors: Partial<Record<keyof RegisterInput, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (
          (field === "nome" || field === "email" || field === "senha") &&
          !errors[field]
        ) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(result.data);
      router.push("/login?registered=1");
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">Get started</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-slate-950">
          Create your account
        </h1>
        <p className="mt-3 leading-6 text-muted">
          Bring projects, tasks, and collaboration into one clear flow.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="nome"
          name="nome"
          type="text"
          label="Name"
          placeholder="Your full name"
          autoComplete="name"
          disabled={isSubmitting}
          error={fieldErrors.nome}
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@company.com"
          autoComplete="email"
          disabled={isSubmitting}
          error={fieldErrors.email}
        />
        <AuthField
          id="senha"
          name="senha"
          type="password"
          label="Password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={fieldErrors.senha}
        />

        {submitError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
        >
          {isSubmitting ? (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : null}
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand underline-offset-4 hover:text-brand-strong hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
