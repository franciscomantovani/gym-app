import { useMemo, useState } from 'react';
import { loadRoutine } from '../lib/routineStore';
import { loadSessions, deleteSession, exerciseHistory, type Session } from '../lib/storage';
import { ProgressChart } from './ProgressChart';

interface Props {
  onExit: () => void;
}

export function HistoryView({ onExit }: Props) {
  const [tick, setTick] = useState(0);
  const [selectedEx, setSelectedEx] = useState<string>('');
  const routine = useMemo(() => loadRoutine(), [tick]);
  const sessions = useMemo<Session[]>(() => loadSessions(), [tick]);

  const allExercises = routine.flatMap((d) => d.exercises.map((e) => ({ ...e, dayName: d.name })));
  const ex = allExercises.find((e) => e.id === selectedEx) ?? allExercises[0];
  const hist = useMemo(() => (selectedEx ? exerciseHistory(selectedEx) : []), [selectedEx, tick]);

  function refresh() {
    setTick((t) => t + 1);
  }

  function del(id: string) {
    if (!confirm('¿Eliminar esta sesión?')) return;
    deleteSession(id);
    refresh();
  }

  return (
    <div className="history">
      <header className="session-header">
        <button className="back" onClick={onExit}>‹</button>
        <div>
          <h1>Historial y Progreso</h1>
          <div className="session-meta">{sessions.length} sesiones registradas</div>
        </div>
      </header>

      <section className="progress-section">
        <h3>Progreso de un ejercicio</h3>
        {allExercises.length === 0 ? (
          <p className="empty">No hay ejercicios en la rutina. Editá la rutina primero.</p>
        ) : (
          <>
        <select value={selectedEx} onChange={(e) => setSelectedEx(e.target.value)} className="ex-select">
          {routine.map((d) => (
            <optgroup key={d.id} label={d.name}>
              {d.exercises.filter((e) => !e.warmup).map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {ex && (
        <div className="ex-info">
          <span className="badge">{ex.setsReps}</span>
          <span className="badge prev">{hist.filter((h) => h.top > 0).length} registros</span>
          {hist.length > 0 && hist[hist.length - 1].top > 0 && (
            <span className="badge prev">Último: {hist[hist.length - 1].top}kg</span>
          )}
        </div>
        )}
        <ProgressChart data={hist} />
        <div className="hist-list">
          {[...hist].reverse().map((h, i) => (
            <div key={i} className="hist-row">
              <span className="hist-date">{fmtDate(h.date)}</span>
              <span className="hist-top">{h.top > 0 ? `${h.top} kg` : '—'}</span>
            </div>
          ))}
        </div>
          </>
        )}
      </section>

      <section className="sessions-list">
        <h3>Sesiones</h3>
        {sessions.length === 0 && <p className="empty">Todavía no registraste ninguna sesión.</p>}
        {sessions.map((s) => (
          <div key={s.id} className="session-card">
            <div className="session-card-head">
              <div>
                <strong>{s.dayName}</strong>
                <span className="session-date">{fmtDateTime(s.startedAt)}</span>
              </div>
              <button className="del" onClick={() => del(s.id)}>Eliminar</button>
            </div>
            <div className="session-sets-summary">
              {s.exercises
                .filter((e) => e.sets.some((st) => st.done || st.weight))
                .map((e) => {
                  const ex = allExercises.find((x) => x.id === e.exerciseId);
                  const top = e.sets.reduce((m, st) => {
                    const w = parseFloat(st.weight.replace(',', '.'));
                    return !isNaN(w) && w > m ? w : m;
                  }, 0);
                  return (
                    <div key={e.exerciseId} className="sess-ex">
                      <span className="sess-ex-name">{ex?.name}</span>
                      <span className="sess-ex-top">{top > 0 ? `${top}kg` : '—'}</span>
                    </div>
                  );
                })}
            </div>
            {s.generalNote && <p className="sess-note">{s.generalNote}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
