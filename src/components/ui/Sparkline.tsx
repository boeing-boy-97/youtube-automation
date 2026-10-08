import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  stroke?: string;
  fill?: string | boolean;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
  stroke,
  fill = true,
  strokeWidth = 1.5,
  className,
}: SparklineProps) {
  const strokeColor = stroke || color || 'hsl(var(--accent))';
  const fillColor = typeof fill === 'string' ? fill : (fill ? strokeColor : 'none');

  const path = useMemo(() => {
    if (data.length < 2) return { line: '', area: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height - 2) - 1,
    }));

    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const area = `${line} L${width},${height} L0,${height} Z`;

    return { line, area };
  }, [data, width, height]);

  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const negative = trend < 0;
  const finalStroke = negative ? 'hsl(var(--danger))' : strokeColor;
  const finalFill = typeof fill === 'string' ? fillColor : (negative ? 'hsla(0,70%,55%,0.08)' : fillColor);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={`overflow-visible ${className || ''}`} preserveAspectRatio="none">
      {fill && <path d={path.area} fill={finalFill} />}
      <path d={path.line} fill="none" stroke={finalStroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
