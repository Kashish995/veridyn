import { useEffect, useState } from "react";
import {
  getTasksByUser,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../api/taskApi";
import "../styles/taskManager.css";

const USER_ID = "6963fd04456b9d41a7336a6a"; // temp hardcoded user

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

 useEffect(() => {
  loadStudyTasks();
}, []);

const loadStudyTasks = async () => {
  try {
    const data = await getStudyTasksByUser(USER_ID);
    setTasks(data);
  } catch (err) {
    console.error(err.message);
  }
};


  const handleAddTask = async () => {
    if (!title.trim()) return;

    await createTask({
      title,
      userId: USER_ID,
    });

    setTitle("");
    loadTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";

    await updateTaskStatus(task._id, {
      status: newStatus,
    });

    loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  return (
    <div className="task-page">
      <div className="task-container">
        <h1 className="task-title">My Tasks</h1>

        <div className="task-input-row">
          <input
            type="text"
            placeholder="Enter task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={handleAddTask}>Add</button>
        </div>

        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`task-card ${
                task.status === "completed" ? "completed" : ""
              }`}
            >
              <div className="task-info">
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
              </div>

              <div className="task-actions">
                <span
                  className={`status-badge ${task.status}`}
                  onClick={() => toggleStatus(task)}
                  title="Click to toggle status"
                >
                  {task.status.toUpperCase()}
                </span>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(task._id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="empty-text">No tasks yet. Add one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskManager;
