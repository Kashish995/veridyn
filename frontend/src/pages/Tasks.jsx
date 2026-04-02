import { useEffect, useState } from 'react';
import api from '../api/api';
import '../styles/tasks.css';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { high: 'rose', medium: 'amber', low: 'emerald' };

const statusLabel = { completed: 'Completed', pending: 'Pending', missed: 'Missed', 'in-progress': 'In Progress' };

export default function Tasks() {
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [form, setForm] = useState({
    title: '', dueDate: '', startTime: '', endTime: '', priority: 'medium', description: ''
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.success ? (res.data.data || []) : []);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTask = async () => {
    if (!form.title || !form.dueDate || !form.startTime || !form.endTime) {
      return;
    }
    setAdding(true);
    try {
      await api.post('/tasks', { ...form, estimatedTime: 30 });
      setForm({ title: '', dueDate: '', startTime: '', endTime: '', priority: 'medium', description: '' });
      fetchTasks();
    } catch (e) {
      console.error(e);
    } finally { setAdding(false); }
  };

  const markDone   = async (id) => { await api.patch(`/tasks/${id}`, { status: 'completed' }); fetchTasks(); };
  const deleteTask = async (id) => { await api.delete(`/tasks/${id}`); fetchTasks(); };

  const enrich = (t) => {
    const now      = new Date();
    const dateStr  = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : null;
    const taskEnd  = dateStr && t.endTime ? new Date(`${dateStr}T${t.endTime}`) : null;
    const isMissed = t.status === 'pending' && taskEnd && now > taskEnd;
    return { ...t, displayStatus: isMissed ? 'missed' : t.status };
  };

  const enriched = tasks.map(enrich);

  const filtered = filter === 'all' ? enriched :
    enriched.filter(t =>
      filter === 'pending'   ? t.displayStatus === 'pending'   :
      filter === 'completed' ? t.displayStatus === 'completed' :
      t.displayStatus === 'missed'
    );

  const total     = enriched.length;
  const completed = enriched.filter(t => t.displayStatus === 'completed').length;
  const pending   = enriched.filter(t => t.displayStatus === 'pending').length;
  const missed    = enriched.filter(t => t.displayStatus === 'missed').length;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="tasks-page">
      <div className="tasks-container">

        {/* ── Header ── */}
        <div className="tasks-header">
          <div>
            <h1 className="tasks-title">Task Manager</h1>
            <p className="tasks-subtitle">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="tasks-stats-grid">
          {[
            { label: 'Total',     value: total,     color: 'indigo' },
            { label: 'Completed', value: completed, color: 'emerald' },
            { label: 'Pending',   value: pending,   color: 'amber' },
            { label: 'Missed',    value: missed,     color: 'rose' },
          ].map(s => (
            <div key={s.label} className={`task-stat-card task-stat-${s.color}`}>
              <div className="task-stat-value">{s.value}</div>
              <div className="task-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div className="tasks-progress-bar">
          <div className="tasks-progress-fill" style={{ width: `${pct}%` }} />
          <span className="tasks-progress-label">{pct}% complete</span>
        </div>

        {/* ── Create Task Form ── */}
        <div className="task-form-card">
          <div className="task-form-header">
            <div className="task-form-icon">+</div>
            <div>
              <div className="task-form-title">New Task</div>
              <div className="task-form-subtitle">Add a task to your schedule</div>
            </div>
          </div>

          {/* Title – full width */}
          <div className="task-field">
            <label className="task-field-label">Task Title <span className="required">*</span></label>
            <input
              className="task-field-input"
              placeholder="e.g. Solve 5 LeetCode problems"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
          </div>

          {/* Description */}
          <div className="task-field">
            <label className="task-field-label">Description <span className="optional">(optional)</span></label>
            <input
              className="task-field-input"
              placeholder="Additional notes..."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          {/* Date + Time row */}
          <div className="task-fields-row">
            <div className="task-field">
              <label className="task-field-label">Date <span className="required">*</span></label>
              <input
                className="task-field-input task-field-date"
                type="date"
                min={today}
                value={form.dueDate}
                onChange={e => handleChange('dueDate', e.target.value)}
              />
            </div>
            <div className="task-field">
              <label className="task-field-label">Start <span className="required">*</span></label>
              <input
                className="task-field-input"
                type="time"
                value={form.startTime}
                onChange={e => handleChange('startTime', e.target.value)}
              />
            </div>
            <div className="task-field">
              <label className="task-field-label">End <span className="required">*</span></label>
              <input
                className="task-field-input"
                type="time"
                value={form.endTime}
                onChange={e => handleChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Priority + Submit row */}
          <div className="task-form-footer">
            <div className="task-priority-pills">
              <span className="task-field-label" style={{ marginRight: '8px' }}>Priority</span>
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  className={`priority-pill priority-pill-${p} ${form.priority === p ? 'active' : ''}`}
                  onClick={() => handleChange('priority', p)}
                  type="button"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="task-submit-btn"
              onClick={addTask}
              disabled={adding || !form.title || !form.dueDate || !form.startTime || !form.endTime}
            >
              {adding ? (
                <><span className="btn-spin" />Adding...</>
              ) : (
                <><span>+</span> Add Task</>
              )}
            </button>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="tasks-filter-row">
          {['all', 'pending', 'completed', 'missed'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">
                {f === 'all' ? total : f === 'completed' ? completed : f === 'pending' ? pending : missed}
              </span>
            </button>
          ))}
        </div>

        {/* ── Task List ── */}
        {loading ? (
          <div className="task-list-loading">
            {[1,2,3].map(i => (
              <div key={i} className="task-item-skeleton">
                <div className="skeleton-title" />
                <div className="skeleton-meta" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="task-empty">
            <div className="task-empty-icon">◈</div>
            <div className="task-empty-title">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </div>
            <div className="task-empty-desc">
              {filter === 'all' ? 'Create your first task above to start tracking.' : `You have no ${filter} tasks right now.`}
            </div>
          </div>
        ) : (
          <div className="tasks-list">
            {filtered.map(t => {
              const color   = PRIORITY_COLORS[t.priority] || 'indigo';
              const s       = t.displayStatus;

              return (
                <div key={t._id} className={`task-item task-status-border-${s}`}>
                  {/* Left: check circle */}
                  <button
                    className={`task-check ${s === 'completed' ? 'checked' : ''}`}
                    onClick={() => s === 'pending' && markDone(t._id)}
                    title={s === 'pending' ? 'Mark complete' : ''}
                    disabled={s !== 'pending'}
                  />

                  {/* Middle: info */}
                  <div className="task-info">
                    <div className={`task-name ${s === 'completed' ? 'done' : ''}`}>
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="task-desc">{t.description}</div>
                    )}
                    <div className="task-meta-row">
                      <span className="task-time-chip">
                        ⏱ {t.startTime || '--'} – {t.endTime || '--'}
                      </span>
                      <span className={`task-priority-chip task-priority-${t.priority}`}>
                        {t.priority}
                      </span>
                      {t.dueDate && (
                        <span className="task-date-chip">
                          {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {s === 'missed' && (
                      <div className="task-missed-bar">
                        ⚠ Discipline breaks here. Get back on track.
                      </div>
                    )}
                  </div>

                  {/* Right: status + delete */}
                  <div className="task-right">
                    <span className={`task-status-pill status-${s}`}>
                      {s === 'completed' ? '✓' : s === 'missed' ? '✗' : '◷'} {statusLabel[s]}
                    </span>
                    <button
                      className="task-delete-btn"
                      onClick={() => deleteTask(t._id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
