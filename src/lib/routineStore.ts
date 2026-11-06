// Store de rutina: la rutina vive en localStorage.
// La primera vez se siembra con la rutina del Excel (ROUTINE_SEED).
// Después el usuario puede editarla/borrarla desde la app.

import { ROUTINE as ROUTINE_SEED, type RoutineDay, type Exercise } from '../data/routine';

const ROUTINE_KEY = 'gym.routine.v1';

export type { RoutineDay, Exercise };

export function loadRoutine(): RoutineDay[] {
  const raw = localStorage.getItem(ROUTINE_KEY);
  if (!raw) {
    // primera vez: sembrar con la rutina del Excel
    const seed = structuredClone(ROUTINE_SEED);
    saveRoutine(seed);
    return seed;
  }
  try {
    return JSON.parse(raw) as RoutineDay[];
  } catch {
    const seed = structuredClone(ROUTINE_SEED);
    saveRoutine(seed);
    return seed;
  }
}

export function saveRoutine(routine: RoutineDay[]): void {
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
}

export function resetRoutine(): RoutineDay[] {
  const seed = structuredClone(ROUTINE_SEED);
  saveRoutine(seed);
  return seed;
}

// Utilidades para generar IDs
export function newDayId(): string {
  return 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
export function newExerciseId(): string {
  return 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// Parse "S x R" -> número de series
export function parseSets(setReps: string): number {
  if (!setReps) return 3;
  const m = setReps.match(/^(\d+)\s*x/i);
  return m ? parseInt(m[1], 10) : 3;
}
