"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { useAuthenticatedUser } from "@/components/auth/authenticated-area";
import { TaskComments } from "@/components/comments/task-comments";
import { TaskForm } from "@/components/tasks/task-form";
import { getApiErrorMessage } from "@/services/api/error";
import { getProjectMembers } from "@/services/projects/service";
import { type ProjectMemberListItem } from "@/services/projects/types";
import { getProject } from "@/services/projects/service";
import { type ProjectDetail } from "@/services/projects/types";
import { createTaskSchema, updateTaskSchema } from "@/services/tasks/schemas";
import {
  assignTask,
  changeTaskStatus,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "@/services/tasks/service";
import {
  type Task,
  type TaskFilters,
  type TaskPriority,
  type TasksResponse,
  type TaskStatus,
} from "@/services/tasks/types";

const columns: Array<{ status: TaskStatus; label: string; accent: string }> = [
  { status: "CRIADO", label: "Created", accent: "bg-slate-400" },
  { status: "EM_PROGRESSO", label: "In Progress", accent: "bg-blue-500" },
  { status: "EM_REVIEW", label: "Review", accent: "bg-amber-500" },
  { status: "FEITO", label: "Done", accent: "bg-emerald-500" },
];

const statusLabels: Record<TaskStatus, string> = {
  CRIADO: "Created",
  EM_PROGRESSO: "In Progress",
  EM_REVIEW: "Review",
  FEITO: "Done",
};

const priorityLabels: Record<TaskPriority, string> = {
  BAIXA: "Low",
  MEDIA: "Medium",
  ALTA: "High",
};

const priorityClasses: Record<TaskPriority, string> = {
  BAIXA: "bg-slate-100 text-slate-600",
  MEDIA: "bg-amber-50 text-amber-700",
  ALTA: "bg-red-50 text-red-700",
};

const statusClasses: Record<TaskStatus, string> = {
  CRIADO: "bg-slate-100 text-slate-700",
  EM_PROGRESSO: "bg-blue-50 text-blue-700",
  EM_REVIEW: "bg-amber-50 text-amber-700",
  FEITO: "bg-emerald-50 text-emerald-700",
};

const transitions: Record<TaskStatus, TaskStatus[]> = {
  CRIADO: ["EM_PROGRESSO"],
  EM_PROGRESSO: ["EM_REVIEW"],
  EM_REVIEW: ["EM_PROGRESSO", "FEITO"],
  FEITO: ["EM_REVIEW"],
};

const defaultFilters: TaskFilters = { page: 1, limit: 10 };

type PageState =
  | { status: "loading" }
  | { status: "ready"; project: ProjectDetail; members: ProjectMemberListItem[]; tasks: TasksResponse }
  | { status: "forbidden" | "not-found" | "error" };

export function TasksPage({ projectId }: { projectId: number }) {
  const router = useRouter();
  const user = useAuthenticatedUser();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mutation, setMutation] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; message: string } | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const handleRequestError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        router.replace("/login");
        return true;
      }
      if (error.response?.status === 403) {
        setFeedback({ kind: "error", message: "You do not have permission to perform this action." });
        return true;
      }
      if (error.response?.status === 404) {
        setFeedback({ kind: "error", message: getApiErrorMessage(error, "Recurso não encontrado.") });
        return true;
      }
    }
    return false;
  }, [router]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getProject(projectId),
      getProjectMembers(projectId),
      getTasks(projectId, defaultFilters),
    ])
      .then(([project, members, tasks]) => {
        if (active) setState({ status: "ready", project, members, tasks });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) return router.replace("/login");
          if (error.response?.status === 403) return setState({ status: "forbidden" });
          if (error.response?.status === 404) return setState({ status: "not-found" });
        }
        setState({ status: "error" });
      });
    return () => { active = false; };
  }, [projectId, router]);

  const loadTasks = useCallback(async (nextFilters: TaskFilters) => {
    setIsRefreshing(true);
    try {
      const tasks = await getTasks(projectId, nextFilters);
      setState((current) => current.status === "ready" ? { ...current, tasks } : current);
      return true;
    } catch (error) {
      if (!handleRequestError(error)) {
        setFeedback({ kind: "error", message: "Unable to load tasks." });
      }
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [handleRequestError, projectId]);

  function allowedTransitions(task: Task, isOwner: boolean) {
    return transitions[task.status].filter((status) => status !== "FEITO" || isOwner);
  }

  async function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const responsible = data.get("responsavelId");
    const next: TaskFilters = {
      page: 1,
      limit: filters.limit,
      status: optionalStatus(data.get("status")),
      prioridade: optionalPriority(data.get("prioridade")),
      responsavelId: typeof responsible === "string" && responsible ? Number(responsible) : undefined,
    };
    setFilters(next);
    setFeedback(null);
    await loadTasks(next);
  }

  async function clearFilters(form: HTMLFormElement) {
    form.reset();
    setFilters(defaultFilters);
    setFeedback(null);
    await loadTasks(defaultFilters);
  }

  async function changePage(page: number) {
    const next = { ...filters, page };
    setFilters(next);
    await loadTasks(next);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation || state.status !== "ready") return;
    setFormErrors({});
    setFeedback(null);
    const form = event.currentTarget;
    const result = createTaskSchema.safeParse(taskFormValues(form, true));
    if (!result.success) return setFormErrors(zodErrors(result.error.issues));

    setMutation("create");
    try {
      await createTask(projectId, result.data);
      const next = { ...filters, page: 1 };
      setFilters(next);
      await loadTasks(next);
      form.reset();
      setShowCreate(false);
      setFeedback({ kind: "success", message: "Task created." });
    } catch (error) {
      if (!handleRequestError(error)) setFeedback({ kind: "error", message: getApiErrorMessage(error, "Unable to create the task.") });
    } finally {
      setMutation(null);
    }
  }

  async function openTask(taskId: number) {
    setIsDetailLoading(true);
    setFeedback(null);
    try {
      setSelectedTask(await getTask(projectId, taskId));
    } catch (error) {
      if (!handleRequestError(error)) setFeedback({ kind: "error", message: "Unable to load task details." });
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask || mutation) return;
    setFormErrors({});
    const result = updateTaskSchema.safeParse(taskFormValues(event.currentTarget, false));
    if (!result.success) return setFormErrors(zodErrors(result.error.issues));
    setMutation("edit");
    try {
      const updated = await updateTask(projectId, selectedTask.id, result.data);
      setSelectedTask(updated);
      await loadTasks(filters);
      setFeedback({ kind: "success", message: "Task updated." });
    } catch (error) {
      if (!handleRequestError(error)) setFeedback({ kind: "error", message: getApiErrorMessage(error, "Unable to update the task.") });
    } finally { setMutation(null); }
  }

  async function handleAssign(responsavelId: number) {
    if (!selectedTask || mutation) return;
    setMutation("assign");
    try {
      const updated = await assignTask(projectId, selectedTask.id, { responsavelId });
      setSelectedTask(updated);
      await loadTasks(filters);
      setFeedback({ kind: "success", message: "Assignee updated." });
    } catch (error) {
      if (!handleRequestError(error)) setFeedback({ kind: "error", message: getApiErrorMessage(error, "Unable to update the assignee.") });
    } finally { setMutation(null); }
  }

  async function handleStatus(task: Task, status: TaskStatus) {
    if (mutation || state.status !== "ready") return;
    const isOwner = user.id === state.project.responsavelId;
    if (!allowedTransitions(task, isOwner).includes(status)) return;
    setMutation(`status-${task.id}`);
    setFeedback(null);
    try {
      const updated = await changeTaskStatus(projectId, task.id, { status });
      if (selectedTask?.id === task.id) setSelectedTask(updated);
      await loadTasks(filters);
      setFeedback({ kind: "success", message: `Moved to ${statusLabels[status]}.` });
    } catch (error) {
      if (!handleRequestError(error)) setFeedback({ kind: "error", message: getApiErrorMessage(error, "Unable to change the status.") });
    } finally { setMutation(null); setDraggedTaskId(null); }
  }

  async function handleDelete() {
    if (!selectedTask || mutation || state.status !== "ready") return;
    if (user.id !== state.project.responsavelId) return;
    if (!window.confirm(`Delete “${selectedTask.titulo}”?`)) return;
    setMutation("delete");
    try {
      await deleteTask(projectId, selectedTask.id);
      setSelectedTask(null);
      const nextFilters =
        state.tasks.data.length === 1 && filters.page > 1
          ? { ...filters, page: filters.page - 1 }
          : filters;
      setFilters(nextFilters);
      await loadTasks(nextFilters);
      setFeedback({ kind: "success", message: "Task deleted." });
    } catch (error) {
      if (!handleRequestError(error)) setFeedback({ kind: "error", message: getApiErrorMessage(error, "Unable to delete the task.") });
    } finally { setMutation(null); }
  }

  if (state.status === "loading") return <BoardLoading />;
  if (state.status !== "ready") return <PageError status={state.status} projectId={projectId} />;

  const isOwner = user.id === state.project.responsavelId;

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <Link href={`/projects/${projectId}`} className="text-sm font-semibold text-brand hover:text-brand-strong">← Back to project</Link>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">{state.project.nome}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">Tasks & Kanban</h1>
          <p className="mt-3 text-sm text-muted">Showing the current page of results.</p>
        </div>
        <button type="button" onClick={() => { setShowCreate((value) => !value); setFormErrors({}); }} className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong">
          {showCreate ? "Cancel" : "New task"}
        </button>
      </div>

      {feedback ? <p role={feedback.kind === "error" ? "alert" : "status"} className={`mt-6 rounded-xl border px-4 py-3 text-sm ${feedback.kind === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{feedback.message}</p> : null}

      {showCreate ? (
        <section className="mt-7 rounded-2xl border border-blue-200 bg-white p-6 sm:p-8" aria-labelledby="create-task-title">
          <h2 id="create-task-title" className="text-xl font-semibold text-slate-950">Create task</h2>
          <TaskForm mode="create" members={state.members} disabled={mutation === "create"} errors={formErrors} onSubmit={handleCreate} />
        </section>
      ) : null}

      <TaskFiltersForm members={state.members} filters={filters} busy={isRefreshing} onApply={applyFilters} onClear={clearFilters} />

      {isRefreshing ? <p role="status" className="mt-4 text-sm font-medium text-brand">Updating tasks...</p> : null}

      {state.tasks.data.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-950">No tasks found</h2>
          <p className="mt-2 text-sm text-muted">Create a task or adjust the current filters.</p>
        </div>
      ) : (
        <div className="mt-7 overflow-x-auto pb-4 [scrollbar-color:#cbd5e1_transparent]">
          <div className="grid min-w-[1080px] grid-cols-4 gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                column={column}
                tasks={state.tasks.data.filter((task) => task.status === column.status)}
                isOwner={isOwner}
                busy={mutation !== null}
                draggedTask={state.tasks.data.find((task) => task.id === draggedTaskId) ?? null}
                onDragTask={setDraggedTaskId}
                onDropTask={(task) => void handleStatus(task, column.status)}
                onOpen={(task) => void openTask(task.id)}
                onStatus={(task, status) => void handleStatus(task, status)}
              />
            ))}
          </div>
        </div>
      )}

      <Pagination meta={state.tasks.meta} busy={mutation !== null || isRefreshing} onPage={(page) => void changePage(page)} />

      {isDetailLoading ? <p className="mt-6 text-center text-sm text-muted">Loading task details...</p> : null}
      {selectedTask ? (
        <TaskDetails
          key={selectedTask.id}
          task={selectedTask}
          members={state.members}
          isOwner={isOwner}
          busy={mutation !== null}
          errors={formErrors}
          transitions={allowedTransitions(selectedTask, isOwner)}
          onClose={() => { setSelectedTask(null); setFormErrors({}); }}
          onEdit={handleEdit}
          onAssign={(id) => void handleAssign(id)}
          onStatus={(status) => void handleStatus(selectedTask, status)}
          onDelete={() => void handleDelete()}
          currentUserId={user.id}
        />
      ) : null}
    </div>
  );
}

function KanbanColumn({ column, tasks, isOwner, busy, draggedTask, onDragTask, onDropTask, onOpen, onStatus }: {
  column: (typeof columns)[number]; tasks: Task[]; isOwner: boolean; busy: boolean; draggedTask: Task | null;
  onDragTask: (id: number | null) => void; onDropTask: (task: Task) => void; onOpen: (task: Task) => void; onStatus: (task: Task, status: TaskStatus) => void;
}) {
  const acceptsDrop = draggedTask ? transitions[draggedTask.status].includes(column.status) && (column.status !== "FEITO" || isOwner) : false;
  return (
    <section
      className={`min-h-80 rounded-2xl border p-3 transition-colors ${acceptsDrop ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100" : "border-border bg-slate-100/60"}`}
      onDragOver={(event) => { if (acceptsDrop) event.preventDefault(); }}
      onDrop={(event) => { event.preventDefault(); if (draggedTask && acceptsDrop) onDropTask(draggedTask); }}
    >
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2"><span className={`size-2 rounded-full ${column.accent}`} /><h2 className="text-sm font-semibold text-slate-800">{column.label}</h2></div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">{tasks.length}</span>
      </div>
      <div className="mt-2 space-y-3">
        {tasks.map((task) => (
          <article key={task.id} draggable={!busy} onDragStart={() => onDragTask(task.id)} onDragEnd={() => onDragTask(null)} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.5)] transition hover:border-blue-300 hover:shadow-[0_12px_28px_-20px_rgba(37,99,235,0.4)] active:cursor-grabbing">
            <button type="button" onClick={() => onOpen(task)} className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
              <span className={`rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase ${priorityClasses[task.prioridade]}`}>{priorityLabels[task.prioridade]}</span>
              <h3 className="mt-3 text-sm font-semibold leading-5 text-slate-900">{task.titulo}</h3>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
                <p className="truncate font-medium text-slate-600">{task.responsavel?.nome ?? "Unassigned"}</p>
                {task.prazo ? <p className="mt-1 text-slate-400">Due {formatDate(task.prazo)}</p> : null}
              </div>
            </button>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {transitions[task.status].filter((status) => status !== "FEITO" || isOwner).map((status) => (
                <button key={status} type="button" disabled={busy} onClick={() => onStatus(task, status)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[0.7rem] font-semibold text-slate-600 hover:bg-blue-50 hover:text-brand disabled:opacity-50">→ {statusLabels[status]}</button>
              ))}
            </div>
          </article>
        ))}
        {tasks.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">No tasks on this page</p> : null}
      </div>
    </section>
  );
}

function TaskDetails({ task, members, isOwner, busy, errors, transitions: nextStatuses, onClose, onEdit, onAssign, onStatus, onDelete, currentUserId }: {
  task: Task; members: ProjectMemberListItem[]; isOwner: boolean; busy: boolean; errors: Record<string, string | undefined>; transitions: TaskStatus[];
  onClose: () => void; onEdit: (event: FormEvent<HTMLFormElement>) => void; onAssign: (id: number) => void; onStatus: (status: TaskStatus) => void; onDelete: () => void; currentUserId: number;
}) {
  return (
    <section className="mt-8 scroll-mt-24 rounded-2xl border border-border bg-white p-5 sm:p-8" aria-labelledby="task-detail-title">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-semibold text-brand">Task #{task.id}</p><h2 id="task-detail-title" className="mt-1 text-2xl font-semibold text-slate-950">{task.titulo}</h2></div>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Close</button>
      </div>
      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <p><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[task.status]}`}>{statusLabels[task.status]}</span></p>
        <p><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</span><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[task.prioridade]}`}>{priorityLabels[task.prioridade]}</span></p>
        <p><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Assignee</span><span className="mt-2 block font-medium text-slate-800">{task.responsavel?.nome ?? "Unassigned"}</span></p>
        <p><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Due date</span><span className="mt-2 block font-medium text-slate-800">{task.prazo ? formatDate(task.prazo) : "No due date"}</span></p>
      </div>
      <div className="mt-7"><h3 className="text-sm font-semibold text-slate-900">Description</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{task.descricao || "No description provided."}</p></div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1.4fr_0.6fr]">
        <div><h3 className="font-semibold text-slate-900">Edit task</h3><TaskForm key={task.dataAtualizacao} mode="edit" members={members} task={task} disabled={busy} errors={errors} onSubmit={onEdit} /></div>
        <aside className="space-y-6 rounded-xl bg-slate-50 p-5">
          <div><label htmlFor="task-responsible" className="text-sm font-semibold text-slate-800">Change assignee</label><select id="task-responsible" value={task.responsavelId ?? ""} disabled={busy} onChange={(event) => { if (event.target.value) onAssign(Number(event.target.value)); }} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="" disabled>Unassigned</option>{members.map((member) => <option key={member.usuario.id} value={member.usuario.id}>{member.usuario.nome}</option>)}</select><p className="mt-2 text-xs text-muted">Unassign is not available yet.</p></div>
          <div><p className="text-sm font-semibold text-slate-800">Workflow</p><div className="mt-2 flex flex-col gap-2">{nextStatuses.map((status) => <button key={status} type="button" disabled={busy} onClick={() => onStatus(status)} className="h-10 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-brand disabled:opacity-50">Move to {statusLabels[status]}</button>)}</div></div>
          {isOwner ? <div className="border-t border-slate-200 pt-5"><button type="button" disabled={busy} onClick={onDelete} className="h-10 w-full rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete task</button></div> : null}
        </aside>
      </div>
      <TaskComments projectId={task.projetoId} taskId={task.id} currentUserId={currentUserId} />
    </section>
  );
}

