import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TasksPage } from "@/components/tasks/tasks-page";

export const metadata: Metadata = { title: "Tasks" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId) || projectId < 1) notFound();
  return <TasksPage projectId={projectId} />;
}
