// frontend/src/api/studyTaskApi.js
const BASE_URL = "http://localhost:5000/api/study-tasks";

export async function getStudyTasksByUser(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch study tasks");
  return res.json();
}

export async function createStudyTask(userId, title) {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, title }),
  });
  return res.json();
}

export async function updateStudyTaskStatus(taskId, status) {
  const res = await fetch(`${BASE_URL}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteStudyTask(taskId) {
  await fetch(`${BASE_URL}/${taskId}`, { method: "DELETE" });
}
