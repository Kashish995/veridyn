import { useEffect, useState } from "react";
import axios from "axios";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priority, setPriority] = useState("medium");

  const token = localStorage.getItem("token");

  const fetchTasks = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/tasks",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.data.success) {
      setTasks(res.data.data || []);
    } else {
      setTasks([]);
    }

  } catch (error) {
    console.error("Fetch tasks error:", error);
    setTasks([]);
  }
};


  const addTask = async () => {
    if (!title || !dueDate || !startTime || !endTime) {
      return alert("Fill all fields");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/tasks",
       {
          title,
          dueDate,
          startTime,
          endTime,
          priority,
          estimatedTime: 30,
        },

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTitle("");
      setDueDate("");
      setStartTime("");
      setEndTime("");
      setPriority("medium");

      fetchTasks();
    } catch (err) {
      console.error("ADD TASK ERROR:", err.response?.data || err.message);
      alert("Failed to add task");
    }
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

        {/* INPUT ROW 1 */}
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
        </div>

        {/* INPUT ROW 2 */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            style={styles.input}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <select
            style={styles.input}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button style={styles.addBtn} onClick={addTask}>
            ＋ Add
          </button>
        </div>

        {/* TASK LIST */}
        <div style={styles.list}>
          {tasks.map((t) => {
            const now = new Date();
            const today = now.toISOString().split("T")[0];

            const taskDate = t.dueDate
              ? new Date(t.dueDate).toISOString().split("T")[0]
              : null;

            const taskEnd =
              taskDate && endTime
                ? new Date(`${taskDate}T${endTime}`)
                : null;

            const isMissed =
              t.status === "pending" &&
              taskEnd &&
              now > taskEnd;

            const displayStatus = isMissed ? "missed" : t.status;

            return (
              <div key={t._id} style={styles.taskItem}>
                <div style={styles.taskLeft}>
                  <div style={styles.taskTitle}>{t.title}</div>

                  <div style={styles.timeRow}>
                    🕒 {startTime || "--:--"} – {endTime || "--:--"}
                  </div>

                  <div
                    style={{
                      ...styles.status,
                      color:
                        displayStatus === "completed"
                          ? "#16a34a"
                          : displayStatus === "missed"
                          ? "#ef4444"
                          : "#f59e0b",
                    }}
                  >
                    {displayStatus.toUpperCase()}
                  </div>

                  {displayStatus === "missed" && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      ⚠ You broke your schedule. Discipline is greater than motivation.
                    </div>
                  )}
                </div>

                <div style={styles.actionButtons}>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  taskTitle: {
    fontWeight: "600",
    fontSize: "14px",
  },
  timeRow: {
    fontSize: "12px",
    color: "#6b7280",
  },
  status: {
    fontSize: "12px",
    fontWeight: "600",
  },
  actionButtons: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  doneBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
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
