# Task Management System

A full-stack task management application for creating, organizing, filtering, and managing tasks through clean **Kanban Board** and **List** views.

## Overview

This project was developed as part of the AbleSpace assessment. It provides a workspace for managing tasks with support for task creation, editing, deletion, status transitions, priorities, due dates, search, filtering, configurable fields, and persistent data storage.

The application consists of a Next.js frontend, a NestJS backend, and MongoDB for persistent task storage.

---

## Features

### Task Management

- Create new tasks with:
  - Title
  - Description
  - Status
  - Priority
  - Due date
- Edit existing tasks.
- Delete tasks.
- Move tasks between different statuses.
- Persist task data through the backend and MongoDB.
- Task changes remain available after page refreshes.

### Task Views

- **Kanban Board** view for visual task management.
- **List** view for structured task management.
- Switch between Board and List views without losing task state.
- Dynamic task counts for each status.
- Horizontally scrollable Kanban board when required.
- Responsive layout with a collapsible sidebar.

### Search, Filters & Fields

- Search tasks.
- Filter tasks using available task attributes.
- Apply multiple filters together.
- Clear filters and restore the complete task list.
- Toggle task fields/columns using the Fields control.
- Configurable List view fields.

### Task Statuses

Tasks can be organized into the following statuses:

- To Do
- Doing
- Completed
- On Hold
- Backlog

### Task Priorities

Supported priority levels include:

- No Priority
- Low
- Medium
- High
- Urgent

### Workspace

- Tasks workspace.
- Projects section.
- Settings section.
- Profile management.
- Light and dark theme support.
- Collapsible navigation sidebar.

### UI & UX

- Clean, production-oriented interface.
- Consistent List and Board layouts.
- Responsive navigation.
- Collapsible sidebar.
- Contextual task action menus.
- View switching between List and Board.
- Proper empty states.
- Horizontal Kanban scrolling when necessary.
- Viewport-aware task menus.
- Menus close appropriately when clicking outside.
- Task action menus remain positioned correctly while interacting with them.

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS

### Backend

- NestJS
- TypeScript
- REST API

### Database

- MongoDB
- Mongoose

---

## Application Architecture

```text
┌──────────────────────────────┐
│          Frontend            │
│                              │
│  Next.js + React + TypeScript│
│                              │
│  ┌────────┐   ┌───────────┐ │
│  │ Board  │   │   List    │ │
│  │  View  │   │   View    │ │
│  └────────┘   └───────────┘ │
│                              │
│ Search / Filters / Fields    │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│           Backend            │
│                              │
│       NestJS + TypeScript    │
│                              │
│  Tasks Controller            │
│  Tasks Service               │
└──────────────┬───────────────┘
               │
               │ Mongoose
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│                              │
│        Task Persistence      │
└──────────────────────────────┘