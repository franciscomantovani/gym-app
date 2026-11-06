# Mi Rutina Gym

App móvil (PWA) para cargar los pesos y detalles de cada ejercicio de mi rutina.
Funciona en Android e iOS sin servidor — todo se guarda local en el dispositivo.

## Funcionalidades

- Rutina de 4 días (Lunes, Martes, Jueves, Viernes) con ejercicios, series x reps e indicaciones.
- Registrar peso (kg) y repeticiones por serie.
- Temporizador de descanso con aviso (vibración + sonido).
- Notas libres por ejercicio y por sesión.
- Historial y gráfico de progreso por ejercicio.
- Exportar/importar datos (backup en JSON).
- Instalable como app nativa (PWA).

## Cómo usarla en el celular

La app está publicada en GitHub Pages:

**https://franciscomantovani.github.io/gym-app/**

- **Android (Chrome):** abrí la URL → menú (⋮) → "Instalar aplicación".
- **iOS (Safari):** abrí la URL → botón Compartir → "Añadir a pantalla de inicio".

## Desarrollo (local)

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción a dist/
npm run preview  # previsualizar el build
```
