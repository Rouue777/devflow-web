import type { Metadata } from "next";

import { ProjectsPage } from "@/components/projects/projects-page";

export const metadata: Metadata = { title: "Projects", description: "Projects in your DevFlow workspace." };

export default function Page() {
  return <ProjectsPage />;
}
