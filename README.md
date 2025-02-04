# Zarban Assignment

## Overview

Zarban Assignment is a React-based project designed to demonstrate efficient state management, API handling, and UI responsiveness. The application fetches and displays a list of tasks, allowing users to filter and search through them dynamically.

## Features

- **Task Management:** Fetches tasks from an external API.
- **Filtering & Searching:** Users can filter tasks based on their completion status and search by title.
- **State Management:** Utilizes `useMethods` for structured and scalable state management.
- **Error Handling:** Displays appropriate messages during loading or API request failures.
- **Type Safety:** Fully implemented in TypeScript for robustness.

## Tech Stack

- **React** (Functional Components & Hooks)
- **TypeScript** (For type safety and maintainability)
- **CSS Modules** (For modular and scoped styling)
- **Fetch API** (For handling external API requests)
- **Vite** (For fast and optimized development build)

## Installation

To run this project locally, follow these steps:

```sh
# Clone the repository
git clone https://github.com/masoodtrb/zarban-assignment.git

# Navigate to the project folder
cd zarban-assignment

# Install dependencies
yarn install  # or npm install

# Start the development server
yarn dev  # or npm run dev
```

## Usage

- Open `http://localhost:3000` in your browser.
- Use the search box to find tasks by title.
- Use the filter dropdown to switch between `All`, `Completed`, and `Pending` tasks.

## API Endpoint

The project fetches tasks from:

```
https://jsonplaceholder.typicode.com/todos
```

Each task object contains:

```json
{
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

## State Management with `useMethods`

### Overview
The project uses a custom state management hook `useMethods`, which is an improvement over `useReducer`. It provides an organized way to handle state transitions with well-structured methods.

### How It Works
1. **Defines State and Methods**: The hook accepts an initial state and a function (`createMethods`) that defines state transition methods.
2. **Reducer Implementation**: It dynamically selects and executes the correct method based on the dispatched action type.
3. **Action Dispatching**: Instead of manually dispatching actions, methods are directly callable as functions.

### Example Usage
```tsx
const [state, methods] = useMethods(
  (state) => ({
    setTasks: (tasks: Task[]) => ({ ...state, tasks }),
    setFilter: (filter: string) => ({ ...state, statusFilter: filter }),
  }),
  {
    tasks: [],
    statusFilter: "all",
    searchQuery: "",
  }
);

methods.setTasks([{ id: 1, title: "Task 1", completed: false }]);
methods.setFilter("completed");
```
This implementation makes state transitions clearer and more manageable.

## Folder Structure

```
zarban-assignment/
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx
│   ├── assets/
│   │   └── react.svg
│   ├── main.tsx
│   ├── styles/
│   │   ├── App.css
│   │   └── index.css
│   ├── utils/
│   │   ├── baseApi.ts
│   │   ├── exceptions/
│   │   │   └── httpException.ts
│   │   ├── hooks/
│   │   │   ├── useAsyncEffect.ts
│   │   │   ├── useMethod.ts
│   │   │   └── useQuery.ts
│   │   ├── isAbortError.ts
│   │   └── mapObjectValues.ts
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```