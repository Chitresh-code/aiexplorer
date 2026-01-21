"use client";

interface SimpleAreaChartProps<T extends Record<string, unknown>> {
  data: T[];
  dataKey?: keyof T;
  xKey?: keyof T;
}

export function SimpleAreaChart<T extends Record<string, unknown>>({
  data,
  dataKey = "submissions",
  xKey = "month",
}: SimpleAreaChartProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };

  const values = data
    .map((d) => Number(d[dataKey]) || 0)
    .filter((value) => !Number.isNaN(value));
  const maxValue = Math.max(...values, 0);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((item, index) => {
    const rawValue = Number(item[dataKey]) || 0;
    const x =
      padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y =
      padding.top + chartHeight - ((rawValue - minValue) / range) * chartHeight;
    return { x, y, value: rawValue, label: String(item[xKey]) };
  });

  const createSmoothPath = (pts: typeof points) => {
    if (pts.length < 2) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i += 1) {
      const current = pts[i];
      const next = pts[i + 1];
      const midX = (current.x + next.x) / 2;
      path += ` Q ${current.x} ${current.y}, ${midX} ${
        (current.y + next.y) / 2
      }`;
      if (i < pts.length - 2) {
        path += ` T ${next.x} ${next.y}`;
      } else {
        path += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
      }
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${
    points[points.length - 1].x
  } ${padding.top + chartHeight} L ${padding.left} ${
    padding.top + chartHeight
  } Z`;

  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
    Math.round((maxValue / yAxisSteps) * i),
  );

  const formatMonth = (value: string) => {
    const date = new Date(`${value}-01`);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-US", { month: "short" });
  };

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {yAxisLabels.map((value, i) => {
          const y =
            padding.top +
            chartHeight -
            ((value - minValue) / range) * chartHeight;
          return (
            <g key={`grid-${value}-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#areaGradient)" />

        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, i) => (
          <g key={`point-${point.label}-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              fill="white"
              stroke="#6366f1"
              strokeWidth={3}
            >
              <title>{`${formatMonth(point.label)}: ${point.value}`}</title>
            </circle>
          </g>
        ))}

        {yAxisLabels.map((value) => {
          const y =
            padding.top +
            chartHeight -
            ((value - minValue) / range) * chartHeight;
          return (
            <text
              key={`y-label-${value}`}
              x={padding.left - 15}
              y={y}
              textAnchor="end"
              fontSize={14}
              fill="#6b7280"
              dominantBaseline="middle"
              fontWeight={500}
            >
              {value}
            </text>
          );
        })}

        {points.map((point) => (
          <text
            key={`x-label-${point.label}`}
            x={point.x}
            y={padding.top + chartHeight + 25}
            textAnchor="middle"
            fontSize={13}
            fill="#6b7280"
            fontWeight={500}
          >
            {formatMonth(point.label)}
          </text>
        ))}

        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#d1d5db"
          strokeWidth={2}
        />
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="#d1d5db"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
