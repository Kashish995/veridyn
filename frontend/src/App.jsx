import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Insights from "./pages/Insights";

import Login from "./pages/Login";
import Register from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const token = localStorage.getItem("token"); // ✅ REQUIRED
   console.log("TOKEN:", token);

  return (
    <Router>
      <nav style={styles.navbar}>
  <h2 style={styles.logo}>📚 StudyTracker</h2>

  {!token && (
    <div>
      <Link style={styles.link} to="/login">Login</Link>
      <Link style={styles.link} to="/register">Register</Link>
    </div>
  )}

  {token && (
    <div>
      <Link style={styles.link} to="/dashboard">Dashboard</Link>
      <Link style={styles.link} to="/tasks">Tasks</Link>
      <Link style={styles.link} to="/insights">Insights</Link>
    </div>
  )}
</nav>



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
    </Router>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    background: "#4f46e5",
    color: "white",
  },
  logo: {
    margin: 0,
    fontSize: "20px",
  },
  link: {
    marginLeft: "15px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
};


export default App;
