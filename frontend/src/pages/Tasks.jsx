import { useEffect, useState } from "react";
import {
  getTasksByUser,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../api/taskApi";

const USER_ID = "6963fd04456b9d41a7336a6a"; // your MongoDB user ID

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const loadTasks = async () => {
    const data = await getTasksByUser(USER_ID);
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async () => {
    if (!title.trim()) return;

    await createTask({
      title,
      description: "Created from frontend",
      status: "pending",
      userId: USER_ID,
    });

    setTitle("");
    loadTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    await updateTaskStatus(task._id, newStatus);
    loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tasks</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task title"
      />
      <button onClick={handleAddTask}>Add</button>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <b>{task.title}</b> — {task.status}
            <button onClick={() => toggleStatus(task)}>Toggle</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
