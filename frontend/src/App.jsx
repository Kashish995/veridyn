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
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        {!token && (
          <>
            <Link to="/login">Login</Link>{" "}
            <Link to="/register">Register</Link>
          </>
        )}

        {token && (
          <>
            <Link to="/dashboard" style={{ marginRight: "10px" }}>
              Dashboard
            </Link>
            <Link to="/tasks" style={{ marginRight: "10px" }}>
              Tasks
            </Link>
            <Link to="/insights">Insights</Link>
          </>
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

export default App;
