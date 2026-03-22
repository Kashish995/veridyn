import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Register from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./ui/ErrorBoundary";

import Navbar from "./components/Navbar";
import ProfileMenu from "./components/ProfileMenu";

import "./App.css";

function App() {
  const token = localStorage.getItem("token");
  
return (
  <Router>
    {token && <Navbar />}

    <ErrorBoundary>
      <div style={{ paddingTop: token ? '80px' : '0' }}>
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

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

          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </ErrorBoundary>

    {token && <ProfileMenu />}
  </Router>
);
}

export default App;