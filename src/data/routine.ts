// Rutina extraída del Excel "Rutina_Final_Personalizada_95kg.xlsx"
// Estructura: días -> ejercicios (con series x reps e indicaciones)

export interface Exercise {
  id: string;
  name: string;
  setsReps: string;
  notes: string;
  warmup?: boolean;
}

export interface RoutineDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export const ROUTINE: RoutineDay[] = [
  {
    id: 'lunes',
    name: 'Lunes',
    exercises: [
      { id: 'lun-0', name: 'Dominadas Negativas Abiertas', setsReps: '3 x 4', notes: 'Entrada en calor', warmup: true },
      { id: 'lun-1', name: 'Flexiones Declinadas', setsReps: '2 x 8', notes: '', warmup: true },
      { id: 'lun-2', name: 'Press de Banca Plano con Mancuerna', setsReps: '3 x 8-10', notes: 'Buen estiramiento abajo, empuje controlado.' },
      { id: 'lun-3', name: 'Press Militar (Barra o Mancuerna)', setsReps: '3 x 6-8', notes: 'Empuje vertical estricto, apretando el core.' },
      { id: 'lun-4', name: 'Fondos entre Bancos (Tríceps)', setsReps: '3 x 10-12', notes: 'Controlar la bajada, cuidar hombros.' },
      { id: 'lun-5', name: 'Vuelos Laterales con Mancuerna', setsReps: '3 x 12-15', notes: 'Controlar el descenso, no usar impulso.' },
      { id: 'lun-6', name: 'Extensión de Tríceps sobre la Cabeza', setsReps: '3 x 10-12', notes: 'Trabaja la cabeza larga del tríceps en estiramiento.' },
    ],
  },
  {
    id: 'martes',
    name: 'Martes',
    exercises: [
      { id: 'mar-0', name: 'Movilidad articular rodillas', setsReps: 'Entrada en calor', notes: 'Movimiento de las articulaciones de la pierna', warmup: true },
      { id: 'mar-1', name: 'Aproximación ligera', setsReps: '', notes: 'Sentadillas sin peso (peso progresivo)', warmup: true },
      { id: 'mar-2', name: 'Sentadilla al Cajón (Box Squat a 90°)', setsReps: '4 x 6-8', notes: 'Bajar solo hasta 90° (paralela). Rodillas hacia afuera. Cuidado meniscos.' },
      { id: 'mar-3', name: 'Prensa Inclinada a 45°', setsReps: '3 x 10-12', notes: 'Pies al ancho de hombros, bajar controlado a 90° máx.' },
      { id: 'mar-4', name: 'Sillón de Cuádriceps (Extensiones)', setsReps: '3 x 12-15', notes: 'Apretar 1 segundo arriba. Carga cero para meniscos.' },
      { id: 'mar-5', name: 'Gemelos Sentado o de Pie', setsReps: '4 x 12-15', notes: 'Estiramiento completo y pausa de 1 segundo arriba.' },
      { id: 'mar-6', name: 'Abdominales Libres', setsReps: '3 x Cortos', notes: 'Trabajo directo de abdomen.' },
      { id: 'mar-7', name: 'Plancha Lateral con Banda (Abductores)', setsReps: '3 x 30-45 seg', notes: 'Elevar cadera y separar rodillas manteniendo tensión. Blindaje menisco externo.' },
    ],
  },
  {
    id: 'jueves',
    name: 'Jueves',
    exercises: [
      { id: 'jue-0', name: 'Dominadas en Barra', setsReps: '5 x 1-2', notes: 'Activación', warmup: true },
      { id: 'jue-1', name: 'Jalón al Pecho en Polea (Bien Abierto)', setsReps: '4 x 5-6 (Pesado)', notes: 'Fuerza pesada (75-80kg a futuro) para equiparar tus 95kg. 2 min descanso.' },
      { id: 'jue-2', name: 'Remo Bajo en Polea (Remo Gironda)', setsReps: '3 x 8-10', notes: 'Llevar agarre al abdomen bajo, apretando escápulas.' },
      { id: 'jue-3', name: 'Pullover en Polea Alta (Brazos rectos)', setsReps: '3 x 12', notes: 'Aislar el dorsal sin ganar inercia con los brazos.' },
      { id: 'jue-4', name: 'Curl de Bíceps Alterno con Rotación', setsReps: '3 x 8-10', notes: 'Girar muñeca hacia arriba al subir para máxima contracción.' },
      { id: 'jue-5', name: 'Curl de Bíceps con Barra', setsReps: '3 x 10-12', notes: 'Fuerza base de flexores de codo.' },
      { id: 'jue-6', name: 'Encogimiento de Hombros con Barra', setsReps: '3 x 10-12', notes: 'Tirar con los trapecios hacia arriba, pausa de 1 segundo arriba.' },
    ],
  },
  {
    id: 'viernes',
    name: 'Viernes',
    exercises: [
      { id: 'vie-0', name: 'Movilidad articular general', setsReps: 'Entrada en calor', notes: '', warmup: true },
      { id: 'vie-1', name: 'Aproximación ligera', setsReps: '', notes: '', warmup: true },
      { id: 'vie-2', name: 'Peso Muerto Rumano (Barra/Mancuerna)', setsReps: '4 x 8-10', notes: 'Bisagra de cadera, cola atrás, rodillas fijas. Sentir isquios.' },
      { id: 'vie-3', name: 'Camilla de Isquios (Curl Femoral)', setsReps: '3 x 10-12', notes: 'Controlar la fase excéntrica (bajada).' },
      { id: 'vie-4', name: 'Hip Thrust (Banco o Máquina)', setsReps: '3 x 10-12', notes: 'Extensión completa de cadera, pausa de 1 segundo arriba.' },
      { id: 'vie-5', name: 'Pájaros con Mancuerna (Deltoides Post.)', setsReps: '3 x 12-15', notes: 'Torso inclinado, abrir hacia los lados controlando.' },
      { id: 'vie-6', name: 'Gemelos en Prensa Inclinada', setsReps: '4 x 12-15', notes: 'Empujar con la punta de los pies, rango largo.' },
      { id: 'vie-7', name: 'Plancha Copenhagen con Pesa (Aductores)', setsReps: '3 x 30-45 seg', notes: 'Pierna de abajo cuelga a 90° con 5kg. Sostener isométrico. Blindaje cara interna.' },
    ],
  },
];

// Número de series objetivo por ejercicio (parseado de "S x R")
export function parseSets(setReps: string): number {
  if (!setReps) return 3;
  const m = setReps.match(/^(\d+)\s*x/i);
  return m ? parseInt(m[1], 10) : 3;
}
