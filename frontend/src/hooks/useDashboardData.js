import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function useDashboardData() {
  const token = localStorage.getItem("token");

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

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchDashboard = async () => {
    const res = await axios.get(`${API}/goals/dashboard`, authHeader);
    setData(res.data?.success ? res.data.data : res.data);
  };

  const fetchWeeklyStats = async () => {
    const res = await axios.get(`${API}/stats/weekly`, authHeader);
    setWeeklyStats(res.data?.success ? res.data.data || [] : []);
  };

  const fetchNextTask = async () => {
    const res = await axios.get(`${API}/tasks/next`, authHeader);
    if (res.data?.success) setNextTask(res.data.data);
  };

  const fetchWeeklyPerformance = async () => {
    const res = await axios.get(`${API}/stats/weekly-performance`, authHeader);
    if (res.data?.success) setWeeklyPerformance(res.data.data);
  };

  const fetchInsights = async () => {
    const res = await axios.get(`${API}/stats/insights`, authHeader);
    if (res.data?.success) setInsights(res.data.data);
  };

  const fetchHistory = async () => {
    const res = await axios.get(`${API}/stats/history`, authHeader);
    setHistory(res.data?.success ? res.data.data || [] : []);
  };

  const fetchLongestStreak = async () => {
    const res = await axios.get(`${API}/stats/longest-streak`, authHeader);
    if (res.data?.success) setLongestStreak(res.data.data);
  };

  const fetchDisciplineHistory = async () => {
    const res = await axios.get(`${API}/stats/history`, authHeader);
    if (res.data?.success) setDisciplineHistory(res.data.data);
  };

  const fetchMonthlyAggregate = async () => {
    const res = await axios.get(`${API}/stats/monthly-aggregate`, authHeader);
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