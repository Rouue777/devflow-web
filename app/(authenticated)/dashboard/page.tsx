import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your DevFlow workspace overview.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-brand">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
          Keep work moving
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Plan projects, organize tasks, and move each delivery through a clear
          workflow.
        </p>
      </div>

      <section
        aria-labelledby="workspace-heading"
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand">Start here</p>
            <h2
              id="workspace-heading"
              className="mt-1 text-xl font-semibold text-slate-900"
            >
              Open your workspace
            </h2>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Ready to work</span>
        </div>

        <div className="mt-6">
          <Link
            href="/projects"
            className="group flex max-w-xl flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <div className="mb-4 grid size-10 place-items-center rounded-lg bg-white text-sm font-bold text-brand shadow-sm ring-1 ring-slate-200">
              P
            </div>
            <h3 className="font-semibold text-slate-900">Projects</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Create projects, collaborate with members, and open each Kanban board.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand">
              Open projects <span aria-hidden="true" className="inline-block transition group-hover:translate-x-0.5">→</span>
            </span>
          </Link>

        </div>
      </section>
    </div>
  );
}
