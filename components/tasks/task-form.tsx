import { type Task, type TaskPriority, type TaskStatus } from "@/services/tasks/types";
import { type ProjectMemberListItem } from "@/services/projects/types";

type TaskFormProps = {
  mode: "create" | "edit";
  members: ProjectMemberListItem[];
  disabled: boolean;
  task?: Task;
  errors: Record<string, string | undefined>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const priorities: Array<{ value: TaskPriority; label: string }> = [
  { value: "BAIXA", label: "Low" },
  { value: "MEDIA", label: "Medium" },
  { value: "ALTA", label: "High" },
];

const initialStatuses: Array<{ value: TaskStatus; label: string }> = [
  { value: "CRIADO", label: "Created" },
  { value: "EM_PROGRESSO", label: "In Progress" },
];

export function TaskForm({
  mode,
  members,
  disabled,
  task,
  errors,
  onSubmit,
}: TaskFormProps) {
  const dueDate = task?.prazo ? task.prazo.slice(0, 10) : "";

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
      <Field label="Title" name="titulo" error={errors.titulo}>
        <input
          id="titulo"
          name="titulo"
          defaultValue={task?.titulo}
          disabled={disabled}
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby={errors.titulo ? "titulo-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Description" name="descricao" error={errors.descricao}>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          defaultValue={task?.descricao ?? ""}
          disabled={disabled}
          className={`${inputClass} min-h-28 resize-y py-3`}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Priority" name="prioridade" error={errors.prioridade}>
          <select
            id="prioridade"
            name="prioridade"
            defaultValue={task?.prioridade ?? "MEDIA"}
            disabled={disabled}
            className={inputClass}
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Due date" name="prazo" error={errors.prazo}>
          <input
            id="prazo"
            name="prazo"
            type="date"
            defaultValue={dueDate}
            disabled={disabled}
            className={inputClass}
          />
        </Field>
      </div>

      {mode === "create" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Initial status" name="status" error={errors.status}>
            <select id="status" name="status" defaultValue="CRIADO" disabled={disabled} className={inputClass}>
              {initialStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Assignee (optional)" name="responsavelId" error={errors.responsavelId}>
            <select id="responsavelId" name="responsavelId" defaultValue="" disabled={disabled} className={inputClass}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.usuario.id} value={member.usuario.id}>{member.usuario.nome}</option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {disabled ? "Saving..." : mode === "create" ? "Create task" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-slate-800">{label}</label>
      <div className="mt-2">{children}</div>
      {error ? <p id={`${name}-error`} role="alert" className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100";
