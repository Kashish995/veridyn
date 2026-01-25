import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";


const StudyPlanner = () => {
  // 🔴 TEMP FIX: use real MongoDB userId
  const userId = "696a051e43eec933581d318b";

  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedTime, setEstimatedTime] = useState(60);

  const BASE_URL = "http://localhost:5000/api/tasks";

  // ✅ calendar change handler
  const handleCalendarChange = (date) => {
    setCalendarDate(date);
    setSelectedDate(date.toISOString().split("T")[0]);
  };


  // ✅ FETCH TASKS BY DATE

  useEffect(() => {
  setCalendarDate(new Date(selectedDate));
}, [selectedDate]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/user/${userId}/${selectedDate}`
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Fetch tasks error:", err);
      }
    };

    fetchTasks();
  }, [userId, selectedDate]);

  // ✅ CREATE TASK
  const handleAddTask = async () => {
    if (!title || !estimatedTime) return alert("Fill all fields");

    try {
      await axios.post(BASE_URL, {
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
        `${BASE_URL}/user/${userId}/${selectedDate}`
      );
      setTasks(res.data);
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  // ✅ UPDATE STATUS
  const toggleStatus = async (taskId, status) => {
    const newStatus = status === "completed" ? "pending" : "completed";

    await axios.patch(`${BASE_URL}/${taskId}`, { status: newStatus });

    const res = await axios.get(
      `${BASE_URL}/user/${userId}/${selectedDate}`
    );
    setTasks(res.data);
  };

  // ✅ DELETE TASK
  const deleteTask = async (taskId) => {
    await axios.delete(`${BASE_URL}/${taskId}`);

    const res = await axios.get(
      `${BASE_URL}/user/${userId}/${selectedDate}`
    );
    setTasks(res.data);
  };

  // 🧮 Total workload
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // 🔁 Apply system suggestions
  const applySuggestions = async () => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const suggestedTasks = tasks.filter(t => t.suggestedForTomorrow);

    if (suggestedTasks.length === 0) {
      return alert("No suggestions to apply.");
    }

    for (let task of suggestedTasks) {
      await axios.patch(`${BASE_URL}/${task._id}`, {
        dueDate: tomorrowStr,
        suggestedForTomorrow: false
      });
    }

    const res = await axios.get(
      `${BASE_URL}/user/${userId}/${selectedDate}`
    );
    setTasks(res.data);
  };

  // 📊 weekly workload
  const buildWeeklyData = () => {
    const map = {};

    tasks.forEach(t => {
      const day = new Date(t.dueDate).toISOString().split("T")[0];
      map[day] = (map[day] || 0) + (t.estimatedTime || 0);
    });

    return Object.keys(map).map(date => ({
      date,
      minutes: map[date]
    }));
  };

  const weeklyData = buildWeeklyData();

  // 🔀 Drag reorder (frontend only)
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    setTasks(items);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
  <Calendar
    onChange={handleCalendarChange}
    value={calendarDate}
  />


      <p>Selected Date: {selectedDate}</p>

      {/* 📊 Daily workload */}
      <div style={{
        background: "#222",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "10px",
        color: "#00ffcc"
      }}>
        ⏱ Total workload: {hours}h {minutes}m
      </div>

      {/* ⚠ Heavy day banner */}
      {tasks.some(t => t.suggestedForTomorrow) && (
        <div style={{
          background: "#332600",
          color: "#ffcc00",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "10px"
        }}>
          ⚠ Heavy day detected. Some low-priority tasks were suggested for tomorrow.
          <br />
          <button onClick={applySuggestions} style={{ marginTop: "8px" }}>
            Apply Suggestions
          </button>
        </div>
      )}

      <hr />

      {/* ADD TASK */}
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

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
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

      {/* 📊 Weekly chart */}
      {weeklyData.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>📊 Weekly Workload</h3>
          <LineChart width={600} height={250} data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="minutes" stroke="#00ffcc" />
          </LineChart>
        </div>
      )}

      {/* TASK LIST */}
      <div>
        {tasks.length === 0 && <p>No tasks for this day.</p>}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="taskList">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          border: task.splitFrom ? "2px dashed #aa66ff" : "1px solid #444",
                          padding: "12px",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          background: "#1e1e1e",
                          ...provided.draggableProps.style
                        }}
                      >
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                        <p>⏱ {task.estimatedTime} min</p>
                        <p>Status: {task.status}</p>

                        <button onClick={() => toggleStatus(task._id, task.status)}>
                          Mark {task.status === "completed" ? "Pending" : "Completed"}
                        </button>

                        <button onClick={() => deleteTask(task._id)}>Delete</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default StudyPlanner;