function TaskFiltersForm({ members, filters, busy, onApply, onClear }: { members: ProjectMemberListItem[]; filters: TaskFilters; busy: boolean; onApply: (event: FormEvent<HTMLFormElement>) => void; onClear: (form: HTMLFormElement) => void }) {
  return <form onSubmit={onApply} className="mt-7 rounded-2xl border border-border bg-white p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto_auto] lg:items-end"><FilterSelect name="status" label="Status" defaultValue={filters.status ?? ""} options={columns.map((item) => ({ value: item.status, label: item.label }))} /><FilterSelect name="prioridade" label="Priority" defaultValue={filters.prioridade ?? ""} options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))} /><FilterSelect name="responsavelId" label="Assignee" defaultValue={filters.responsavelId?.toString() ?? ""} options={members.map((member) => ({ value: member.usuario.id.toString(), label: member.usuario.nome }))} /><button type="submit" disabled={busy} className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">Apply</button><button type="button" disabled={busy} onClick={(event) => onClear(event.currentTarget.form!)} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Clear</button></div></form>;
}

function FilterSelect({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: Array<{ value: string; label: string }> }) {
  return <label className="text-xs font-semibold text-slate-600">{label}<select key={defaultValue} name={name} defaultValue={defaultValue} className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-brand focus:ring-4 focus:ring-blue-100"><option value="">All</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function Pagination({ meta, busy, onPage }: { meta: TasksResponse["meta"]; busy: boolean; onPage: (page: number) => void }) {
  return <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm sm:flex-row"><p className="text-muted">{meta.total} task{meta.total === 1 ? "" : "s"} · Page {meta.page} of {Math.max(meta.totalPages, 1)}</p><div className="flex gap-2"><button type="button" disabled={busy || meta.page <= 1} onClick={() => onPage(meta.page - 1)} className="h-9 rounded-lg border border-slate-300 px-3 font-semibold hover:bg-slate-50 disabled:opacity-40">Previous</button><button type="button" disabled={busy || meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} className="h-9 rounded-lg border border-slate-300 px-3 font-semibold hover:bg-slate-50 disabled:opacity-40">Next</button></div></div>;
}

