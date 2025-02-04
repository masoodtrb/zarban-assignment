/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './styles/App.css';
import { useMethods } from './utils/hooks/useMethod';
import { useQuery } from './utils/hooks/useQuery';
import { useInterceptedRequest } from './utils/baseApi';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface State {
  tasks: Task[];
  filteredTasks: Task[];
  statusFilter: string;
  searchQuery: string;
}
interface TaskMethods {
  setTasks: (tasks: Task[]) => State;
  setFilteredTasks: (tasks: Task[]) => State;
  setStatusFilter: (status: string) => State;
  setSearchQuery: (query: string) => State;
}

const App: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [state, methods] = useMethods<TaskMethods, State>(
    (state) => {
      return {
        setTasks: (tasks: Task[]) => ({
          ...state,
          tasks,
          filteredTasks: tasks,
        }),
        setFilteredTasks: (tasks: Task[]) => ({
          ...state,
          filteredTasks: tasks,
        }),
        setStatusFilter: (status: string) => ({
          ...state,
          statusFilter: status,
        }),
        setSearchQuery: (query: string) => ({ ...state, searchQuery: query }),
      };
    },
    {
      tasks: [],
      filteredTasks: [],
      statusFilter: 'all',
      searchQuery: '',
    }
  );
  const memoryReq = useInterceptedRequest();

  const { data, err, loading } = useQuery<Task[], 'GET'>(memoryReq, '/todos', {
    method: 'GET',
  }, [counter]);

  useEffect(() => {
    if (data?.result) {
      methods.setTasks(data.result);
    }
  }, [data, loading]);

  // useEffect(() => {
  //   fetch('https://jsonplaceholder.typicode.com/todos')
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch tasks');
  //       }
  //       return response.json();
  //     })
  //     .then((data: Task[]) => {
  //       methods.setTasks(data);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, []);

  useEffect(() => {
    let filtered = state.tasks;
    if (state.statusFilter !== 'all') {
      const isCompleted = state.statusFilter === 'completed';
      filtered = filtered.filter((task) => task.completed === isCompleted);
    }
    if (state.searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }
    methods.setFilteredTasks(filtered);
  }, [state.statusFilter, state.searchQuery, state.tasks]);

  return (
    <div className="app-container">
      <h1>Task List</h1>
      <div className="controls">
        <input
          disabled={loading || !!err}
          type="text"
          placeholder="Search tasks..."
          value={state.searchQuery}
          onChange={(e) => methods.setSearchQuery(e.target.value)}
        />
        <select
          disabled={loading || !!err}
          onChange={(e) => methods.setStatusFilter(e.target.value)}
          value={state.statusFilter}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      {loading && <p>Loading Data........</p>}
      {err && (
        <>
          <h2>Api have error</h2>
          <p>Cause: {err.cause}</p>
          <p>Description: {err.description}</p>
          <p><button onClick={() => setCounter(state => state + 1)}>Retry</button></p>
        </>
      )}
      <ul className="task-list">
        {state.filteredTasks.map((task) => (
          <li
            key={task.id}
            className={task.completed ? 'completed row' : 'pending row'}
          >
            <span>{task.title}</span>
            <span>{task.completed ? '✔ Completed' : '❌ Pending'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
