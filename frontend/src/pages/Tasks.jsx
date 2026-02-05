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
      <h2 style={styles.title}>📝 Today’s Tasks</h2>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="What will you study?"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          style={styles.input}
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />

        <button style={styles.addBtn} onClick={addTask}>＋ Add</button>
      </div>

      <div style={styles.list}>
        {tasks.map(t => (
          <div key={t._id} style={styles.taskItem}>
            <span>
              {t.title} — <b>{t.status}</b>
            </span>

            <div>
              {t.status !== "completed" && (
                <button
                  style={styles.doneBtn}
                  onClick={() => markDone(t._id)}
                >
                  ✔
                </button>
              )}

              <button
                style={styles.deleteBtn}
                onClick={() => deleteTask(t._id)}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default Tasks;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #eef2ff, #f8fafc)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
  },
  card: {
    width: "420px",
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  addBtn: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  taskItem: {
    background: "#f1f5f9",
    padding: "10px",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doneBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    marginRight: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  
};



