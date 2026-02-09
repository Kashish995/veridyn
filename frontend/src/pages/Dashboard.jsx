import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchDashboard = async () => {
    const res = await axios.get("http://localhost:5000/api/goals/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setData(res.data);
  };

  const endDay = async () => {
  await axios.post(
    "http://localhost:5000/api/tasks/end-day",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  fetchDashboard(); // already exists
};


  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <p style={{ textAlign: "center" }}>Loading...</p>;

  // ✅ DERIVED VALUES (THIS WAS MISSING)
  const completedTasks = data.completedTasks ?? 0;
  const totalTasks = data.totalTasks ?? 0;
  const goal = data.goal ?? 0;

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
  <div className="dashboard-wrapper">
    <div className="dashboard-card">
      {totalTasks === 0 ? (
        <>
          <h2 className="dashboard-title">🌱 New Day, New Start</h2>

          <p className="progress-text">
            You haven’t added any tasks yet.
            <br />
            Start by adding what you want to focus on today.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/tasks")}
          >
            Add Your First Task
          </button>

          <button className="danger-btn" onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <h2 className="dashboard-title">👋 Welcome back</h2>

          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-label">Tasks</div>
              <div className="stat-value">
                {completedTasks} / {totalTasks}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Goal</div>
              <div className="stat-value">{goal}</div>
            </div>
          </div>

          <div className="progress-label">Progress</div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="progress-text">{progress}% completed</div>

          <button className="primary-btn" onClick={endDay}>
            End Day
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/tasks")}
          >
            Go to Tasks
          </button>

          <button className="danger-btn" onClick={logout}>
            Logout
          </button>
        </>
      )}
    </div>
  </div>
);
};

export default Dashboard;
