import { useEffect, useState } from "react";
import axios from "axios";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
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

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

 return (
  <div style={styles.page}>
    <div style={styles.card}>
      <h2 style={styles.heading}>📝 Today’s Tasks</h2>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="What will you study?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          style={styles.input}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button style={styles.addButton} onClick={addTask}>
          ➕ Add
        </button>
      </div>

      <ul style={styles.list}>
        {tasks.map((t) => (
          <li
            key={t._id}
            style={{
              ...styles.taskItem,
              background:
                t.status === "completed" ? "#dcfce7" : "#f3f4f6",
            }}
          >
            <span style={{ fontWeight: "bold" }}>
              {t.status === "completed" ? "✅" : "📌"} {t.title}
            </span>

            <div>
              {t.status !== "completed" && (
                <button
                  style={styles.doneButton}
                  onClick={() => markDone(t._id)}
                >
                  ✔
                </button>
              )}

              <button
                style={styles.deleteButton}
                onClick={() => deleteTask(t._id)}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    paddingTop: "40px",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    width: "440px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
  },
  heading: {
    color: "#4f46e5",
    marginBottom: "15px",
    textAlign: "center",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },
  addButton: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "8px",
  },
  doneButton: {
    marginRight: "6px",
    background: "#22c55e",
    border: "none",
    borderRadius: "8px",
    padding: "4px 8px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "#ef4444",
    border: "none",
    borderRadius: "8px",
    padding: "4px 8px",
    cursor: "pointer",
    color: "white",
  },
};

export default Tasks;
