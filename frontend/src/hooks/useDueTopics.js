// frontend/src/hooks/useDueTopics.js
import { useState, useEffect } from "react";

export function useDueTopics() {
  const [dueToday, setDueToday] = useState([]);
  const [atRisk, setAtRisk] = useState([]);

  useEffect(() => {
    async function fetchDue() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/due`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setDueToday(data.dueToday || []);
        setAtRisk(data.atRisk || []);
      } catch (err) {
        console.error("Failed to fetch due topics:", err);
      }
    }
    fetchDue();
  }, []);

  return { dueToday, atRisk };
}