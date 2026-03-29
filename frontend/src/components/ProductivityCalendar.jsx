import { useState, useEffect } from 'react';
import '../styles/calendar.css';

const ProductivityCalendar = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/stats/calendar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCalendarData(data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorIntensity = (completionRate) => {
    if (completionRate === 0) return 'level-0';
    if (completionRate < 25) return 'level-1';
    if (completionRate < 50) return 'level-2';
    if (completionRate < 75) return 'level-3';
    return 'level-4';
  };

  const generateCalendarGrid = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // Last 365 days

    const weeks = [];
    let currentWeek = [];

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayData = calendarData.find(d => d.date === dateStr);
      
      currentWeek.push({
        date: dateStr,
        completionRate: dayData?.completionRate || 0,
        tasksCompleted: dayData?.tasksCompleted || 0,
        totalTasks: dayData?.totalTasks || 0
      });

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = generateCalendarGrid();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  return (
    <div className="productivity-calendar">
      <h3>Productivity Calendar</h3>
      <div className="calendar-months">
        {months.map((month, idx) => (
          <div key={idx} className="month-label">{month}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="calendar-week">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`calendar-day ${getColorIntensity(day.completionRate)}`}
                title={`${day.date}: ${day.tasksCompleted}/${day.totalTasks} tasks (${day.completionRate}%)`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <span>Less</span>
        <div className="legend-box level-0"></div>
        <div className="legend-box level-1"></div>
        <div className="legend-box level-2"></div>
        <div className="legend-box level-3"></div>
        <div className="legend-box level-4"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ProductivityCalendar;