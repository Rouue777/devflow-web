"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api/error";
import { addProjectMemberSchema } from "@/services/projects/schemas";
import {
  addProjectMember,
  getProjectMembers,
  removeProjectMember,
} from "@/services/projects/service";
import { type ProjectMemberListItem } from "@/services/projects/types";

type MembersState =
  | { status: "loading" }
  | { status: "ready"; members: ProjectMemberListItem[] }
  | { status: "error" };

type ProjectMembersProps = {
  projectId: number;
  ownerId: number;
  canManage: boolean;
};

export function ProjectMembers({
  projectId,
  ownerId,
  canManage,
}: ProjectMembersProps) {
  const router = useRouter();
  const [state, setState] = useState<MembersState>({ status: "loading" });
  const [isAdding, setIsAdding] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setState({ status: "loading" });

    try {
      setState({ status: "ready", members: await getProjectMembers(projectId) });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.replace("/login");
        return;
      }
      setState({ status: "error" });
    }
  }, [projectId, router]);

  useEffect(() => {
    let isActive = true;

    void getProjectMembers(projectId)
      .then((members) => {
        if (isActive) setState({ status: "ready", members });
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace("/login");
          return;
        }
        setState({ status: "error" });
      });

    return () => {
      isActive = false;
    };
  }, [projectId, router]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isAdding || state.status !== "ready") return;

    setFieldError(null);
    setActionError(null);
    setSuccessMessage(null);

    const form = event.currentTarget;
    const rawValue = new FormData(form).get("email");
    const result = addProjectMemberSchema.safeParse({
      email: typeof rawValue === "string" ? rawValue : "",
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }

    setIsAdding(true);
    try {
      const addedMember = await addProjectMember(projectId, result.data);
      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              members: [...current.members, { usuario: addedMember.usuario }],
            }
          : current,
      );
      form.reset();
      setSuccessMessage(`${addedMember.usuario.nome} was added to the project.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.replace("/login");
          return;
        }
        if (error.response?.status === 403) {
          setActionError("You do not have permission to add members.");
          return;
        }
        if (error.response?.status === 404) {
          setActionError("No DevFlow user was found with this email.");
          return;
        }
        if (error.response?.status === 409) {
          setActionError("This user is already a project member.");
          return;
        }
      }
      setActionError(
        getApiErrorMessage(error, "Unable to add this member."),
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemove(member: ProjectMemberListItem) {
    const memberId = member.usuario.id;
    if (removingMemberId !== null || memberId === ownerId) return;

    const confirmed = window.confirm(
      `Remove ${member.usuario.nome} from this project?`,
    );
    if (!confirmed) return;

    setActionError(null);
    setSuccessMessage(null);
    setRemovingMemberId(memberId);

    try {
      await removeProjectMember(projectId, memberId);
      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              members: current.members.filter(
                (item) => item.usuario.id !== memberId,
              ),
            }
          : current,
      );
      setSuccessMessage(`${member.usuario.nome} was removed from the project.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.replace("/login");
          return;
        }
        if (error.response?.status === 403) {
          setActionError("You do not have permission to remove this member.");
          return;
        }
      }
      setActionError(
        getApiErrorMessage(error, "Unable to remove this member."),
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
      aria-labelledby="members-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="members-title" className="text-lg font-semibold text-slate-950">
            Members
          </h2>
          <p className="mt-1 text-sm text-muted">People with access to this project.</p>
        </div>
        {state.status === "ready" ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {state.members.length}
          </span>
        ) : null}
      </div>

      {canManage ? (
        <form onSubmit={handleAdd} noValidate className="mt-6 border-b border-border pb-6">
          <label htmlFor="member-email" className="text-sm font-semibold text-slate-800">
            Member email
          </label>
          <p id="member-email-help" className="mt-1 text-xs leading-5 text-muted">
            Enter the email address of an existing DevFlow user.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="member-email"
              name="email"
              type="email"
              autoComplete="email"
              disabled={isAdding}
              aria-describedby={`member-email-help${fieldError ? " member-email-error" : ""}`}
              aria-invalid={Boolean(fieldError)}
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              placeholder="user@example.com"
            />
            <button
              type="submit"
              disabled={isAdding || state.status !== "ready"}
              className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isAdding ? "Adding..." : "Add member"}
            </button>
          </div>
          {fieldError ? (
            <p id="member-email-error" role="alert" className="mt-2 text-sm text-red-600">
              {fieldError}
            </p>
          ) : null}
        </form>
      ) : null}

      {actionError ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}
      {successMessage ? (
        <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {state.status === "loading" ? <MembersLoading /> : null}
      {state.status === "error" ? (
        <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
          <p className="text-sm text-slate-700">Unable to load members.</p>
          <button type="button" onClick={() => void loadMembers()} className="mt-3 text-sm font-semibold text-brand hover:text-brand-strong">
            Try again
          </button>
        </div>
      ) : null}
      {state.status === "ready" && state.members.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-sm text-muted">
          No members were found for this project.
        </p>
      ) : null}
      {state.status === "ready" && state.members.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {state.members.map((member) => {
            const isOwner = member.usuario.id === ownerId;
            const isRemoving = removingMemberId === member.usuario.id;

            return (
              <li key={member.usuario.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-brand">
                  {member.usuario.nome.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{member.usuario.nome}</p>
                    {isOwner ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-brand uppercase">Owner</span> : null}
                  </div>
                  <p className="truncate text-xs text-muted">{member.usuario.email}</p>
                  <p className="mt-0.5 text-[0.7rem] text-slate-400">ID {member.usuario.id}</p>
                </div>
                {canManage && !isOwner ? (
                  <button
                    type="button"
                    onClick={() => void handleRemove(member)}
                    disabled={removingMemberId !== null}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {isRemoving ? "Removing..." : "Remove"}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function MembersLoading() {
  return (
    <div aria-label="Loading members" className="mt-5 space-y-3 animate-pulse">
      {[1, 2].map((item) => (
        <div key={item} className="h-16 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
