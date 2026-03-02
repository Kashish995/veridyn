import { Link } from "react-router-dom";
import "../styles/navbar.css";
import logo from "../assets/vlogo.png";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Veridyn Logo" className="navbar-logo" />
        <span className="navbar-title">Veridyn</span>
      </div>

      <div className="navbar-right">
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to="/tasks">📝 Tasks</Link>
        <Link to="/insights">📈 Insights</Link>
      </div>
    </nav>
  );
}