import { useState } from 'react';
import { loadRoutine, type RoutineDay } from './lib/routineStore';
import { loadSettings, loadSessions, type Settings } from './lib/storage';
import { SessionView } from './components/SessionView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { RoutineEditor } from './components/RoutineEditor';
import './App.css';

type Screen =
  | { name: 'home' }
  | { name: 'session'; day: RoutineDay }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'editor' };

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
  if (screen.name === 'editor') {
    return <RoutineEditor onExit={() => { setTick((t) => t + 1); setScreen({ name: 'home' }); }} onChanged={() => setTick((t) => t + 1)} />;
  }

  return <Home onOpenDay={(d) => setScreen({ name: 'session', day: d })} onHistory={() => setScreen({ name: 'history' })} onSettings={() => setScreen({ name: 'settings' })} onEditRoutine={() => setScreen({ name: 'editor' })} tick={tick} />;
}

function Home({ onOpenDay, onHistory, onSettings, onEditRoutine, tick }: { onOpenDay: (d: RoutineDay) => void; onHistory: () => void; onSettings: () => void; onEditRoutine: () => void; tick: number }) {
  const routine = loadRoutine();
  const sessions = loadSessions();
  void tick;

  const lastByDay: Record<string, string> = {};
  for (const s of sessions) {
    if (!lastByDay[s.dayId] || s.startedAt > lastByDay[s.dayId]) lastByDay[s.dayId] = s.startedAt;
  }

  const today = new Date().getDay();
  const todayName = today === 1 ? 'Lunes' : today === 2 ? 'Martes' : today === 3 ? 'Miércoles' : today === 4 ? 'Jueves' : today === 5 ? 'Viernes' : today === 6 ? 'Sábado' : 'Domingo';

  return (
    <div className="home">
      <header className="home-header">
        <h1>Mi Rutina</h1>
        <div className="home-actions">
          <button className="icon-btn" onClick={onEditRoutine} title="Editar rutina">✏️</button>
          <button className="icon-btn" onClick={onHistory} title="Historial">📈</button>
          <button className="icon-btn" onClick={onSettings} title="Ajustes">⚙️</button>
        </div>
      </header>

      <p className="home-sub">{routine.length} días · tocá ✏️ para editar la rutina</p>

      {routine.length === 0 && (
        <div className="empty-state">
          <p>Todavía no cargaste ninguna rutina.</p>
          <button className="primary" onClick={onEditRoutine}>Crear mi rutina</button>
        </div>
      )}

      <div className="days">
        {routine.map((d) => {
          const last = lastByDay[d.id];
          const isToday = d.name.toLowerCase().startsWith(todayName.toLowerCase().slice(0, 3)) ||
            todayName.toLowerCase() === d.name.toLowerCase();
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

      {routine.length > 0 && (
        <button className="ghost edit-routine-btn" onClick={onEditRoutine}>✏️ Editar rutina</button>
      )}
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
