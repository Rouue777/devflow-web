import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do seu espaço de trabalho no DevFlow.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">Visão geral</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
          Seu trabalho começa aqui
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Este é o seu espaço central no DevFlow. Conforme seus projetos forem
          criados, você poderá acompanhar o trabalho da equipe por aqui.
        </p>
      </div>

      <section
        aria-labelledby="workspace-heading"
        className="rounded-2xl border border-border bg-surface p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)] sm:p-8"
      >
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand">Espaço de trabalho</p>
            <h2
              id="workspace-heading"
              className="mt-1 text-xl font-semibold text-slate-900"
            >
              Organize seu próximo fluxo
            </h2>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Estrutura inicial
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
            <div className="mb-4 grid size-10 place-items-center rounded-lg bg-white text-sm font-bold text-brand shadow-sm ring-1 ring-slate-200">
              P
            </div>
            <h3 className="font-semibold text-slate-900">Projetos</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              A gestão dos seus projetos será adicionada na próxima etapa do
              produto.
            </p>
          </article>

          <article className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
            <div className="mb-4 grid size-10 place-items-center rounded-lg bg-white text-sm font-bold text-brand shadow-sm ring-1 ring-slate-200">
              T
            </div>
            <h3 className="font-semibold text-slate-900">Tarefas</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              O acompanhamento das tarefas ficará disponível junto aos seus
              projetos.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
