"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { ProjectFields } from "@/components/projects/project-fields";
import { getApiErrorMessage } from "@/services/api/error";
import { createProjectSchema } from "@/services/projects/schemas";
import { createProject, getProjects } from "@/services/projects/service";
import { type CreateProjectInput, type Project } from "@/services/projects/types";

type LoadState = "loading" | "ready" | "error";

export function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateProjectInput, string>>>({});

  const loadProjects = useCallback(async () => {
    try {
      setProjects(await getProjects());
      setLoadState("ready");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.replace("/login");
        return;
      }
      setLoadState("error");
    }
  }, [router]);

  function handleRetry() {
    setLoadState("loading");
    void loadProjects();
  }

  useEffect(() => {
    let isActive = true;

    void getProjects()
      .then((items) => {
        if (!isActive) return;
        setProjects(items);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace("/login");
          return;
        }
        setLoadState("error");
      });

    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreating) return;

    setSubmitError(null);
    setFieldErrors({});
    const form = event.currentTarget;
    const formData = new FormData(form);
    const descricao = formData.get("descricao");
    const result = createProjectSchema.safeParse({
      nome: formData.get("nome"),
      descricao: typeof descricao === "string" && descricao.trim() ? descricao : undefined,
    });

    if (!result.success) {
      const errors: Partial<Record<keyof CreateProjectInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === "nome" || field === "descricao") && !errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProject(result.data);
      setProjects((current) => [project, ...current]);
      form.reset();
      setShowForm(false);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.replace("/login");
        return;
      }
      setSubmitError(getApiErrorMessage(error, "Não foi possível criar o projeto. Tente novamente."));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">Espaço de trabalho</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">Projetos</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Crie, acesse e gerencie os projetos dos quais você participa.</p>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          {showForm ? "Cancelar" : "Novo projeto"}
        </button>
      </div>

      {showForm ? (
        <section className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="new-project-title">
          <h2 id="new-project-title" className="text-xl font-semibold text-slate-950">Criar projeto</h2>
          <p className="mt-2 text-sm text-muted">Dê ao projeto um nome claro e, se quiser, uma descrição.</p>
          <form onSubmit={handleCreate} noValidate className="mt-6 max-w-2xl">
            <ProjectFields disabled={isCreating} errors={fieldErrors} />
            {submitError ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
            <button type="submit" disabled={isCreating} className="mt-5 h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-blue-300">
              {isCreating ? "Criando..." : "Criar projeto"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-8" aria-live="polite">
        {loadState === "loading" ? <ProjectsLoading /> : null}
        {loadState === "error" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <h2 className="font-semibold text-slate-950">Não foi possível carregar os projetos</h2>
            <p className="mt-2 text-sm text-muted">Verifique sua conexão e tente novamente.</p>
            <button type="button" onClick={handleRetry} className="mt-5 h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Tentar novamente</button>
          </div>
        ) : null}
        {loadState === "ready" && projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-blue-50 font-bold text-brand">P</span>
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Nenhum projeto ainda</h2>
            <p className="mt-2 text-sm text-muted">Crie seu primeiro projeto para começar a organizar o trabalho.</p>
          </div>
        ) : null}
        {loadState === "ready" && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(project.dataCriacao));
  return (
    <Link href={`/projects/${project.id}`} className="group flex min-h-60 flex-col rounded-2xl border border-border bg-surface p-6 transition duration-150 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_16px_35px_-28px_rgba(15,23,42,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      <span className="grid size-10 place-items-center rounded-xl bg-blue-50 font-bold text-brand ring-1 ring-blue-100">{project.nome.charAt(0).toUpperCase()}</span>
      <h2 className="mt-5 text-lg font-semibold text-slate-950 group-hover:text-brand">{project.nome}</h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{project.descricao || "Sem descrição."}</p>
      <div className="mt-auto border-t border-slate-100 pt-4 text-xs text-slate-500">
        <p>Responsável: <span className="font-medium text-slate-700">{project.responsavel.nome}</span></p>
        <p className="mt-1">Criado em {date}</p>
      </div>
    </Link>
  );
}

function ProjectsLoading() {
  return <div aria-label="Carregando projetos" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-border bg-white p-6"><div className="size-10 rounded-xl bg-slate-100" /><div className="mt-5 h-5 w-2/3 rounded bg-slate-100" /><div className="mt-3 h-4 w-full rounded bg-slate-100" /></div>)}</div>;
}
