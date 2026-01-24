import { useEffect, useState } from "react";
import axios from "axios";

const StudyPlanner = () => {
  const userId = localStorage.getItem("userId");

  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedTime, setEstimatedTime] = useState(60);

  // ✅ FETCH TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/tasks/user/${userId}/${selectedDate}`
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    if (userId) fetchTasks();
  }, [userId, selectedDate]);

  // ✅ CREATE TASK
  const handleAddTask = async () => {
    if (!title || !estimatedTime) return alert("Fill all fields");

    try {
      await axios.post("http://localhost:5000/tasks", {
        title,
        description,
        priority,
        estimatedTime,
        dueDate: selectedDate,
        userId
      });

      setTitle("");
      setDescription("");
      setEstimatedTime(60);

      const res = await axios.get(
        `http://localhost:5000/tasks/user/${userId}/${selectedDate}`
      );
      setTasks(res.data);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // ✅ UPDATE STATUS
  const toggleStatus = async (taskId, status) => {
    const newStatus = status === "completed" ? "pending" : "completed";

    await axios.patch(`http://localhost:5000/tasks/${taskId}`, {
      status: newStatus
    });

    const res = await axios.get(
      `http://localhost:5000/tasks/user/${userId}/${selectedDate}`
    );
    setTasks(res.data);
  };

  // ✅ DELETE TASK
  const deleteTask = async (taskId) => {
    await axios.delete(`http://localhost:5000/tasks/${taskId}`);

    const res = await axios.get(
      `http://localhost:5000/tasks/user/${userId}/${selectedDate}`
    );
    setTasks(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📚 Study Planner</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <hr />

      <div>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="number"
          placeholder="Time (minutes)"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
        />

        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <hr />

      <div>
        {tasks.length === 0 && <p>No tasks for this day.</p>}

        {Array.isArray(tasks) &&
          tasks.map((task) => (
            <div
              key={task._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              <h4>{task.title}</h4>
              <p>{task.description}</p>

              <p>Priority: {task.priority}</p>
              <p>Time: {task.estimatedTime} min</p>
              <p>Status: {task.status}</p>

              {task.suggestedForTomorrow && (
                <p style={{ color: "orange" }}>
                  ⚠ Suggested for tomorrow
                </p>
              )}

              {task.splitFrom && (
                <p style={{ color: "purple" }}>
                  📦 Split from heavy task
                </p>
              )}

              <button onClick={() => toggleStatus(task._id, task.status)}>
                Mark {task.status === "completed" ? "Pending" : "Completed"}
              </button>

              <button onClick={() => deleteTask(task._id)}>Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StudyPlanner;
