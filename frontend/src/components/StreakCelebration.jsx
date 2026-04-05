// StreakCelebration.jsx
// Drop this anywhere in your app tree (e.g. inside App.jsx or Dashboard.jsx)
// Trigger it by dispatching: window.dispatchEvent(new CustomEvent('streak-achieved', { detail: { streak: 5 } }))

import { useState, useEffect } from 'react';

export default function StreakCelebration() {
  const [show, setShow]     = useState(false);
  const [streak, setStreak] = useState(1);
  const [coins, setCoins]   = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const s = e.detail?.streak || 1;
      setStreak(s);
      // Spawn 6 coins at random positions
      setCoins(Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: 30 + Math.random() * 40,   // % from left
        delay: i * 80,                  // ms stagger
        rotate: -20 + Math.random() * 40,
      })));
      setShow(true);
      setTimeout(() => setShow(false), 2800);
    };
    window.addEventListener('streak-achieved', handler);
    return () => window.removeEventListener('streak-achieved', handler);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      zIndex: 9999, overflow: 'hidden',
    }}>

      {/* ── Floating coins ── */}
      {coins.map(coin => (
        <div
          key={coin.id}
          style={{
            position: 'absolute',
            bottom: '80px',
            left: `${coin.x}%`,
            animation: `coinFloat 1.8s ease-out ${coin.delay}ms forwards`,
            transform: `rotate(${coin.rotate}deg)`,
            fontSize: '28px',
            filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))',
          }}
        >
          🪙
        </div>
      ))}

      {/* ── Main streak badge ── */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'badgePop 2.6s ease-out forwards',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        {/* +1 coin */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: '900',
          color: '#78350f',
          boxShadow: '0 0 24px rgba(251,191,36,0.6), 0 4px 16px rgba(0,0,0,0.4)',
          border: '3px solid rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          letterSpacing: '-1px',
        }}>
          +1
        </div>

        {/* Streak count pill */}
        <div style={{
          background: 'rgba(15,25,35,0.95)',
          border: '1px solid rgba(251,191,36,0.4)',
          borderRadius: '20px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize: '18px' }}>🔥</span>
          <span style={{
            color: '#fbbf24', fontSize: '15px', fontWeight: '700',
            fontFamily: 'monospace', letterSpacing: '0.5px',
          }}>
            {streak} day streak!
          </span>
        </div>

        {/* Motivational line */}
        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '12px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}>
          {streak >= 7  ? '🏆 On fire! Keep going!' :
           streak >= 3  ? '⚡ Great consistency!' :
                          '✨ Goal hit! Keep it up!'}
        </div>
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes coinFloat {
          0%   { transform: translateY(0)   rotate(0deg)   scale(0.5); opacity: 0; }
          20%  { opacity: 1; scale: 1; }
          100% { transform: translateY(-220px) rotate(360deg) scale(0.8); opacity: 0; }
        }
        @keyframes badgePop {
          0%   { transform: translateX(-50%) translateY(40px) scale(0.6); opacity: 0; }
          15%  { transform: translateX(-50%) translateY(0px)  scale(1.15); opacity: 1; }
          25%  { transform: translateX(-50%) translateY(0px)  scale(1.0); }
          75%  { transform: translateX(-50%) translateY(0px)  scale(1.0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-30px) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
