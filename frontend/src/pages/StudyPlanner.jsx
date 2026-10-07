import { useEffect, useState } from "react";
import api from "../api/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

const getToday = () => new Date().toISOString().split("T")[0];

const StudyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedTime, setEstimatedTime] = useState(60);

  // AI Plan states
  const [subjectName, setSubjectName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [dailyHours, setDailyHours] = useState(2);
  const [syllabusText, setSyllabusText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ calendar change handler
  const handleCalendarChange = (date) => {
    setCalendarDate(date);
    setSelectedDate(date.toISOString().split("T")[0]);
  };


  useEffect(() => {
    setCalendarDate(new Date(selectedDate));
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/${selectedDate}`);
      // Tasks are nested in res.data.data according to standard response wrapper
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  // ✅ CREATE TASK
  const handleAddTask = async () => {
    if (!title || !estimatedTime) return alert("Fill all fields");

    try {
      await api.post("/tasks", {
        title,
        description,
        priority,
        estimatedTime,
        dueDate: selectedDate,
        startTime: "09:00", // Required fields from Task model
        endTime: "10:00"
      });

      setTitle("");
      setDescription("");
      setEstimatedTime(60);
      fetchTasks();
    } catch (err) {
      console.error("Create task error:", err);
      alert("Failed to create task");
    }
  };

  // ✅ GENERATE STUDY PLAN (AI)
  const handleGeneratePlan = async () => {
    if (!subjectName || !targetDate || !syllabusText) {
      return alert("Please fill Subject Name, Target Date, and Syllabus");
    }
    setIsGenerating(true);
    try {
      await api.post("/ai/generate-study-plan", {
        subjectName,
        targetDate,
        dailyStudyHours: dailyHours,
        syllabusText
      });
      alert("Study plan generated successfully!");
      fetchTasks();
    } catch (err) {
      console.error("Generate plan error:", err);
      alert("Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ UPDATE STATUS
  const toggleStatus = async (taskId, status) => {
    const newStatus = status === "completed" ? "pending" : "completed";
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Update task error", err);
    }
  };

  // ✅ DELETE TASK
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("Delete task error", err);
    }
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
      await api.patch(`/tasks/${task._id}`, {
        dueDate: tomorrowStr,
        suggestedForTomorrow: false
      });
    }

    fetchTasks();
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
    <div style={{ marginBottom: "20px", padding: "20px", color: "white" }}>
      <div style={{ background: "#1a1a2e", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h2>🤖 AI Syllabus Planner</h2>
        <p>Paste your syllabus and let AI schedule your study sessions until the target date.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
          <input
            type="text"
            placeholder="Subject Name (e.g., Data Structures)"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            style={{ padding: "10px", borderRadius: "4px" }}
          />
          
          <input
            type="date"
            placeholder="Target Completion Date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ padding: "10px", borderRadius: "4px" }}
          />
          
          <input
            type="number"
            placeholder="Daily Study Hours (e.g., 2)"
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            style={{ padding: "10px", borderRadius: "4px" }}
          />
          
          <textarea
            placeholder="Paste syllabus topics here..."
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            rows={5}
            style={{ padding: "10px", borderRadius: "4px" }}
          />
          
          <button 
            onClick={handleGeneratePlan} 
            disabled={isGenerating}
            style={{ padding: "10px 20px", background: "#00ffcc", color: "black", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {isGenerating ? "Generating Plan..." : "Generate AI Study Plan"}
          </button>
        </div>
      </div>

      <hr style={{ borderColor: "#333", margin: "30px 0" }} />

      <h3>📅 Study Calendar</h3>
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
