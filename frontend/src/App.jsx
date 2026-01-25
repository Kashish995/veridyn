import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudyPlanner from "./pages/StudyPlanner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/planner" element={<StudyPlanner />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
