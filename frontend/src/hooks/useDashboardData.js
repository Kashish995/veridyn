import { useState, useEffect } from "react";
import api from "../api/api";

export default function useDashboardData() {
  const [data, setData] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [weeklyPerformance, setWeeklyPerformance] = useState(null);
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [longestStreak, setLongestStreak] = useState(null);
  const [disciplineHistory, setDisciplineHistory] = useState([]);
  const [monthlyAggregate, setMonthlyAggregate] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const res = await api.get("/goals/dashboard");
    setData(res.data?.success ? res.data.data : res.data);
  };

  const fetchWeeklyStats = async () => {
    const res = await api.get("/stats/weekly");
    setWeeklyStats(res.data?.success ? res.data.data || [] : []);
  };

  const fetchNextTask = async () => {
    const res = await api.get("/tasks/next");
    if (res.data?.success) setNextTask(res.data.data);
  };

  const fetchWeeklyPerformance = async () => {
    const res = await api.get("/stats/weekly-performance");
    if (res.data?.success) setWeeklyPerformance(res.data.data);
  };

  const fetchInsights = async () => {
    const res = await api.get("/stats/insights");
    if (res.data?.success) setInsights(res.data.data);
  };

  const fetchHistory = async () => {
    const res = await api.get("/stats/history");
    setHistory(res.data?.success ? res.data.data || [] : []);
  };

  const fetchLongestStreak = async () => {
    const res = await api.get("/stats/longest-streak");
    if (res.data?.success) setLongestStreak(res.data.data);
  };

  const fetchDisciplineHistory = async () => {
    const res = await api.get("/stats/history");
    if (res.data?.success) setDisciplineHistory(res.data.data);
  };

  const fetchMonthlyAggregate = async () => {
    const res = await api.get("/stats/monthly-aggregate");
    if (res.data?.success) setMonthlyAggregate(res.data.data);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchDashboard(),
        fetchWeeklyStats(),
        fetchNextTask(),
        fetchWeeklyPerformance(),
        fetchInsights(),
        fetchHistory(),
        fetchLongestStreak(),
        fetchDisciplineHistory(),
        fetchMonthlyAggregate(),
      ]);
    } catch (error) {
      console.error("Dashboard loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshDashboard = () => {
    fetchAllData();
  };

  return {
    data,
    weeklyStats,
    nextTask,
    weeklyPerformance,
    insights,
    history,
    longestStreak,
    disciplineHistory,
    monthlyAggregate,
    loading,
    refreshDashboard,
  };
}