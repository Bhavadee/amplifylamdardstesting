export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/$/,
  '',
) ?? 'https://xespw2fp0i.execute-api.us-east-2.amazonaws.com';

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch(buildUrl('/api/todos'));
  return handleResponse(response);
};

export const createTodo = async (title: string): Promise<Todo> => {
  const response = await fetch(buildUrl('/api/todos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse(response);
};

export const toggleTodo = async (id: string): Promise<Todo> => {
  const response = await fetch(buildUrl(`/api/todos/${id}/toggle`), {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(buildUrl(`/api/todos/${id}`), {
    method: 'DELETE',
  });
  await handleResponse(response);
};
