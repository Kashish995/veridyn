import { useEffect, useState } from "react";
import api from "../api/api";
import '../styles/tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priority, setPriority] = useState("medium");

  

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");

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
      await api.post("/tasks", {
      title,
      dueDate,
      startTime,
      endTime,
      priority,
      estimatedTime: 30,
    });

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
    await api.patch(`/tasks/${id}`, { status: "completed" });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;

  return (
    <div className="tasks-page">
      <div className="tasks-container">
        
        {/* Header Stats */}
        <div className="tasks-header">
          <h1>📝 My Tasks</h1>
          <div className="tasks-stats-grid">
            <div className="task-stat-card">
              <div className="task-stat-value">{totalTasks}</div>
              <div className="task-stat-label">Total</div>
            </div>
            <div className="task-stat-card">
              <div className="task-stat-value">{completedTasks}</div>
              <div className="task-stat-label">Completed</div>
            </div>
            <div className="task-stat-card">
              <div className="task-stat-value">{pendingTasks}</div>
              <div className="task-stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="task-form-card">
          <h2 className="task-form-title">
            <span>✨</span>
            <span>Create New Task</span>
          </h2>

          <div className="task-input-grid">
            <div className="task-input-group">
              <label className="task-input-label">Task Title</label>
              <input
                className="task-input"
                placeholder="What will you study?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="task-input-row">
              <div className="task-input-group">
                <label className="task-input-label">Due Date</label>
                <input
                  className="task-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="task-input-group">
                <label className="task-input-label">Start Time</label>
                <input
                  className="task-input"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="task-input-group">
                <label className="task-input-label">End Time</label>
                <input
                  className="task-input"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="task-input-group">
                <label className="task-input-label">Priority</label>
                <select
                  className="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button className="task-add-btn" onClick={addTask}>
              ＋ Add Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="tasks-list-card">
          <h2 className="tasks-list-title">📋 All Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="task-empty-state">
              <div className="task-empty-state-icon">📭</div>
              <p className="task-empty-state-text">No tasks yet. Create your first task above!</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((t) => {
                const now = new Date();
                const taskDate = t.dueDate
                  ? new Date(t.dueDate).toISOString().split("T")[0]
                  : null;
                const taskEnd = taskDate && t.endTime
                  ? new Date(`${taskDate}T${t.endTime}`)
                  : null;
                const isMissed = t.status === "pending" && taskEnd && now > taskEnd;
                const displayStatus = isMissed ? "missed" : t.status;

                return (
                  <div key={t._id} className="task-item">
                    <div className="task-item-left">
                      <div className="task-item-header">
                        <div className="task-item-title">{t.title}</div>
                        <div className={`task-priority-badge task-priority-${t.priority}`}>
                          {t.priority}
                        </div>
                      </div>

                      <div className="task-item-time">
                        🕒 {t.startTime || "--:--"} – {t.endTime || "--:--"}
                      </div>

                      <div className={`task-item-status task-status-${displayStatus}`}>
                        {displayStatus === "completed" && "✓ COMPLETED"}
                        {displayStatus === "pending" && "⏳ PENDING"}
                        {displayStatus === "missed" && "❌ MISSED"}
                      </div>

                      {displayStatus === "missed" && (
                        <div className="task-missed-warning">
                          ⚠️ You broke your schedule. Discipline is greater than motivation.
                        </div>
                      )}
                    </div>

                    <div className="task-item-actions">
                      {t.status === "pending" && (
                        <button
                          className="task-action-btn task-done-btn"
                          onClick={() => markDone(t._id)}
                        >
                          ✔
                        </button>
                      )}

                      <button
                        className="task-action-btn task-delete-btn"
                        onClick={() => deleteTask(t._id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;