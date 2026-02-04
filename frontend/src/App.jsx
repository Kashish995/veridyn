import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Register from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";

import logo from "./assets/vlogo.png.png"; // ✅ MUST be at top
import "./App.css";

function App() {
  const token = localStorage.getItem("token");
  const [showProfile, setShowProfile] = useState(false);

  return (
    <Router>
      {/* NAVBAR (only when logged in) */}
      {token && (
        <nav style={styles.navbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={logo}
              alt="Veridyn Logo"
              style={{
                width: "42px",
                height: "42px",
                filter: "drop-shadow(0 0 4px rgba(0,0,0,0.4))"
              }}
            />

            <span style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "1px" }}>
              Veridyn
            </span>
          </div>

          <div>
            <Link to="/dashboard" style={styles.link}>📊 Dashboard</Link>
            <Link to="/tasks" style={styles.link}>📝 Tasks</Link>
            <Link to="/insights" style={styles.link}>📈 Insights</Link>
          </div>
        </nav>
      )}

      {/* ROUTES */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Login />} />
      </Routes>

      {/* PROFILE FLOAT BUTTON */}
      {token && (
        <div style={profileStyles.container}>
          <div
            style={profileStyles.circle}
            onClick={() => setShowProfile(!showProfile)}
          >
            👤
          </div>

          {showProfile && (
            <div style={profileStyles.menu}>
              <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>My Profile</p>
              <button
                style={profileStyles.logoutBtn}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
              <button style={styles.endDayBtn}>End Day</button>
                <button style={styles.taskBtn}>Go to Tasks</button>
                <button style={styles.logoutBtn}>Logout</button>

            </div>
          )}
        </div>
      )}
    </Router>
  );
}

const styles = {
  navbar: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  background: "linear-gradient(90deg, #6366f1, #818cf8)",
  color: "white",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
},
  link: {
    marginLeft: "20px",
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
  },
  endDayBtn: {
  background: "linear-gradient(90deg, #22c55e, #4ade80)",
  color: "white",
},

taskBtn: {
  background: "linear-gradient(90deg, #3b82f6, #6366f1)",
  color: "white",
},

logoutBtn: {
  background: "linear-gradient(90deg, #ef4444, #f97316)",
  color: "white",
},
};

const profileStyles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
  },
  circle: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  menu: {
    position: "absolute",
    bottom: "60px",
    right: "0",
    background: "white",
    padding: "12px",
    borderRadius: "10px",
    width: "150px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
  },
  logoutBtn: {
    width: "100%",
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default App;