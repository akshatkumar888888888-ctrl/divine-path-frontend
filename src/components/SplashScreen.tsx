import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const t4 = setTimeout(() => onDone(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', overflow: 'hidden',
      opacity: phase === 3 ? 0 : 1,
      transition: phase === 3 ? 'opacity 0.7s ease' : 'none',
      zIndex: 9999,
    }}>
      {/* Horizon line */}
      <div style={{
        position: 'absolute', bottom: '42%', left: 0, right: 0,
        height: '1px', background: 'rgba(255,160,50,0.3)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }} />

      {/* Sun */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'radial-gradient(circle, #fff7e0 0%, #ffb830 40%, #ff6a00 100%)',
        boxShadow: phase >= 2
          ? '0 0 60px 30px rgba(255,140,0,0.4), 0 0 120px 60px rgba(255,100,0,0.2)'
          : '0 0 20px 10px rgba(255,140,0,0.2)',
        transform: phase === 0 ? 'translateY(200px)' : phase === 1 ? 'translateY(60px)' : 'translateY(0px)',
        opacity: phase === 0 ? 0 : 1,
        transition: 'transform 1s cubic-bezier(0.22,1,0.36,1), opacity 0.8s ease, box-shadow 1s ease',
        marginBottom: 40,
      }} />

      {/* Rays */}
      {phase >= 2 && [0,45,90,135,180,225,270,315].map((deg, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 2, height: 80,
          background: 'linear-gradient(to top, rgba(255,180,0,0.6), transparent)',
          transformOrigin: 'bottom center',
          transform: `rotate(${deg}deg) translateY(-110px)`,
          top: '50%', left: '50%', marginLeft: -1, marginTop: -150,
          animation: 'rayPulse 2s ease-in-out infinite alternate',
          animationDelay: `${i * 0.1}s`,
          opacity: 0.7,
        }} />
      ))}

      {/* Glow on horizon */}
      <div style={{
        position: 'absolute', bottom: '38%', left: '20%', right: '20%',
        height: 60,
        background: 'radial-gradient(ellipse, rgba(255,120,0,0.3) 0%, transparent 70%)',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 1s ease',
      }} />

      {/* Text */}
      <div style={{
        color: 'white', fontSize: 28, fontWeight: 700,
        letterSpacing: 6, fontFamily: 'sans-serif',
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease',
        marginTop: 20,
        textShadow: '0 0 20px rgba(255,160,0,0.5)',
      }}>
        DIVINE PATH
      </div>
      <div style={{
        color: 'rgba(255,180,80,0.7)', fontSize: 13,
        letterSpacing: 4, fontFamily: 'sans-serif',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 1s ease 0.3s',
        marginTop: 8,
      }}>
        RISE • LEARN • EXCEL
      </div>

      <style>{`
        @keyframes rayPulse {
          from { opacity: 0.4; transform: rotate(var(--deg)) translateY(-110px) scaleY(0.8); }
          to { opacity: 0.8; transform: rotate(var(--deg)) translateY(-110px) scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}