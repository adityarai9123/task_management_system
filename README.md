# Task Management System

A full-stack task management application built from the supplied Figma design. The application provides a guest workspace for creating, organizing, filtering, and managing tasks through Kanban Board and List views, with task details, subtasks, updates/comments, projects, profile settings, and persistent MongoDB storage.

## Assessment Scope

This project was developed for the AbleSpace assessment.

### Part 1 — Task Management System

The implementation covers the supplied task-management Figma experience, including:

- Guest entry experience
- Kanban Board and List views
- Task creation, editing, deletion, and status transitions
- Search, filtering, and configurable fields
- Task details view
- Subtasks and completion state
- Updates/comments and replies
- Projects and project task views
- Profile/settings experience
- Light/dark theme support
- Responsive and collapsible navigation
- NestJS REST APIs with MongoDB persistence

### Part 2 — Product Understanding

Part 2 is submitted separately as requested by the assessment. It covers the AbleSpace **Take Data** workflow from the **Caseload** tab, with the workflow explained in the candidate's own words and UX/UI or functionality improvements identified.

---

## Features

### Task Management

- Create tasks with title, description, status, priority, and due date.
- Add labels and assign members/reporters.
- Edit existing tasks.
- Delete tasks.
- Move tasks between:
  - To Do
  - Doing
  - Completed
  - On Hold
  - Backlog
- Persist task data through the NestJS API and MongoDB.
- Open an individual task details page.

### Task Details

The task details view follows the supplied Figma structure and includes:

- Task title and description
- Properties and labels
- Resources/documents/links
- Details panel
- Status and priority controls
- Members, dates, teams, and reporter information
- Subtasks table
- Add subtask functionality
- Mark subtasks complete/incomplete
- Updates/comments
- Reply to an update
- Persistent task-detail changes through the backend

### Task Views

- Kanban Board view.
- List view.
- Switch between Board and List without losing task state.
- Dynamic status counts.
- Horizontally scrollable Kanban columns.
- Responsive layout.
- Collapsible sidebar.

### Search, Filters & Fields

- Search tasks by title, description, and labels.
- Filter by priority and assignee.
- Apply multiple filters together.
- Clear active filters.
- Toggle configurable task fields/columns.
- Maintain field visibility while working in the current view.

### Projects

- View workspace projects.
- Create projects.
- Delete projects.
- Search projects.
- Filter projects by priority.
- View project priority, lead, and due date.
- Open an individual project view.
- View project tasks grouped by workflow status.
- Navigate from project tasks to individual task details.

Project metadata is currently stored locally for the guest workspace, while task data remains persisted through the backend and MongoDB.

### Settings & Theme

- Guest profile information.
- Profile editing and saving.
- Light/dark appearance support.
- Theme preference persistence through browser localStorage.

### UI & UX

- Production-oriented visual structure based on the supplied Figma.
- Responsive navigation.
- Collapsible desktop sidebar.
- Contextual task action menus.
- Viewport-aware task menus.
- Outside-click and Escape-key menu dismissal.
- Empty states and loading states.
- Horizontal scrolling for wide task boards/tables.
- Consistent cards, tables, controls, spacing, and typography.

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- NestJS 11
- TypeScript
- REST API
- class-validator
- class-transformer

### Database

- MongoDB
- Mongoose

---

## Application Architecture

```text
Task Management System
│
├── frontend/
│   └── Next.js + React + TypeScript
│       ├── Guest entry
│       ├── Tasks Board / List
│       ├── Task Details
│       ├── Projects / Project Details
│       └── Settings / Theme
│
└── backend/
    └── NestJS + TypeScript
        └── Tasks REST API
            │
            └── Mongoose
                │
                └── MongoDB
```

The frontend communicates with the backend through REST APIs. Task records, task metadata, subtasks, and comments are persisted in MongoDB.

---

## API

The backend exposes the following task endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Fetch all tasks |
| GET | `/tasks/:id` | Fetch a single task |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

Task updates can include task properties, project association, subtasks, resources, teams, and comments.

### Validation

NestJS uses a global `ValidationPipe` with:

- whitelist validation
- non-whitelisted field rejection
- transformation
- DTO-based validation

Task fields are validated for supported statuses/priorities, required titles, string types, array types, and maximum lengths.

---

## Project Structure

```text
task_management_system/
│
├── backend/
│   ├── src/
│   │   ├── tasks/
│   │   │   ├── dto/
│   │   │   │   ├── create-task.dto.ts
│   │   │   │   └── update-task.dto.ts
│   │   │   ├── task.schema.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   └── tasks.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   └── themeToggle.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

- Node.js
- npm
- MongoDB, either locally or through a MongoDB connection string

### Clone the repository

```bash
git clone https://github.com/adityarai9123/task_management_system.git
cd task_management_system
```

### Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example` and configure MongoDB:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_system
```

Start the backend:

```bash
npm run start:dev
```

The API runs on:

```text
http://localhost:3001
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

The application normally runs at:

```text
http://localhost:3000
```

---

## Production Build

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Both applications should be built before deployment/submission.

---

## Testing Checklist

The application has been functionally tested for:

- Guest entry/navigation
- Task creation
- Task editing
- Task deletion
- Status transitions
- Priority updates
- Due dates
- Search
- Filters
- Combined filters
- Field visibility
- Board/List switching
- Task action menus
- Sidebar collapse/expand
- Task details navigation
- Subtask creation
- Subtask completion state
- Comments and replies
- Resource links
- Projects navigation
- Project creation/deletion
- Project search/filtering
- Project task navigation
- Settings/profile updates
- Theme switching
- Theme persistence
- Direct route navigation
- Backend CRUD operations
- Single-task API retrieval
- MongoDB persistence
- Page refresh persistence
- Production builds

---

## Design and Implementation Notes

The implementation follows the supplied Figma design as closely as practical while keeping the code maintainable and appropriately scoped for the assessment.

Intentional implementation choices include:

- Guest-user data is used instead of a full authentication system because the supplied experience is centered around the guest workspace.
- Project metadata is stored locally for the demo workspace, while task data is persisted through the backend.
- Task detail metadata, subtasks, resources, and comments are persisted with the task document.
- Task menus use viewport-aware positioning so they remain usable near screen edges.
- The Kanban board uses horizontal scrolling when all workflow columns cannot fit in the viewport.
- Responsive layouts are used for desktop, tablet, and smaller screens.

---

## Environment & Security

Environment files containing credentials or connection strings are intentionally excluded from version control.

Use the provided example files:

```text
backend/.env.example
frontend/.env.example
```

Do not commit real MongoDB credentials, API keys, or other secrets.

---

## Deployment

Live URL: `https://task-management-system-tan-three.vercel.app`

The deployed application should remain publicly accessible for at least 45 days after submission, as required by the assessment.

---

## Repository

GitHub: `https://github.com/adityarai9123/task_management_system`

---

## Notes for Reviewers

- The application presents the assessment's guest-user experience.
- Tasks are persisted through the NestJS backend and MongoDB rather than only frontend state.
- Task details, subtasks, resources, and comments are persisted as part of the task document.
- Frontend and backend are maintained as separate applications.
- Environment files containing secrets are excluded from the repository.
- Part 2 is submitted separately as required by the assessment.

---

## Author

**Aditya Kumar Rai**
