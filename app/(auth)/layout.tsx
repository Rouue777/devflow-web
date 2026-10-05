import Link from "next/link";
import { type ReactNode } from "react";

import { DeveloperCredit } from "@/components/developer-credit";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen flex-1 bg-background lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
        <div
          aria-hidden="true"
          className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"
        />

        <Link
          href="/"
          className="relative flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold shadow-lg shadow-blue-950/40">
            D
          </span>
          <span className="text-xl font-semibold tracking-tight">DevFlow</span>
        </Link>

        <div className="relative max-w-xl py-16">
          <p className="mb-5 text-sm font-semibold tracking-[0.18em] text-blue-300 uppercase">
            Trabalho em movimento
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-[-0.035em] xl:text-5xl">
            Clareza para planejar. Foco para entregar.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Organize projetos, avance nas tarefas e mantenha sua equipe alinhada
            em um espaço de trabalho focado.
          </p>

          <ul className="mt-10 grid gap-4 text-sm text-slate-200">
            {[
              "Projetos e responsáveis em um só lugar",
              "Fluxos claros da ideia à entrega",
              "Colaboração sem perder o contexto",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-blue-400 ring-4 ring-blue-400/15"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <DeveloperCredit className="relative text-slate-500" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 flex w-fit items-center gap-3 rounded-lg text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-lg font-bold text-white shadow-md shadow-blue-200">
              D
            </span>
            <span className="text-xl font-semibold tracking-tight">DevFlow</span>
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.3)] sm:p-9">
            {children}
          </div>
          <DeveloperCredit className="mt-6 text-center lg:hidden" />
        </div>
      </section>
    </main>
  );
}
