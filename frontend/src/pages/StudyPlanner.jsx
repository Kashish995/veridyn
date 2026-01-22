import { useEffect, useState } from "react";
import {
  getStudyTasksByUser,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
} from "../api/studyTaskApi";
import StudyTaskCard from "../components/StudyTaskCard";

const USER_ID = "test-user-123"; // temporary, intentional

const StudyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const data = await getStudyTasksByUser(USER_ID);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task
  const handleAddTask = async () => {
    if (!title.trim()) return;

    try {
      await createStudyTask({
        title,
        priority,
        deadline: deadline || null,
        userId: USER_ID,
      });

      setTitle("");
      setPriority("MEDIUM");
      setDeadline("");
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Toggle completion
  const handleToggleComplete = async (id, isCompleted) => {
    try {
      await updateStudyTask(id, { isCompleted: !isCompleted });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      await deleteStudyTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const completedCount = tasks.filter((task) => task.isCompleted).length;

  return (
    <div>
      <h2>Study Planner</h2>

      <p>
        Completed: {completedCount} / {tasks.length}
      </p>

      {/* Add Task */}
      <div>
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

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button onClick={handleAddTask}>Add Task</button>
      </div>

      {/* Task List */}
      <div>
        {tasks.map((task) => (
          <StudyTaskCard
            key={task._id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyPlanner;
