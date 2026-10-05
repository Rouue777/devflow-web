"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { getApiErrorMessage, getApiErrorStatus } from "@/services/api/error";
import { createTaskCommentSchema } from "@/services/comments/schemas";
import {
  createTaskComment,
  deleteTaskComment,
  getTaskComments,
} from "@/services/comments/service";
import { type TaskComment } from "@/services/comments/types";

type CommentsState =
  | { status: "loading" }
  | { status: "ready"; comments: TaskComment[] }
  | { status: "error" };

type TaskCommentsProps = {
  projectId: number;
  taskId: number;
  currentUserId: number;
};

export function TaskComments({
  projectId,
  taskId,
  currentUserId,
}: TaskCommentsProps) {
  const router = useRouter();
  const [state, setState] = useState<CommentsState>({ status: "loading" });
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setState({ status: "loading" });
    try {
      setState({
        status: "ready",
        comments: await getTaskComments(projectId, taskId),
      });
    } catch (error) {
      if (getApiErrorStatus(error) === 401) {
        router.replace("/login");
        return;
      }
      setState({ status: "error" });
    }
  }, [projectId, router, taskId]);

  useEffect(() => {
    let active = true;

    void getTaskComments(projectId, taskId)
      .then((comments) => {
        if (active) setState({ status: "ready", comments });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (getApiErrorStatus(error) === 401) {
          router.replace("/login");
          return;
        }
        setState({ status: "error" });
      });

    return () => {
      active = false;
    };
  }, [projectId, router, taskId]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreating || state.status !== "ready") return;

    const form = event.currentTarget;
    const result = createTaskCommentSchema.safeParse({
      conteudo: new FormData(form).get("conteudo"),
    });

    setFieldError(null);
    setMutationError(null);
    setSuccessMessage(null);

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Escreva um comentário");
      return;
    }

    setIsCreating(true);
    try {
      const comment = await createTaskComment(projectId, taskId, result.data);
      setState((current) =>
        current.status === "ready"
          ? { status: "ready", comments: [...current.comments, comment] }
          : current,
      );
      form.reset();
      setSuccessMessage("Comentário adicionado.");
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status === 401) {
        router.replace("/login");
        return;
      }
      if (status === 403) {
        setMutationError("Você não tem permissão para comentar nesta tarefa.");
        return;
      }
      setMutationError(
        getApiErrorMessage(error, "Não foi possível adicionar o comentário."),
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(comment: TaskComment) {
    if (
      deletingCommentId !== null ||
      comment.usuarioId !== currentUserId ||
      !window.confirm("Excluir este comentário?")
    ) {
      return;
    }

    setDeletingCommentId(comment.id);
    setMutationError(null);
    setSuccessMessage(null);

    try {
      await deleteTaskComment(projectId, taskId, comment.id);
      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              comments: current.comments.filter((item) => item.id !== comment.id),
            }
          : current,
      );
      setSuccessMessage("Comentário excluído.");
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status === 401) {
        router.replace("/login");
        return;
      }
      if (status === 403) {
        setMutationError("Você só pode excluir seus próprios comentários.");
        return;
      }
      setMutationError(
        getApiErrorMessage(error, "Não foi possível excluir o comentário."),
      );
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <section className="mt-8 border-t border-border pt-8" aria-labelledby="comments-title">
      <div>
        <h3 id="comments-title" className="text-lg font-semibold text-slate-950">
          Comentários
        </h3>
        <p className="mt-1 text-sm text-muted">
          Mantenha decisões e contexto próximos ao trabalho.
        </p>
      </div>

      <form onSubmit={handleCreate} noValidate className="mt-6">
        <label htmlFor={`comment-${taskId}`} className="text-sm font-semibold text-slate-800">
          Adicionar comentário
        </label>
        <textarea
          id={`comment-${taskId}`}
          name="conteudo"
          rows={3}
          disabled={isCreating || state.status !== "ready"}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? `comment-${taskId}-error` : undefined}
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          placeholder="Escreva um comentário..."
        />
        {fieldError ? (
          <p id={`comment-${taskId}-error`} role="alert" className="mt-2 text-sm text-red-600">
            {fieldError}
          </p>
        ) : null}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isCreating || state.status !== "ready"}
            className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isCreating ? "Adicionando..." : "Adicionar comentário"}
          </button>
        </div>
      </form>

      {mutationError ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutationError}
        </p>
      ) : null}
      {successMessage ? (
        <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-7" aria-live="polite">
        {state.status === "loading" ? <CommentsLoading /> : null}
        {state.status === "error" ? (
          <div className="rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-700">Não foi possível carregar os comentários.</p>
            <button
              type="button"
              onClick={() => void loadComments()}
              className="mt-3 text-sm font-semibold text-brand hover:text-brand-strong"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}
        {state.status === "ready" && state.comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">Nenhum comentário ainda</p>
            <p className="mt-1 text-xs text-muted">Seja o primeiro a adicionar contexto a esta tarefa.</p>
          </div>
        ) : null}
        {state.status === "ready" && state.comments.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {state.comments.map((comment) => {
              const isAuthor = comment.usuarioId === currentUserId;
              const isDeleting = deletingCommentId === comment.id;

              return (
                <li key={comment.id} className="flex min-w-0 gap-3 py-5 first:pt-0 last:pb-0">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-brand">
                    {comment.usuario.nome.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-semibold text-slate-900">{comment.usuario.nome}</p>
                      {isAuthor ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-brand">Você</span> : null}
                      <time dateTime={comment.dataCriacao} className="text-xs text-slate-400">{formatCommentDate(comment.dataCriacao)}</time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{comment.conteudo}</p>
                  </div>
                  {isAuthor ? (
                    <button
                      type="button"
                      disabled={deletingCommentId !== null}
                      onClick={() => void handleDelete(comment)}
                      aria-label={`Excluir comentário de ${comment.usuario.nome}`}
                      className="h-9 shrink-0 rounded-lg px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function CommentsLoading() {
  return (
    <div aria-label="Carregando comentários" className="space-y-3 animate-pulse">
      {[1, 2].map((item) => (
        <div key={item} className="h-24 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
