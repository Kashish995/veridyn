import axios from "axios";

const BASE_URL = "http://localhost:5000/api/study-tasks";

export const getStudyTasksByUser = async (userId) => {
  const res = await axios.get(`${BASE_URL}/${userId}`);
  return res.data;
};

export const createStudyTask = async (taskData) => {
  const res = await axios.post(BASE_URL, taskData);
  return res.data;
};

export const updateStudyTask = async (id, updates) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, updates);
  return res.data;
};

export const deleteStudyTask = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};

