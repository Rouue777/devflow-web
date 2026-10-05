import { apiClient } from "@/services/api/client";
import {
  addProjectMemberSchema,
  createProjectSchema,
  updateProjectSchema,
} from "@/services/projects/schemas";
import {
  type AddedProjectMember,
  type AddProjectMemberInput,
  type CreateProjectInput,
  type Project,
  type ProjectDetail,
  type ProjectMemberListItem,
  type UpdatedProject,
  type UpdateProjectInput,
} from "@/services/projects/types";

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>("/projects");
  return response.data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const payload = createProjectSchema.parse(input);
  const response = await apiClient.post<Project>("/projects", payload);
  return response.data;
}

export async function getProject(id: number): Promise<ProjectDetail> {
  const response = await apiClient.get<ProjectDetail>(`/projects/${id}`);
  return response.data;
}

export async function updateProject(
  id: number,
  input: UpdateProjectInput,
): Promise<UpdatedProject> {
  const payload = updateProjectSchema.parse(input);
  const response = await apiClient.patch<UpdatedProject>(
    `/projects/${id}`,
    payload,
  );
  return response.data;
}

export async function getProjectMembers(
  projectId: number,
): Promise<ProjectMemberListItem[]> {
  const response = await apiClient.get<ProjectMemberListItem[]>(
    `/projects/${projectId}/members`,
  );
  return response.data;
}

export async function addProjectMember(
  projectId: number,
  input: AddProjectMemberInput,
): Promise<AddedProjectMember> {
  const payload = addProjectMemberSchema.parse(input);
  const response = await apiClient.post<AddedProjectMember>(
    `/projects/${projectId}/members`,
    payload,
  );
  return response.data;
}

export async function removeProjectMember(
  projectId: number,
  memberId: number,
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
}
