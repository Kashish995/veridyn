import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Register from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./ui/ErrorBoundary";
import Navbar from "./components/Navbar";
import StreakCelebration from "./components/StreakCelebration";

const AUTH_PATHS = ["/login", "/signup"];

function AppShell() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const showSidebar = !!token && !isAuthPage;

  // detect mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080c14" }}>
      {showSidebar && <Navbar />}
      <main style={{
        flex: 1,
        marginLeft: showSidebar && !isMobile ? "240px" : 0,
        minHeight: "100vh",
        background: "#080c14",
        overflow: "auto",
        // extra bottom padding on mobile so content isn't hidden behind bottom tab bar
        paddingBottom: showSidebar && isMobile ? "70px" : 0,
      }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/"          element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/signup"    element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/insights"  element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="*"          element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <StreakCelebration />
      <AppShell />
    </Router>
  );
}
