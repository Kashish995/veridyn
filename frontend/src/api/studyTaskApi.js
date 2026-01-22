import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// GET tasks
export const getStudyTasksByUser = async (userId) => {
  const res = await API.get(`/api/study-tasks/user/${userId}`);
  return res.data;
};

// CREATE task  🔥 THIS WAS WRONG BEFORE
export const createStudyTask = async (taskData) => {
  const res = await API.post(`/api/study-tasks`, taskData);
  return res.data;
};

// UPDATE task
export const updateStudyTask = async (id, updateData) => {
  const res = await API.patch(`/api/study-tasks/${id}`, updateData);
  return res.data;
};

// DELETE task
export const deleteStudyTask = async (id) => {
  const res = await API.delete(`/api/study-tasks/${id}`);
  return res.data;
};
