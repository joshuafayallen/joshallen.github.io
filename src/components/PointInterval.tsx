import React, { useMemo } from 'react';


const PointInterval = ({ stats, domainMin, domainMax, width, height = 36, color }) => {

  const { lo94, hi94, mean, barY, px } = useMemo(() => {
    const mean = stats?.mean ?? 0;
    const lo94 = stats?.['hdi_3%'] ?? stats?.lo95 ?? 0;
    const hi94 = stats?.['hdi_97%'] ?? stats?.hi95 ?? 0;
    const barY = height / 2;
    const px = v => {
      const range = domainMax - domainMin;
      if (range === 0 || isNaN(range)) return 0;
      return ((v - domainMin) / range) * width;
    };
    return { lo94, hi94, mean, barY, px };
  }, [stats, domainMin, domainMax, width, height]);

  // Guard AFTER hooks
  if (!stats) return null;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {/* 94% HDI Line */}
      <line
        x1={px(lo94)} x2={px(hi94)}
        y1={barY} y2={barY}
        stroke={color} strokeWidth={1.5} strokeOpacity={0.5}
        strokeLinecap="round"
      />
  
     
      {/* Mean Dot */}
      <circle
        cx={px(mean)} cy={barY} r={5}
        fill={color} stroke="#0a192f" strokeWidth={2}
      />
    </svg>
  );
};

export default PointInterval;