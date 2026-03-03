import { useEffect, useState } from "react";
import { getCalendarData } from "../api/analyticsApi";

const useCalendarData = (year) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getCalendarData(year);
        setData(result);
      } catch (err) {
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return { data, loading, error };
};

export default useCalendarData;