import api from "./api";

export const getTasksByUser = async (userId) => {
  const res = await api.get(`/tasks/user/${userId}`);
  return res.data;
};

export const createTask = async (task) => {
  const res = await api.post("/tasks", task);
  return res.data;
};

export const updateTaskStatus = async (taskId, body) => {
  const res = await api.patch(`/tasks/${taskId}`, body);
  return res.data;
};

export const deleteTask = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
};