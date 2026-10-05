# DevFlow Frontend — Codex Instructions

## 1. Project Overview

DevFlow is a full-stack project and task management application.

This repository contains the **frontend** application. The backend already exists as a separate REST API built with NestJS.

The project has two main goals:

1. Build a functional project/task management application.
2. Serve as a high-quality portfolio project demonstrating full-stack development skills.

Development should prioritize:

- clean and maintainable code;
- good user experience;
- clear architecture;
- type safety;
- correct API integration;
- responsive UI;
- reasonable automated testing;
- fast and incremental delivery.

Avoid unnecessary complexity and overengineering.

---

## 2. Frontend Stack

Current stack:

- Next.js 16
- React 19
- TypeScript
- App Router
- Tailwind CSS 4
- Axios
- Zod

Do not introduce additional libraries unless they solve a concrete problem.

Before adding a dependency:

1. Check whether the existing stack already solves the problem.
2. Explain why the dependency is necessary.
3. Prefer small, established dependencies when a library is justified.

Do not introduce Redux, Zustand, TanStack Query, large UI frameworks, or other architectural dependencies unless explicitly requested or clearly justified by an actual project requirement.

---

## 3. Backend

The backend is an existing REST API built with:

- NestJS 12
- Prisma 7
- PostgreSQL
- JWT
- bcrypt

The frontend must consume the backend rather than duplicate backend business logic.

The known API prefix is:

`/api/v1`

The API base URL must come from environment configuration.

Never hardcode production API URLs throughout components.

---

## 4. Authentication

Authentication is JWT Bearer based.

The login response contains:

`{ "access_token": "<jwt>" }`

Protected API requests use:

`Authorization: Bearer <access_token>`

Authentication/session handling must be centralized rather than manually implemented independently in multiple components.

HTTP 401 responses should be treated as an absent, invalid, or expired authenticated session.

Never expose passwords or sensitive authentication data in UI state, logs, URLs, or error messages.

Do not invent authentication mechanisms that do not exist in the backend.

---

## 5. Domain

The main frontend domains/features are:

- Authentication
- Users/Profile
- Projects
- Project Members
- Tasks
- Kanban
- Comments

Keep domain-specific code reasonably close to the feature that owns it while keeping genuinely shared infrastructure reusable.

Do not create abstractions solely because they might theoretically be useful later.

---

## 6. Core Domain Models

### User

Main known fields:

- id
- nome
- email
- dataCadastro

The password must never be exposed by the frontend.

### Project

Main known fields:

- id
- nome
- descricao
- dataCriacao
- responsavelId

Each project has exactly one project owner/responsible user.

### Project Member

Projects and users have a many-to-many membership relationship.

### Task

Main known fields:

- id
- titulo
- descricao
- prioridade
- status
- prazo
- dataCriacao
- dataAtualizacao
- projetoId
- responsavelId

Task assignee is optional.

### Comment

Main known fields:

- id
- conteudo
- dataCriacao
- tarefaId
- usuarioId

---

## 7. Enums

The frontend must use exactly the backend enum values.

### Task Priority

- `BAIXA`
- `MEDIA`
- `ALTA`

### Task Status

- `CRIADO`
- `EM_PROGRESSO`
- `EM_REVIEW`
- `FEITO`

Do not change API values for visual convenience.

The UI may display translated/friendly labels, but communication with the API must preserve the original enum values.

---

## 8. Business Rules

These rules are part of the backend contract and must be reflected correctly by the frontend UI.

### Projects and Members

- The project creator automatically becomes the project owner.
- Every project has exactly one owner.
- The project owner can add members.
- The project owner can remove members.
- The owner cannot remove themselves.
- Users may only access projects they participate in or own.
- Removing a member does not delete their tasks.
- Tasks assigned to a removed member become unassigned.

### Tasks

- Any project member can create a task.
- A task may initially have status `CRIADO` or `EM_PROGRESSO`.
- Task assignee is optional.
- If an assignee is provided, that user must be a project member.
- Only the project owner can delete a task.
- Project members and the project owner can send a task to `EM_REVIEW`.
- Only the project owner can mark a task as `FEITO`.
- A task cannot transition directly from `CRIADO` or `EM_PROGRESSO` to `FEITO`.
- `EM_REVIEW -> EM_PROGRESSO` is allowed.
- `FEITO -> EM_REVIEW` is allowed.

Do not invent additional task transitions.

### Comments

- Project members can create comments.
- Project members can list comments.
- Only the comment author can delete their own comment.
- Comments are not editable.

---

## 9. Authorization Philosophy

The frontend should reflect permissions in the UI.

Examples:

- hide or disable actions the current user cannot perform;
- only show project-owner actions to the project owner;
- prevent invalid task-status actions from being presented when possible.

However:

**The frontend is never the security authority.**

Backend authorization remains authoritative.

Do not assume that hiding a button replaces backend permission validation.

Handle `401`, `403`, `404`, validation errors and conflicts returned by the API appropriately.

---

## 10. Tasks Listing Contract

Task listing supports:

- status
- prioridade
- responsavelId
- page
- limit

Known defaults:

- `page = 1`
- `limit = 10`

Maximum known limit:

- `100`

The task list response is paginated and follows:

```text
{
  data: [...],
  meta: {
    page,
    limit,
    total,
    totalPages
  }
}
```

Do not treat this endpoint response as a direct array.

Filters must remain compatible with the backend enum values.

---

## 11. Architecture Principles

Use the Next.js App Router correctly.

Prefer:

- Server Components when they provide a real benefit;
- Client Components only when browser APIs, state, event handlers or interactive behavior require them;
- small focused components;
- explicit TypeScript types;
- reusable shared components only when reuse actually exists;
- centralized API configuration;
- feature/domain organization where useful;
- clear separation between UI, API communication and validation.

