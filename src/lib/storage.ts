// Tipos y capa de almacenamiento local (localStorage)
// Sin servidor, todo persiste en el dispositivo.

export interface SetEntry {
  // peso usado en esa serie (kg). Vacío = no registrado
  weight: string;
  // repeticiones efectivas hechas (texto libre, ej "8", "10", "fallo")
  reps: string;
  // si la serie se marcó como hecha
  done: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetEntry[];
  // nota libre del día para ese ejercicio
  note: string;
}

export interface Session {
  id: string;
  dayId: string;
  dayName: string;
  date: string; // ISO date (solo fecha YYYY-MM-DD)
  startedAt: string; // ISO datetime
  finishedAt?: string;
  exercises: ExerciseLog[];
  // nota general de la sesión
  generalNote: string;
}

const SESSIONS_KEY = 'gym.sessions.v1';
const SETTINGS_KEY = 'gym.settings.v1';

export interface Settings {
  // segundos de descanso por defecto
  restSeconds: number;
  bodyweight: number; // peso corporal para ejercicios con peso corporal
}

const DEFAULT_SETTINGS: Settings = {
  restSeconds: 90,
  bodyweight: 0,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSessions(): Session[] {
  return safeParse<Session[]>(localStorage.getItem(SESSIONS_KEY), []);
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...safeParse<Partial<Settings>>(localStorage.getItem(SETTINGS_KEY), {}) };
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function upsertSession(session: Session): Session[] {
  const all = loadSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.push(session);
  all.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
  saveSessions(all);
  return all;
}

export function deleteSession(id: string): Session[] {
  const all = loadSessions().filter((s) => s.id !== id);
  saveSessions(all);
  return all;
}

export function newSessionId(): string {
  return 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Devuelve el peso "top" (máximo) usado en una sesión para un ejercicio
export function topWeightOf(log: ExerciseLog): number {
  let top = 0;
  for (const s of log.sets) {
    const w = parseFloat(s.weight.replace(',', '.'));
    if (!isNaN(w) && w > top) top = w;
  }
  return top;
}

// Historial de un ejercicio: [{date, topWeight, session}]
export function exerciseHistory(exerciseId: string): { date: string; top: number; sessionId: string }[] {
  const all = loadSessions();
  const out: { date: string; top: number; sessionId: string }[] = [];
  for (const s of all) {
    const log = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (!log) continue;
    const top = topWeightOf(log);
    out.push({ date: s.date, top, sessionId: s.id });
  }
  // orden cronológico (viejo -> nuevo)
  out.sort((a, b) => (a.date < b.date ? -1 : 1));
  return out;
}
