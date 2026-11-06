interface Point {
  date: string;
  top: number;
}

interface Props {
  data: Point[];
  height?: number;
}

// Gráfico de línea simple en SVG. Sin dependencias externas.
export function ProgressChart({ data, height = 140 }: Props) {
  const width = 320;
  const pad = { l: 34, r: 12, t: 12, b: 22 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const valid = data.filter((d) => d.top > 0);
  if (valid.length < 1) {
    return <div className="chart-empty">Sin datos todavía. Registra pesos para ver el progreso.</div>;
  }

  const xs = valid.map((_, i) => (valid.length === 1 ? innerW / 2 : (i / (valid.length - 1)) * innerW));
  const maxY = Math.max(...valid.map((d) => d.top)) * 1.1 || 10;
  const minY = 0;
  const ys = valid.map((d) => innerH - ((d.top - minY) / (maxY - minY)) * innerH);

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length - 1].toFixed(1)},${innerH} L${xs[0].toFixed(1)},${innerH} Z`;

  // etiquetas eje Y (4 marcas)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: innerH - t * innerH,
    v: (minY + t * (maxY - minY)).toFixed(0),
  }));

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={pad.t + t.y} x2={pad.l + innerW} y2={pad.t + t.y} stroke="rgba(255,255,255,0.08)" />
          <text x={pad.l - 6} y={pad.t + t.y + 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.5)">
            {t.v}
          </text>
        </g>
      ))}
      <path d={area} fill="var(--accent)" opacity="0.15" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {xs.map((x, i) => (
        <circle key={i} cx={pad.l + x} cy={pad.t + ys[i]} r="3" fill="var(--accent)" />
      ))}
      {valid.map((d, i) => (
        <text key={i} x={pad.l + xs[i]} y={height - 6} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)">
          {shortDate(d.date)}
        </text>
      ))}
    </svg>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
