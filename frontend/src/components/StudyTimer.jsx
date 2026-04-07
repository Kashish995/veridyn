// frontend/src/components/StudyTimer.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../api/api';

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};

export default function StudyTimer() {
  const [status,     setStatus]     = useState('idle'); // idle | running | paused
  const [elapsed,    setElapsed]    = useState(0);      // seconds this session
  const [todayTotal, setTodayTotal] = useState(0);      // minutes logged today
  const [goalMins,   setGoalMins]   = useState(120);    // from preferences
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const intervalRef = useRef(null);

  // ── Load today's progress + goal on mount ──────────────────
  useEffect(() => {
    const prefs = (() => {
      try { return JSON.parse(localStorage.getItem('veridyn_prefs') || '{}'); }
      catch { return {}; }
    })();
    const goal = (prefs.goalHours || 2) * 60;
    setGoalMins(goal);

    api.get(`/study-logs/today`)
      .then(res => setTodayTotal(res.data.loggedMinutes || 0))
      .catch(() => {});
  }, []);

  // ── Listen for preference updates (from ProfilePanel) ──────
  useEffect(() => {
    const handler = (e) => {
      const newGoal = (e.detail?.goalHours || 2) * 60;
      setGoalMins(newGoal);
    };
    window.addEventListener('veridyn-prefs-updated', handler);
    return () => window.removeEventListener('veridyn-prefs-updated', handler);
  }, []);

  // ── Timer tick ─────────────────────────────────────────────
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const handleStart  = () => { setStatus('running'); setSaved(false); };
  const handlePause  = () => setStatus('paused');
  const handleResume = () => setStatus('running');

  // ── Stop & Save ────────────────────────────────────────────
  const handleStop = async () => {
    setStatus('idle');
    clearInterval(intervalRef.current);

    if (elapsed < 60) {
      // Less than 1 min — don't log
      setElapsed(0);
      return;
    }

    const durationMinutes = Math.floor(elapsed / 60);
    const wasUnderGoal = todayTotal < goalMins; // track before updating

    setSaving(true);
    try {
      const res = await api.post(
        `/study-logs/session`,
        { durationMinutes, goalMinutes: goalMins }
      );

      const updatedLog = res.data.log;
      setTodayTotal(updatedLog.loggedMinutes);
      setSaved(true);

      const nowOverGoal = updatedLog.completionRate >= 1.0;
      if (nowOverGoal && wasUnderGoal) {
        try {
          const streakRes = await api.get(`/stats/longest-streak`);
          const currentStreak = streakRes.data.currentStreak || 1;
          window.dispatchEvent(new CustomEvent('streak-achieved', {
            detail: { streak: currentStreak }
          }));
        } catch {
          window.dispatchEvent(new CustomEvent('streak-achieved', {
            detail: { streak: 1 }
          }));
        }
      }

    } catch (err) {
      console.error('Failed to save study session:', err);
    } finally {
      setSaving(false);
      setElapsed(0);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setElapsed(0);
    setSaved(false);
    clearInterval(intervalRef.current);
  };

  // ── Progress calculations ──────────────────────────────────
  const totalElapsedSeconds = todayTotal * 60 + elapsed;
  const progressPercent     = Math.min((totalElapsedSeconds / (goalMins * 60)) * 100, 100);
  const isGoalHit           = totalElapsedSeconds >= goalMins * 60;

  // ── Styles ─────────────────────────────────────────────────
  const btnStyle = (color, primary) => ({
    flex: 1,
    padding: '12px',
    background: primary ? color : 'transparent',
    border: `1px solid ${color}`,
    borderRadius: '10px',
    color: primary ? '#0f1923' : color,
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f1923 0%, #131e2b 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '20px',
      padding: '28px',
      fontFamily: "'JetBrains Mono', monospace",
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <p style={{ color: '#4a9eff', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
            Study Timer
          </p>
          <p style={{ color: '#4a5568', fontSize: '11px', margin: '2px 0 0 0' }}>
            Daily goal: {goalMins} min
          </p>
        </div>
        {isGoalHit && (
          <span style={{
            background: 'rgba(72,199,142,0.15)',
            border: '1px solid rgba(72,199,142,0.4)',
            color: '#48c78e',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            letterSpacing: '1px',
          }}>
            🎯 GOAL HIT
          </span>
        )}
      </div>

      {/* ── Clock ── */}
      <div style={{
        textAlign: 'center',
        marginBottom: '28px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '14px',
        padding: '24px 16px',
        border: status === 'running'
          ? '1px solid rgba(74,158,255,0.3)'
          : '1px solid rgba(255,255,255,0.04)',
        transition: 'border-color 0.3s ease',
      }}>
        <div style={{
          fontSize: '52px',
          fontWeight: '700',
          color: status === 'running' ? '#4a9eff'
               : status === 'paused'  ? '#f59e0b'
               : '#e2e8f0',
          letterSpacing: '4px',
          transition: 'color 0.3s ease',
          lineHeight: 1,
        }}>
          {formatTime(elapsed)}
        </div>
        <p style={{ color: '#4a5568', fontSize: '11px', marginTop: '8px', letterSpacing: '1px' }}>
          {status === 'running' ? '● RECORDING'
         : status === 'paused'  ? '⏸ PAUSED'
         : 'THIS SESSION'}
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {status === 'idle' && (
          <button onClick={handleStart} style={btnStyle('#4a9eff', true)}>
            ▶ Start
          </button>
        )}
        {status === 'running' && (<>
          <button onClick={handlePause} style={btnStyle('#f59e0b', false)}>⏸ Pause</button>
          <button onClick={handleStop}  style={btnStyle('#ef4444', false)} disabled={saving}>
            {saving ? 'Saving...' : '⏹ Stop & Save'}
          </button>
        </>)}
        {status === 'paused' && (<>
          <button onClick={handleResume} style={btnStyle('#4a9eff', true)}>▶ Resume</button>
          <button onClick={handleStop}   style={btnStyle('#ef4444', false)} disabled={saving}>
            {saving ? 'Saving...' : '⏹ Stop & Save'}
          </button>
          <button onClick={handleReset}  style={btnStyle('#4a5568', false)}>✕</button>
        </>)}
      </div>

      {/* ── Progress bar ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Today's Progress</span>
          <span style={{ color: '#e2e8f0', fontSize: '12px' }}>
            {Math.floor(totalElapsedSeconds / 60)}m / {goalMins}m
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: isGoalHit
              ? 'linear-gradient(90deg, #48c78e, #3ddc97)'
              : 'linear-gradient(90deg, #4a9eff, #7c3aed)',
            borderRadius: '6px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        {saved && (
          <p style={{ color: '#48c78e', fontSize: '11px', marginTop: '10px', textAlign: 'center' }}>
            ✓ Session saved — heatmap updated!
          </p>
        )}
      </div>

    </div>
  );
}