function taskFormValues(form: HTMLFormElement, includeCreateFields: boolean) {
  const data = new FormData(form);
  const due = data.get("prazo");
  const responsible = data.get("responsavelId");
  return {
    titulo: data.get("titulo"), descricao: data.get("descricao"), prioridade: data.get("prioridade"),
    prazo: typeof due === "string" && due ? new Date(`${due}T00:00:00.000Z`).toISOString() : undefined,
    status: includeCreateFields ? data.get("status") : undefined,
    responsavelId: includeCreateFields && typeof responsible === "string" && responsible ? Number(responsible) : undefined,
  };
}

function zodErrors(issues: Array<{ path: PropertyKey[]; message: string }>) { const errors: Record<string, string> = {}; for (const issue of issues) { const field = String(issue.path[0]); if (!errors[field]) errors[field] = issue.message; } return errors; }
function optionalStatus(value: FormDataEntryValue | null): TaskStatus | undefined { return typeof value === "string" && columns.some((item) => item.status === value) ? value as TaskStatus : undefined; }
function optionalPriority(value: FormDataEntryValue | null): TaskPriority | undefined { return value === "BAIXA" || value === "MEDIA" || value === "ALTA" ? value : undefined; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value)); }
function BoardLoading() { return <div className="mx-auto max-w-[1500px] animate-pulse"><div className="h-5 w-32 rounded bg-slate-200" /><div className="mt-5 h-10 w-72 rounded bg-slate-200" /><div className="mt-10 grid min-w-[1000px] grid-cols-4 gap-4 overflow-hidden">{[1,2,3,4].map((item) => <div key={item} className="h-80 rounded-2xl bg-slate-200" />)}</div></div>; }
function PageError({ status, projectId }: { status: "forbidden" | "not-found" | "error"; projectId: number }) { const text = status === "forbidden" ? "You are not a member of this project." : status === "not-found" ? "Project not found." : "Unable to load tasks."; return <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center"><h1 className="text-xl font-semibold text-slate-950">Tasks unavailable</h1><p className="mt-2 text-sm text-muted">{text}</p><Link href={`/projects/${projectId}`} className="mt-5 inline-block text-sm font-semibold text-brand">Back to project</Link></div>; }
