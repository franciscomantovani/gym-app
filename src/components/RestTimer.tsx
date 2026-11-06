import { useEffect, useRef, useState } from 'react';

interface Props {
  seconds: number;
  onClose: () => void;
}

// Temporizador de descanso con sonido/vibración al terminar
export function RestTimer({ seconds, onClose }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          setRunning(false);
          // vibración + beep
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          beep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  function beep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.start();
      o.stop(ctx.currentTime + 0.6);
    } catch {
      /* ignore */
    }
  }

  function add(sec: number) {
    setRemaining((r) => Math.max(0, r + sec));
  }
  function toggle() {
    setRunning((r) => !r);
  }
  function restart() {
    setRemaining(seconds);
    setRunning(true);
  }

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0;
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="rest-overlay">
      <div className="rest-card">
        <div className="rest-ring" style={{ background: `conic-gradient(var(--accent) ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}>
          <div className="rest-ring-inner">
            <div className="rest-time">{mm}:{ss}</div>
            <div className="rest-state">{remaining === 0 ? 'Listo!' : running ? 'Descanso' : 'Pausado'}</div>
          </div>
        </div>
        <div className="rest-actions">
          <button onClick={() => add(-15)}>-15s</button>
          <button onClick={toggle}>{running ? 'Pausar' : 'Reanudar'}</button>
          <button onClick={() => add(15)}>+15s</button>
        </div>
        <div className="rest-actions">
          <button onClick={restart}>Reiniciar</button>
          <button className="primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
