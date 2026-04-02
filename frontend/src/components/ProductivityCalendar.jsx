import { useState, useEffect } from 'react';
import '../styles/calendar.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['S','M','T','W','T','F','S'];

const getLevel = (rate) => {
  if (!rate || rate === 0) return 0;
  if (rate < 25) return 1;
  if (rate < 50) return 2;
  if (rate < 75) return 3;
  return 4;
};

export default function ProductivityCalendar() {
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tooltip, setTooltip]           = useState(null);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api','');
    const year    = new Date().getFullYear();

    fetch(`${baseURL}/api/stats/calendar?year=${year}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.calendar) setCalendarData(d.calendar); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Build a map: dateStr → completionRate */
  const dataMap = {};
  calendarData.forEach(d => { dataMap[d.date] = d.score ?? d.completionRate ?? 0; });

  /* Build 52-week grid starting from 52 weeks ago (Sunday-aligned) */
  const today     = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  // Roll back to nearest Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks  = [];
  const cursor = new Date(startDate);

  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const iso  = cursor.toISOString().split('T')[0];
      const rate = dataMap[iso] ?? 0;
      week.push({ date: iso, rate, future: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  /* Month label positions */
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (d.getDate() <= 7) {
        monthLabels.push({ month: MONTHS[d.getMonth()], col: wi });
      }
    }
  });

  if (loading) {
    return (
      <div className="cal-wrap">
        <div className="cal-loading">
          <div className="cal-loading-grid">
            {Array.from({ length: 52 }).map((_, i) => (
              <div key={i} className="cal-loading-week">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="cal-cell cal-skeleton" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cal-wrap">
      {/* Month labels */}
      <div className="cal-month-row">
        <div className="cal-day-col" /> {/* spacer for day labels */}
        <div className="cal-months-inner">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="cal-month-label"
              style={{ left: `${m.col * 16}px` }}
            >
              {m.month}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="cal-body">
        {/* Day labels (Mon, Wed, Fri) */}
        <div className="cal-day-col">
          {DAYS.map((d, i) => (
            <div key={i} className="cal-day-label">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="cal-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="cal-week">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`cal-cell cal-lv${day.future ? 0 : getLevel(day.rate)}`}
                  onMouseEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      date: day.date,
                      rate: Math.round(day.rate),
                      x: r.left + window.scrollX,
                      y: r.top + window.scrollY - 40,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span>Less</span>
        {[0,1,2,3,4].map(l => (
          <div key={l} className={`cal-cell cal-lv${l}`} />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="cal-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <strong>{tooltip.date}</strong>
          <span>{tooltip.rate}% completion</span>
        </div>
      )}
    </div>
  );
}
