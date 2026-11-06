import { useState } from 'react';
import { ROUTINE, type RoutineDay } from './data/routine';
import { loadSettings, loadSessions, type Settings } from './lib/storage';
import { SessionView } from './components/SessionView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import './App.css';

type Screen =
  | { name: 'home' }
  | { name: 'session'; day: RoutineDay }
  | { name: 'history' }
  | { name: 'settings' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [tick, setTick] = useState(0); // refresca home al volver

  if (screen.name === 'session') {
    return <SessionView day={screen.day} settings={settings} onExit={() => { setTick((t) => t + 1); setScreen({ name: 'home' }); }} />;
  }
  if (screen.name === 'history') {
    return <HistoryView onExit={() => { setTick((t) => t + 1); setScreen({ name: 'home' }); }} />;
  }
  if (screen.name === 'settings') {
    return <SettingsView onExit={() => setScreen({ name: 'home' })} onSettingsChange={setSettings} />;
  }

  return <Home onOpenDay={(d) => setScreen({ name: 'session', day: d })} onHistory={() => setScreen({ name: 'history' })} onSettings={() => setScreen({ name: 'settings' })} tick={tick} />;
}

function Home({ onOpenDay, onHistory, onSettings, tick }: { onOpenDay: (d: RoutineDay) => void; onHistory: () => void; onSettings: () => void; tick: number }) {
  const sessions = loadSessions();
  // última sesión por día
  const lastByDay: Record<string, string> = {};
  for (const s of sessions) {
    if (!lastByDay[s.dayId] || s.startedAt > lastByDay[s.dayId]) lastByDay[s.dayId] = s.startedAt;
  }
  void tick;

  const today = new Date().getDay(); // 0 dom ... 1 lun ... 5 vie
  const todayId = today === 1 ? 'lunes' : today === 2 ? 'martes' : today === 4 ? 'jueves' : today === 5 ? 'viernes' : '';

  return (
    <div className="home">
      <header className="home-header">
        <h1>Mi Rutina</h1>
        <div className="home-actions">
          <button className="icon-btn" onClick={onHistory} title="Historial">📈</button>
          <button className="icon-btn" onClick={onSettings} title="Ajustes">⚙️</button>
        </div>
      </header>

      <p className="home-sub">Rutina Personalizada · 4 días</p>

      <div className="days">
        {ROUTINE.map((d) => {
          const last = lastByDay[d.id];
          const isToday = d.id === todayId;
          return (
            <button key={d.id} className={`day-card ${isToday ? 'today' : ''}`} onClick={() => onOpenDay(d)}>
              <div className="day-card-top">
                <h2>{d.name}</h2>
                {isToday && <span className="today-tag">Hoy</span>}
              </div>
              <div className="day-card-info">
                <span>{d.exercises.length} ejercicios</span>
                {last && <span className="last-done">Último: {fmtRelative(last)}</span>}
              </div>
              <div className="day-ex-preview">
                {d.exercises.filter((e) => !e.warmup).slice(0, 3).map((e) => (
                  <span key={e.id} className="ex-chip">{e.name}</span>
                ))}
                {d.exercises.filter((e) => !e.warmup).length > 3 && <span className="ex-chip more">+{d.exercises.filter((e) => !e.warmup).length - 3}</span>}
              </div>
              <div className="day-cta">Empezar ›</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function fmtRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays <= 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