Avoid:

- giant page components;
- unnecessary `"use client"`;
- duplicated API configuration;
- duplicated schemas/types without reason;
- premature generic abstractions;
- deep directory structures without clear value;
- business logic scattered throughout presentation components;
- unnecessary global state;
- `any` unless there is a concrete and documented reason.

Favor readability over cleverness.

---

## 12. API Layer

Axios is the HTTP client.

API communication should be centralized enough that:

- base URL configuration is not duplicated;
- authentication headers can be handled consistently;
- common HTTP behavior can be handled consistently;
- components do not repeatedly recreate Axios configuration.

Environment variables should be used for environment-specific configuration.

Do not invent endpoint paths.

When an endpoint contract is unknown, request/inspect the backend reference or backend source instead of guessing.

---

## 13. Validation

Zod is the validation library.

Use Zod when runtime validation is valuable, particularly for:

- forms;
- user input;
- important external data boundaries when appropriate.

Avoid duplicating the same validation rules unnecessarily.

Keep validation messages understandable to the user.

---

## 14. UI/UX Direction

DevFlow is a portfolio project, so visual quality matters.

The interface should feel like a modern productivity/project-management application.

Prioritize:

- clean visual hierarchy;
- consistent spacing;
- responsive layouts;
- clear navigation;
- useful empty states;
- loading feedback;
- understandable error feedback;
- accessible forms;
- keyboard-friendly interactions where reasonable;
- clear task statuses and priorities;
- professional dashboard/Kanban presentation.

Avoid excessive visual complexity or animations that do not improve usability.

Desktop experience is important, but the application should remain usable on smaller screens.

---

## 15. Styling

Use Tailwind CSS 4.

Prefer consistent reusable styling patterns.

Avoid:

- unnecessary inline styles;
- duplicated large class combinations when a component abstraction is clearly justified;
- arbitrary visual decisions that conflict across screens.

Maintain a coherent design language throughout the application.

---

## 16. Error Handling

Do not silently swallow errors.

The UI should distinguish where appropriate between:

- validation errors;
- authentication errors (`401`);
- authorization errors (`403`);
- missing resources (`404`);
- conflicts (`409`);
- unexpected server/network failures.

User-facing messages should be understandable and should not expose internal implementation details.

Development logs may contain useful debugging information but must not expose sensitive data.

---

## 17. Loading and Empty States

Async screens should not appear broken while waiting for data.

Where appropriate, implement:

- loading indicators/skeletons;
- disabled submission states;
- empty states;
- retry behavior;
- useful error states.

Avoid duplicate submissions.

---

## 18. Testing and Quality

Changes should remain testable.

Do not build architecture that makes components unnecessarily difficult to test.

For significant implementation changes, run the relevant available checks such as:

- lint;
- TypeScript checks;
- tests;
- production build.

Do not claim a command passed unless it was actually executed.

If validation cannot be executed, state that explicitly.

Testing should focus on meaningful behavior rather than maximizing test count.

---

## 19. Development Workflow

Work incrementally.

Preferred implementation sequence:

1. Initial architecture/setup
2. API client/configuration
3. Authentication
4. Main authenticated layout/navigation
5. Projects
6. Project members
7. Tasks
8. Kanban
9. Comments
10. Filters/pagination and UX refinements
11. Automated tests
12. Final responsive/accessibility polish
13. Production integration/deployment

Do not implement future stages unless requested.

---

## 20. Scope Control

This project values delivery speed as well as quality.

When implementing a task:

- implement what was requested;
- avoid unrelated refactors;
- avoid speculative features;
- do not rewrite working code without a concrete benefit;
- keep changes reviewable;
- prefer incremental improvements.

If you discover a problem outside the requested scope, report it instead of automatically expanding the task.

---

## 21. Working With Existing Code

Before making changes:

1. Inspect the relevant existing files.
2. Understand current conventions.
3. Preserve working configuration unless there is a reason to change it.
4. Prefer adapting to existing good patterns rather than replacing them.

Never assume a file or dependency exists without checking the repository.

---

## 22. Backend Contract Uncertainty

Not every exact backend endpoint is guaranteed to be documented in this file.

If an exact HTTP method, path, payload or response structure is unknown:

**Do not invent it.**

Instead:

1. inspect available backend/API documentation if present;
2. report what information is missing;
3. ask for the backend contract when necessary.

This is particularly important for authentication, project/member endpoints and task mutations.

---

## 23. Codex Execution Rules

For every requested development task:

### Before editing

- inspect relevant files;
- understand the current state;
- identify the smallest appropriate change.

### During implementation

- keep changes focused;
- maintain TypeScript safety;
- follow existing conventions;
- do not add dependencies without justification;
- do not implement unrelated features.

### After implementation

Review the diff and verify that no unrelated files were changed.

Run appropriate validation whenever possible.

---

## 24. Required Completion Report

After completing a development task, always provide a concise report containing:

### What was done

Describe the implemented changes.

### Files changed

List files created, modified or removed.

### Technical decisions

Mention relevant architectural or implementation decisions.

### Validation

List commands actually executed and their results.

Example:

`npm run lint` — passed

`npm run build` — passed

Never report checks that were not executed.

### Issues / uncertainties

Report errors, missing backend contracts, assumptions or unresolved decisions.

If none exist, state that clearly.

### Recommended next step

Recommend the single most logical next development step.

Do not automatically implement that next step unless requested.

---

## 25. Primary Principle

Build DevFlow as a real application, not as a code-generation exercise.

The resulting code should be understandable by the developer who owns the project and defensible in a technical interview.

Prefer:

**simple, explicit, maintainable and working**

over:

**complex, abstract or theoretically perfect**.