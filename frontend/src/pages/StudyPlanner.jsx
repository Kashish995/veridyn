// frontend/src/components/StudyPlanner.jsx
import { useEffect, useState } from "react";
import {
  getStudyTasksByUser,
  createStudyTask,
  updateStudyTaskStatus,
  deleteStudyTask,
} from "../api/studyTaskApi";
import StudyTaskCard from "../components/StudyTaskCard";

const USER_ID = "6963fd04456b9d41a7336a6a"; // temp, same as TaskManager

export default function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const data = await getStudyTasksByUser(USER_ID);
    setTasks(data);
  }

  async function handleAddTask() {
    if (!title.trim()) return;
    await createStudyTask(USER_ID, title);
    setTitle("");
    loadTasks();
  }

  async function handleComplete(taskId) {
    await updateStudyTaskStatus(taskId, "completed");
    loadTasks();
  }

  async function handleDelete(taskId) {
    await deleteStudyTask(taskId);
    loadTasks();
  }

  // 🔥 PHASE 2 CORE LOGIC (THIS IS STEP 2)
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = total - completed;

  return (
    <div className="study-planner">
      <h2>Study Planner</h2>

      <div className="progress">
        Completed: {completed} / {total}
      </div>

      <div className="add-task">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add study task..."
        />
        <button onClick={handleAddTask}>Add</button>
      </div>

      {tasks.length === 0 && <p>No study tasks yet.</p>}

      {tasks.map(task => (
        <StudyTaskCard
          key={task._id}
          task={task}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
