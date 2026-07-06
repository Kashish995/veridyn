// frontend/src/components/SyllabusUpload.jsx
import { useState } from "react";
import { uploadSyllabus } from "../services/syllabus.service.js";
import "../styles/SyllabusUpload.css";

function SyllabusUpload({ subjectId, subjectName, onTopicsGenerated }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | parsing | done | error
  const [error, setError] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a syllabus PDF first");
      return;
    }
    if (!timeAvailable.trim()) {
      setError("Let us know how much time you have (e.g. '10 days')");
      return;
    }

    setError("");
    try {
      setStatus("uploading");
      const syllabusText = await uploadSyllabus(file);

      setStatus("parsing");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/parse-syllabus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ syllabusText, subjectId, timeAvailable }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to parse syllabus");
      }

      const data = await res.json();
      setStatus("done");
      onTopicsGenerated?.(data.topics);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="syllabus-upload">
      <h3 className="syllabus-upload__title">
        Upload syllabus{subjectName ? ` — ${subjectName}` : ""}
      </h3>
      <p className="syllabus-upload__subtitle">
        We'll break it into topics and build you a study plan.
      </p>

      <label className="syllabus-upload__dropzone">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          hidden
        />
        {file ? (
          <span className="syllabus-upload__filename">📄 {file.name}</span>
        ) : (
          <span>Click to choose a PDF</span>
        )}
      </label>

      <input
        type="text"
        className="syllabus-upload__time-input"
        placeholder="Time available (e.g. 10 days, 3 hours/day)"
        value={timeAvailable}
        onChange={(e) => setTimeAvailable(e.target.value)}
      />

      {error && <p className="syllabus-upload__error">{error}</p>}

      <button
        className="syllabus-upload__submit"
        onClick={handleSubmit}
        disabled={status === "uploading" || status === "parsing"}
      >
        {status === "uploading" && "Uploading..."}
        {status === "parsing" && "Analyzing syllabus..."}
        {(status === "idle" || status === "error") && "Generate Study Plan"}
        {status === "done" && "✓ Plan Generated"}
      </button>
    </div>
  );
}

export default SyllabusUpload;