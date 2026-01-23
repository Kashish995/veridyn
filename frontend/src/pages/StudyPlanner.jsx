import { useEffect, useState } from "react";
import {
  getStudyTasksByUser,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
} from "../api/studyTaskApi";
import StudyTaskCard from "../components/StudyTaskCard";

const USER_ID = "test-user-123";

const EFFORT_POINTS = {
  SMALL: 1,
  MEDIUM: 2,
  HEAVY: 3,
};

const [priority, setPriority] = useState("MEDIUM");
const [deadline, setDeadline] = useState("");


const StudyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [effort, setEffort] = useState("SMALL");

  /* ---------------- FETCH TASKS ---------------- */

  const fetchTasks = async () => {
    try {
      const data = await getStudyTasksByUser(USER_ID);
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ---------------- CREATE TASK ---------------- */

  const handleAddTask = async () => {
    if (!title.trim()) return;

    try {
      await createStudyTask({
        title,
        priority,
        effort,
        deadline: deadline || null,
        userId: USER_ID,
      });

      setTitle("");
      setPriority("MEDIUM");
      setEffort("SMALL");
      setDeadline("");

      await fetchTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  /* ---------------- UPDATE TASK ---------------- */

  const handleToggleComplete = async (id, isCompleted) => {
    try {
     await createStudyTask({
        userId,
        title,
        priority,
        deadline: deadline || null,
      });

      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  /* ---------------- DELETE TASK ---------------- */

  const handleDelete = async (id) => {
    try {
      await deleteStudyTask(id);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  /* ---------------- PHASE 3: EFFORT-AWARE LOAD ---------------- */

  const getTodayEffortLoad = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.reduce((total, task) => {
      if (task.isCompleted) return total;
      if (!task.deadline) return total;

      const taskDate = new Date(task.deadline);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate <= today) {
        const effortValue =
          EFFORT_POINTS[task.effort] || EFFORT_POINTS.SMALL;
        return total + effortValue;
      }

      return total;
    }, 0);
  };

  const todayEffortLoad = getTodayEffortLoad();
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: "20px" }}>
      <h2>Study Planner</h2>

      <p>
        Completed: {completedCount} / {tasks.length}
      </p>

      {/* -------- Phase 3 Load Awareness -------- */}
      {todayEffortLoad >= 8 && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ⚠ Today’s workload is too heavy ({todayEffortLoad} effort points).
          Consider postponing something.
        </p>
      )}

      {todayEffortLoad >= 5 && todayEffortLoad < 8 && (
        <p style={{ color: "orange" }}>
          ⚠ Moderate workload today ({todayEffortLoad} effort points).
        </p>
      )}

      {/* -------- Add Task -------- */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Enter study task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={effort}
          onChange={(e) => setEffort(e.target.value)}
        >
          <option value="SMALL">Small effort</option>
          <option value="MEDIUM">Medium effort</option>
          <option value="HEAVY">Heavy effort</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />


        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button onClick={handleAddTask}>Add Task</button>
      </div>

      {/* -------- Task List -------- */}
      {tasks.map((task) => (
        <StudyTaskCard
          key={task._id}
          task={task}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default StudyPlanner;
