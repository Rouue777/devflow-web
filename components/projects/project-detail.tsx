"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { useAuthenticatedUser } from "@/components/auth/authenticated-area";
import { ProjectFields } from "@/components/projects/project-fields";
import { ProjectMembers } from "@/components/projects/project-members";
import { getApiErrorMessage } from "@/services/api/error";
import { updateProjectSchema } from "@/services/projects/schemas";
import { getProject, updateProject } from "@/services/projects/service";
import { type ProjectDetail, type UpdateProjectInput } from "@/services/projects/types";

type DetailState =
  | { status: "loading" }
  | { status: "ready"; project: ProjectDetail }
  | { status: "forbidden" | "not-found" | "error" };

export function ProjectDetailPage({ projectId }: { projectId: number }) {
  const router = useRouter();
  const user = useAuthenticatedUser();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateProjectInput, string>>>({});

  const loadProject = useCallback(async () => {
    try {
      setState({ status: "ready", project: await getProject(projectId) });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) return router.replace("/login");
        if (error.response?.status === 403) return setState({ status: "forbidden" });
        if (error.response?.status === 404) return setState({ status: "not-found" });
      }
      setState({ status: "error" });
    }
  }, [projectId, router]);

  function handleRetry() {
    setState({ status: "loading" });
    void loadProject();
  }

  useEffect(() => {
    let isActive = true;

    void getProject(projectId)
      .then((project) => {
        if (isActive) setState({ status: "ready", project });
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) return router.replace("/login");
          if (error.response?.status === 403) return setState({ status: "forbidden" });
          if (error.response?.status === 404) return setState({ status: "not-found" });
        }
        setState({ status: "error" });
      });

    return () => {
      isActive = false;
    };
  }, [projectId, router]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || state.status !== "ready") return;

    setSubmitError(null);
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    const result = updateProjectSchema.safeParse({
      nome: formData.get("nome"),
      descricao: formData.get("descricao"),
    });

    if (!result.success) {
      const errors: Partial<Record<keyof UpdateProjectInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === "nome" || field === "descricao") && !errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateProject(projectId, result.data);
      setState({ status: "ready", project: { ...state.project, ...updated } });
      setIsEditing(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) return router.replace("/login");
        if (error.response?.status === 403) {
          setSubmitError("You do not have permission to edit this project.");
          return;
        }
      }
      setSubmitError(getApiErrorMessage(error, "Unable to save your changes."));
    } finally {
      setIsSaving(false);
    }
  }

  if (state.status === "loading") return <DetailLoading />;
  if (state.status !== "ready") {
    const messages = {
      forbidden: ["Access denied", "You are not a member of this project."],
      "not-found": ["Project not found", "This project may have been removed or does not exist."],
      error: ["Unable to load project", "Check your connection and try again."],
    } as const;
    const [title, description] = messages[state.status];
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/projects" className="h-10 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Back</Link>
          {state.status === "error" ? <button type="button" onClick={handleRetry} className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white">Try again</button> : null}
        </div>
      </div>
    );
  }

  const { project } = state;
  const canEdit = user.id === project.responsavelId;
  const createdAt = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(project.dataCriacao));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link href="/projects" className="text-sm font-semibold text-brand hover:text-brand-strong">← Back to projects</Link>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">Project</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">{project.nome}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted">{project.descricao || "This project has no description yet."}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/projects/${project.id}/tasks`} className="grid h-11 place-items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong">Open Kanban</Link>
          {canEdit ? <button type="button" onClick={() => { setSubmitError(null); setFieldErrors({}); setIsEditing((value) => !value); }} className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-brand">{isEditing ? "Cancel edit" : "Edit project"}</button> : null}
        </div>
      </div>

      {isEditing ? (
        <section className="mt-8 rounded-2xl border border-blue-200 bg-white p-6 sm:p-8" aria-labelledby="edit-title">
          <h2 id="edit-title" className="text-xl font-semibold text-slate-950">Edit project</h2>
          <form onSubmit={handleUpdate} noValidate className="mt-6 max-w-2xl">
            <ProjectFields disabled={isSaving} errors={fieldErrors} defaultValues={{ nome: project.nome, descricao: project.descricao ?? "" }} />
            {submitError ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
            <button type="submit" disabled={isSaving} className="mt-5 h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white disabled:bg-blue-300">{isSaving ? "Saving..." : "Save changes"}</button>
          </form>
        </section>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="details-title">
          <h2 id="details-title" className="text-lg font-semibold text-slate-950">Project details</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Owner</dt><dd className="mt-2 font-medium text-slate-900">{project.responsavel.nome}</dd><dd className="mt-1 text-sm text-muted">{project.responsavel.email}</dd></div>
            <div><dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Created</dt><dd className="mt-2 font-medium text-slate-900">{createdAt}</dd></div>
          </dl>
        </section>

        <ProjectMembers
          projectId={project.id}
          ownerId={project.responsavelId}
          canManage={canEdit}
        />
      </div>
    </div>
  );
}

function DetailLoading() {
  return <div aria-label="Loading project" className="mx-auto w-full max-w-6xl animate-pulse"><div className="h-4 w-36 rounded bg-slate-200" /><div className="mt-7 h-10 w-2/3 rounded bg-slate-200" /><div className="mt-4 h-5 w-full max-w-xl rounded bg-slate-200" /><div className="mt-10 h-64 rounded-2xl border border-border bg-white" /></div>;
}
