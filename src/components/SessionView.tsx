import { useEffect, useState } from 'react';
import { parseSets, type RoutineDay, type Exercise } from '../data/routine';
import {
  type Session,
  type SetEntry,
  type Settings,
  upsertSession,
  newSessionId,
  loadSessions,
  exerciseHistory,
} from '../lib/storage';
import { RestTimer } from './RestTimer';

interface Props {
  day: RoutineDay;
  settings: Settings;
  onExit: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function newISOString(): string {
  return new Date().toISOString();
}

// Carga previa del peso usado la última vez para este ejercicio
function lastTopWeight(exerciseId: string): string {
  const hist = exerciseHistory(exerciseId);
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i].top > 0) return String(hist[i].top);
  }
  return '';
}

export function SessionView({ day, settings, onExit }: Props) {
  const [session, setSession] = useState<Session>(() => {
    const existing = loadSessions().find((s) => s.dayId === day.id && s.date === todayISO() && !s.finishedAt);
    if (existing) return existing;
    return {
      id: newSessionId(),
      dayId: day.id,
      dayName: day.name,
      date: todayISO(),
      startedAt: newISOString(),
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.id,
        sets: buildInitialSets(ex),
        note: '',
      })),
      generalNote: '',
    };
  });
  const [timer, setTimer] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // persistir cambios (auto-guardado)
  useEffect(() => {
    upsertSession(session);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [session]);

  function buildInitialSets(ex: Exercise): SetEntry[] {
    const n = parseSets(ex.setsReps);
    const lastW = lastTopWeight(ex.id);
    return Array.from({ length: n }, () => ({ weight: lastW, reps: '', done: false }));
  }

  function updateSet(exIdx: number, setIdx: number, patch: Partial<SetEntry>) {
    setSession((s) => {
      const exercises = s.exercises.map((e, i) => {
        if (i !== exIdx) return e;
        const sets = e.sets.map((st, j) => (j === setIdx ? { ...st, ...patch } : st));
        return { ...e, sets };
      });
      return { ...s, exercises };
    });
  }

  function addSet(exIdx: number) {
    setSession((s) => {
      const exercises = s.exercises.map((e, i) => {
        if (i !== exIdx) return e;
        const last = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, { weight: last?.weight ?? '', reps: '', done: false }] };
      });
      return { ...s, exercises };
    });
  }

  function removeSet(exIdx: number, setIdx: number) {
    setSession((s) => {
      const exercises = s.exercises.map((e, i) => {
        if (i !== exIdx) return e;
        return { ...e, sets: e.sets.filter((_, j) => j !== setIdx) };
      });
      return { ...s, exercises };
    });
  }

  function setNote(exIdx: number, note: string) {
    setSession((s) => {
      const exercises = s.exercises.map((e, i) => (i === exIdx ? { ...e, note } : e));
      return { ...s, exercises };
    });
  }

  function setGeneralNote(note: string) {
    setSession((s) => ({ ...s, generalNote: note }));
  }

  function finish() {
    const finalSession = { ...session, finishedAt: newISOString() };
    upsertSession(finalSession);
    onExit();
  }

  const doneCount = session.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0);
  const totalSets = session.exercises.reduce((acc, e) => acc + e.sets.length, 0);

  return (
    <div className="session">
      <header className="session-header">
        <button className="back" onClick={onExit}>‹</button>
        <div>
          <h1>{day.name}</h1>
          <div className="session-meta">
            {doneCount}/{totalSets} series · {fmtDate(session.date)}
            {saved && <span className="saved-tag">Guardado ✓</span>}
          </div>
        </div>
      </header>

      {session.exercises.map((log, exIdx) => {
        const ex = day.exercises[exIdx];
        const hist = exerciseHistory(ex.id).filter((h) => h.top > 0);
        const lastTop = hist.length ? hist[hist.length - 1].top : 0;
        return (
          <section key={ex.id} className={`ex-card ${ex.warmup ? 'warmup' : ''}`}>
            <div className="ex-head">
              <div>
                <h2>{ex.name}</h2>
                <div className="ex-sub">
                  <span className="badge">{ex.setsReps || '—'}</span>
                  {ex.warmup && <span className="badge warm">Calentamiento</span>}
                  {lastTop > 0 && <span className="badge prev">Último: {lastTop}kg</span>}
                </div>
              </div>
            </div>
            {ex.notes && <p className="ex-notes">{ex.notes}</p>}

            <div className="sets">
              <div className="set-row set-row-head">
                <span>#</span>
                <span>Peso (kg)</span>
                <span>Reps</span>
                <span>Hecho</span>
                <span></span>
              </div>
              {log.sets.map((st, setIdx) => (
                <div key={setIdx} className={`set-row ${st.done ? 'done' : ''}`}>
                  <span className="set-num">{setIdx + 1}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={st.weight}
                    onChange={(e) => updateSet(exIdx, setIdx, { weight: e.target.value })}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={targetReps(ex.setsReps)}
                    value={st.reps}
                    onChange={(e) => updateSet(exIdx, setIdx, { reps: e.target.value })}
                  />
                  <button
                    className={`check ${st.done ? 'on' : ''}`}
                    onClick={() => {
                      updateSet(exIdx, setIdx, { done: !st.done });
                      if (!st.done) setTimer(settings.restSeconds);
                    }}
                    aria-label="marcar hecho"
                  >
                    {st.done ? '✓' : ''}
                  </button>
                  <button className="del-set" onClick={() => removeSet(exIdx, setIdx)}>×</button>
                </div>
              ))}
            </div>
            <div className="ex-actions">
              <button className="ghost" onClick={() => addSet(exIdx)}>+ Serie</button>
              <button className="ghost" onClick={() => setTimer(settings.restSeconds)}>⏱ Descanso</button>
            </div>
            <textarea
              className="ex-note"
              placeholder="Nota de este ejercicio (sensación, RPE, dolor...)"
              value={log.note}
              onChange={(e) => setNote(exIdx, e.target.value)}
            />
          </section>
        );
      })}

      <section className="general-note">
        <h3>Nota general de la sesión</h3>
        <textarea
          placeholder="Cómo te sentiste hoy, energía, observaciones..."
          value={session.generalNote}
          onChange={(e) => setGeneralNote(e.target.value)}
        />
      </section>

      <div className="finish-bar">
        <button className="primary big" onClick={finish}>Finalizar entrenamiento</button>
      </div>

      {timer !== null && <RestTimer seconds={timer} onClose={() => setTimer(null)} />}
    </div>
  );
}

function targetReps(setReps: string): string {
  const m = setReps.match(/x\s*([0-9\-+ ]+)/i);
  return m ? m[1].trim() : '';
}
function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
