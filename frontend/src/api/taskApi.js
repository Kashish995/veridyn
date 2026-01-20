const BASE_URL = "http://localhost:5000/api/tasks";

export const getTasksByUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}`);
  return res.json();
};

export const createTask = async (task) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
};

export const updateTaskStatus = async (taskId, body) => {
  const res = await fetch(`${BASE_URL}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const deleteTask = async (taskId) => {
  await fetch(`${BASE_URL}/${taskId}`, {
    method: "DELETE",
  });
};

