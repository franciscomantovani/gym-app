import { useState } from 'react';
import {
  type RoutineDay,
  type Exercise,
  loadRoutine,
  saveRoutine,
  resetRoutine,
  newDayId,
  newExerciseId,
} from '../lib/routineStore';

interface Props {
  onExit: () => void;
  onChanged: () => void;
}

export function RoutineEditor({ onExit, onChanged }: Props) {
  const [routine, setRoutine] = useState<RoutineDay[]>(loadRoutine);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function commit(next: RoutineDay[]) {
    setRoutine(next);
    saveRoutine(next);
    onChanged();
  }

  function addDay() {
    const newDay: RoutineDay = {
      id: newDayId(),
      name: 'Nuevo día',
      exercises: [],
    };
    commit([...routine, newDay]);
    setEditingDayId(newDay.id);
  }

  function updateDay(dayId: string, patch: Partial<RoutineDay>) {
    commit(routine.map((d) => (d.id === dayId ? { ...d, ...patch } : d)));
  }

  function deleteDay(dayId: string) {
    if (!confirm('¿Eliminar este día y todos sus ejercicios?')) return;
    commit(routine.filter((d) => d.id !== dayId));
    if (editingDayId === dayId) setEditingDayId(null);
  }

  function moveDay(dayId: string, dir: -1 | 1) {
    const idx = routine.findIndex((d) => d.id === dayId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= routine.length) return;
    const next = [...routine];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    commit(next);
  }

  function addExercise(dayId: string) {
    const newEx: Exercise = {
      id: newExerciseId(),
      name: 'Nuevo ejercicio',
      setsReps: '3 x 10',
      notes: '',
      warmup: false,
    };
    commit(routine.map((d) => (d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d)));
  }

  function updateExercise(dayId: string, exId: string, patch: Partial<Exercise>) {
    commit(
      routine.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) }
          : d,
      ),
    );
  }

  function deleteExercise(dayId: string, exId: string) {
    commit(
      routine.map((d) =>
        d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d,
      ),
    );
  }

  function moveExercise(dayId: string, exId: string, dir: -1 | 1) {
    const day = routine.find((d) => d.id === dayId);
    if (!day) return;
    const idx = day.exercises.findIndex((e) => e.id === exId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= day.exercises.length) return;
    const newExs = [...day.exercises];
    [newExs[idx], newExs[newIdx]] = [newExs[newIdx], newExs[idx]];
    commit(routine.map((d) => (d.id === dayId ? { ...d, exercises: newExs } : d)));
  }

  function doReset() {
    if (!confirm('¿Restaurar la rutina original del Excel? Se pierden los cambios a la rutina (NO las sesiones registradas).')) return;
    const seed = resetRoutine();
    setRoutine(seed);
    onChanged();
    setConfirmReset(false);
  }

  return (
    <div className="editor">
      <header className="session-header">
        <button className="back" onClick={onExit}>‹</button>
        <div>
          <h1>Editar rutina</h1>
          <div className="session-meta">{routine.length} días</div>
        </div>
      </header>

      <p className="editor-hint">Acá armás tu rutina. Los cambios se guardan solos en el dispositivo. Las sesiones ya registradas no se borran.</p>

      {routine.map((day, i) => (
        <section key={day.id} className="day-edit">
          <div className="day-edit-head">
            <input
              className="day-name-input"
              value={day.name}
              onChange={(e) => updateDay(day.id, { name: e.target.value })}
              placeholder="Nombre del día"
            />
            <div className="day-edit-actions">
              <button className="ghost small" onClick={() => moveDay(day.id, -1)} disabled={i === 0}>↑</button>
              <button className="ghost small" onClick={() => moveDay(day.id, 1)} disabled={i === routine.length - 1}>↓</button>
              <button className="ghost small" onClick={() => setEditingDayId(editingDayId === day.id ? null : day.id)}>
                {editingDayId === day.id ? 'Listo' : 'Editar'}
              </button>
              <button className="ghost small danger" onClick={() => deleteDay(day.id)}>×</button>
            </div>
          </div>
          <div className="day-edit-info">
            {day.exercises.length} ejercicios
            {day.exercises.filter((e) => e.warmup).length > 0 && ` · ${day.exercises.filter((e) => e.warmup).length} calentamiento`}
          </div>

          {editingDayId === day.id && (
            <div className="ex-edit-list">
              {day.exercises.map((ex, j) => (
                <div key={ex.id} className={`ex-edit ${ex.warmup ? 'warmup' : ''}`}>
                  <div className="ex-edit-top">
                    <input
                      className="ex-name-input"
                      value={ex.name}
                      onChange={(e) => updateExercise(day.id, ex.id, { name: e.target.value })}
                      placeholder="Nombre del ejercicio"
                    />
                    <div className="ex-edit-actions">
                      <button className="ghost small" onClick={() => moveExercise(day.id, ex.id, -1)} disabled={j === 0}>↑</button>
                      <button className="ghost small" onClick={() => moveExercise(day.id, ex.id, 1)} disabled={j === day.exercises.length - 1}>↓</button>
                      <button className="ghost small danger" onClick={() => deleteExercise(day.id, ex.id)}>×</button>
                    </div>
                  </div>
                  <div className="ex-edit-row">
                    <label>
                      Series x Reps
                      <input
                        value={ex.setsReps}
                        onChange={(e) => updateExercise(day.id, ex.id, { setsReps: e.target.value })}
                        placeholder="3 x 10"
                      />
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={!!ex.warmup}
                        onChange={(e) => updateExercise(day.id, ex.id, { warmup: e.target.checked })}
                      />
                      Calentamiento
                    </label>
                  </div>
                  <textarea
                    className="ex-notes-input"
                    value={ex.notes}
                    onChange={(e) => updateExercise(day.id, ex.id, { notes: e.target.value })}
                    placeholder="Indicaciones clave (opcional)"
                  />
                </div>
              ))}
              <button className="ghost add-ex" onClick={() => addExercise(day.id)}>+ Ejercicio</button>
            </div>
          )}
        </section>
      ))}

      <button className="primary add-day" onClick={addDay}>+ Agregar día</button>

      <section className="reset-section">
        {confirmReset ? (
          <div className="reset-confirm">
            <p>¿Seguro? Se restaura la rutina original del Excel.</p>
            <button className="danger-btn" onClick={doReset}>Sí, restaurar</button>
            <button className="ghost" onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        ) : (
          <button className="ghost" onClick={() => setConfirmReset(true)}>Restaurar rutina original del Excel</button>
        )}
      </section>
    </div>
  );
}
