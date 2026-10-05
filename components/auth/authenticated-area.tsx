"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { getAuthenticatedUser, logout } from "@/services/auth/service";
import { getAccessToken } from "@/services/auth/session";
import { type AuthenticatedUser } from "@/services/auth/types";

type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthenticatedUser }
  | { status: "error" };

type SessionResult =
  | Exclude<SessionState, { status: "loading" }>
  | { status: "unauthenticated" };

async function loadSession(): Promise<SessionResult> {
  if (!getAccessToken()) {
    return { status: "unauthenticated" };
  }

  try {
    const user = await getAuthenticatedUser();
    return { status: "authenticated", user };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return { status: "unauthenticated" };
    }

    return { status: "error" };
  }
}

export function AuthenticatedArea({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    void loadSession().then((result) => {
      if (!isActive) {
        return;
      }

      if (result.status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      setSession(result);
    });

    return () => {
      isActive = false;
    };
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  async function handleRetry() {
    setSession({ status: "loading" });
    const result = await loadSession();

    if (result.status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    setSession(result);
  }

  if (session.status === "loading") {
    return <SessionLoading />;
  }

  if (session.status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)]">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-amber-50 font-semibold text-amber-700 ring-1 ring-amber-200">
            !
          </span>
          <h1 className="mt-5 text-xl font-semibold text-slate-950">
            Não foi possível carregar sua conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Verifique sua conexão e tente novamente. Sua sessão não foi
            removida.
          </p>
          <button
            type="button"
            onClick={() => void handleRetry()}
            className="mt-6 h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  const { user } = session;
  const initial = user.nome.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 px-5 py-6 text-white lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold shadow-lg shadow-blue-950/40">
            D
          </span>
          <span className="text-xl font-semibold tracking-tight">DevFlow</span>
        </Link>

        <nav aria-label="Navegação principal" className="mt-12">
          <Link
            href="/dashboard"
            aria-current="page"
            className="flex h-11 items-center rounded-xl bg-blue-500/15 px-4 text-sm font-semibold text-blue-100 ring-1 ring-inset ring-blue-400/20 transition hover:bg-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Dashboard
          </Link>
        </nav>

        <p className="mt-5 px-4 text-xs leading-5 text-slate-500">
          Novas áreas serão adicionadas conforme o seu fluxo evoluir.
        </p>

        <div className="mt-auto border-t border-slate-800 pt-5">
          <p className="truncate text-sm font-medium text-slate-200">
            {user.nome}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 h-10 w-full rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
              D
            </span>
            DevFlow
          </Link>
          <p className="hidden text-sm text-muted lg:block">Dashboard</p>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-52 truncate text-sm font-medium text-slate-800">
                {user.nome}
              </p>
              <p className="max-w-52 truncate text-xs text-muted">
                {user.email}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-blue-50 text-sm font-bold text-brand ring-1 ring-blue-100"
            >
              {initial}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}

function SessionLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Validando sua sessão"
      className="grid min-h-screen place-items-center bg-background px-5"
    >
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand text-lg font-bold text-white shadow-md shadow-blue-200">
          D
        </span>
        <div
          aria-hidden="true"
          className="mx-auto mt-6 size-6 animate-spin rounded-full border-2 border-blue-200 border-t-brand"
        />
        <p className="mt-4 text-sm font-medium text-muted">
          Validando sua sessão...
        </p>
      </div>
    </main>
  );
}
