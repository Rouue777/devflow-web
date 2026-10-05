import type { Metadata } from "next";

import { ProjectsPage } from "@/components/projects/projects-page";

export const metadata: Metadata = { title: "Projetos", description: "Projetos no seu espaço de trabalho DevFlow." };

export default function Page() {
  return <ProjectsPage />;
}
