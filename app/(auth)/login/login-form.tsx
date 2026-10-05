"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { getApiErrorMessage } from "@/services/api/error";
import { loginSchema } from "@/services/auth/schemas";
import { login } from "@/services/auth/service";
import { type LoginInput } from "@/services/auth/types";

type LoginFormProps = {
  registrationSucceeded: boolean;
};

export function LoginForm({ registrationSucceeded }: LoginFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
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
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      senha: formData.get("senha"),
    });

    if (!result.success) {
      const errors: Partial<Record<keyof LoginInput, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if ((field === "email" || field === "senha") && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(result.data);
      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to sign in. Check your details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-slate-950">
          Sign in to your account
        </h1>
        <p className="mt-3 leading-6 text-muted">
          Pick up where you left off and keep work moving.
        </p>
      </div>

      {registrationSucceeded ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          Account created. Sign in to continue.
        </div>
      ) : null}

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
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
          placeholder="Enter your password"
          autoComplete="current-password"
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        New to DevFlow?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand underline-offset-4 hover:text-brand-strong hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
