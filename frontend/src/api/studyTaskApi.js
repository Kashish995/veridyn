import api from "./api";

export const getStudyTasksByUser = async (userId) => {
  const res = await api.get(`/study-tasks/${userId}`);
  return res.data;
};

export const createStudyTask = async (taskData) => {
  const res = await api.post("/study-tasks", taskData);
  return res.data;
};

export const updateStudyTask = async (id, updates) => {
  const res = await api.patch(`/study-tasks/${id}`, updates);
  return res.data;
};

export const deleteStudyTask = async (id) => {
  const res = await api.delete(`/study-tasks/${id}`);
  return res.data;
};