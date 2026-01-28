import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Insights from "./pages/Insights";

// import your existing pages
import Login from "./pages/Login";
import Register from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
       <Link to="/login">Login</Link>
       <Link to="/dashboard" style={{ marginRight: "10px" }}>
          Dashboard
        </Link>

        <Link to="/insights">Insights</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="*" element={<Login />} />
      </Routes>

    </Router>
  );
}

export default App;

