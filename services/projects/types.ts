import { type z } from "zod";

import {
  addProjectMemberSchema,
  createProjectSchema,
  updateProjectSchema,
} from "@/services/projects/schemas";

export type ProjectOwner = {
  id: number;
  nome: string;
  email: string;
};

export type Project = {
  id: number;
  nome: string;
  descricao: string | null;
  dataCriacao: string;
  responsavelId: number;
  responsavel: ProjectOwner;
};

export type ProjectMember = {
  projetoId: number;
  usuarioId: number;
  usuario: ProjectOwner;
};

export type ProjectMemberListItem = Pick<ProjectMember, "usuario">;
export type AddedProjectMember = ProjectMember;

export type ProjectDetail = Project & { membros: ProjectMember[] };
export type UpdatedProject = Omit<Project, "responsavel">;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
