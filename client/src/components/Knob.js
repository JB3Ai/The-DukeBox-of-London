import React, { useState, useRef, useCallback } from 'react';

export default function Knob({ label, value = 50, onChange, size = 80, color = '#00E6F2', testId }) {
  const [dragging, setDragging] = useState(false);
  const knobRef = useRef(null);
  const startY = useRef(0);
  const startVal = useRef(value);

  const rotation = ((value / 100) * 270) - 135;

  const handlePointerDown = useCallback((e) => {
    setDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    e.target.setPointerCapture(e.pointerId);
  }, [value]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const delta = (startY.current - e.clientY) * 0.5;
    const newVal = Math.max(0, Math.min(100, startVal.current + delta));
    onChange?.(Math.round(newVal));
  }, [dragging, onChange]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2" data-testid={testId}>
      <div
        ref={knobRef}
        className="knob relative flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          width: size,
          height: size,
          boxShadow: dragging
            ? `0 0 20px ${color}40, 0 4px 10px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)`
            : '0 4px 10px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Indicator line */}
        <div
          className="absolute w-0.5 rounded-full"
          style={{
            height: size * 0.3,
            top: '10%',
            background: color,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `center ${size * 0.4}px`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        {/* Center dot */}
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <span className="font-data text-xs text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="font-data text-xs" style={{ color }}>{value}%</span>
    </div>
  );
}
