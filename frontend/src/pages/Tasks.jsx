import { useEffect, useState } from "react";
import axios from "axios";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!title || !dueDate) return alert("Enter title and date");

    await axios.post(
      "http://localhost:5000/api/tasks",
      { title, dueDate, priority: "medium", estimatedTime: 30 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTitle("");
    setDueDate("");
    fetchTasks();
  };

  const markDone = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/tasks/${id}`,
      { status: "completed" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  // 🗑 DELETE TASK
  const deleteTask = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/tasks/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Tasks</h2>

      <div style={styles.form}>
        <input
          style={styles.input}
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          style={styles.input}
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />

        <button onClick={addTask} style={styles.addBtn}>
          Add Task
        </button>
      </div>

      <ul style={styles.list}>
        {tasks.map(t => (
          <li key={t._id} style={styles.listItem}>
            <span>
              {t.title} — <b>{t.status}</b>
            </span>

            <div>
              {t.status !== "completed" && (
                <button onClick={() => markDone(t._id)} style={styles.doneBtn}>
                  ✔
                </button>
              )}

              <button
                onClick={() => deleteTask(t._id)}
                style={{ marginLeft: "6px" }}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "auto"
  },
  title: {
    textAlign: "center",
    marginBottom: "15px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "15px"
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  addBtn: {
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    background: "#4caf50",
    color: "white",
    cursor: "pointer"
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    marginBottom: "6px",
    borderRadius: "6px",
    background: "#f4f4f4"
  },
  doneBtn: {
    border: "none",
    background: "#2196f3",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
    padding: "4px 8px"
  }
};

export default Tasks;
