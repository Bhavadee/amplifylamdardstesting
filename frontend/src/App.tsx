import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { createTodo, deleteTodo, fetchTodos, toggleTodo, type Todo } from './api';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const completedCount = useMemo(() => todos.filter((todo) => todo.completed).length, [todos]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTodos();
        setTodos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleAddTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const todo = await createTodo(newTitle.trim());
      setTodos((current) => [todo, ...current]);
      setNewTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleTodo(id);
      setTodos((current) => current.map((todo) => (todo.id === id ? updated : todo)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  return (
    <div className="layout">
      <header>
        <p className="eyebrow">Sample AWS Amplify Frontend</p>
        <h1>Todo dashboard</h1>
        <p>Connected to an Express + PostgreSQL API deployed on AWS Lambda.</p>
      </header>

      <section className="panel">
        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            value={newTitle}
            placeholder="Add a todo item"
            onChange={(event) => setNewTitle(event.target.value)}
          />
          <button type="submit" disabled={!newTitle.trim() || submitting}>
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </form>
        <div className="stats">
          <span>{todos.length} total</span>
          <span>{completedCount} completed</span>
        </div>
      </section>

      <section className="panel">
        {error && <div className="error">{error}</div>}
        {loading ? (
          <p>Loading todos…</p>
        ) : todos.length === 0 ? (
          <p>No todos yet. Create your first one above.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'todo completed' : 'todo'}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id)}
                  />
                  <span>
                    {todo.title}
                    <small>{new Date(todo.createdAt).toLocaleString()}</small>
                  </span>
                </label>
                <button className="ghost" onClick={() => handleDelete(todo.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
