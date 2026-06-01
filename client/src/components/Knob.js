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
    <div className="flex flex-col items-center gap-3" data-testid={testId}>
      <div
        ref={knobRef}
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing rounded-full"
        style={{
          width: size,
          height: size,
          background: `repeating-conic-gradient(#0A0A0F 0% 4%, #1E1E24 4% 8%)`,
          border: `2px solid #000`,
          boxShadow: dragging
            ? `0 0 15px ${color}40, 0 2px 5px rgba(0,0,0,0.8)`
            : `0 8px 15px rgba(0,0,0,0.9)`,
          transform: dragging ? 'scale(0.98)' : 'scale(1)',
          transition: 'transform 0.1s ease, box-shadow 0.1s ease'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="absolute w-[65%] h-[65%] rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, #2a2a35, #121215)',
          border: '1px solid #000',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
        }}>
          <div
            className="absolute w-1 rounded-full"
            style={{
              height: size * 0.25,
              top: '5%',
              background: color,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `center ${size * 0.27}px`,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </div>
      </div>
      <div className="text-center">
        <span className="font-data text-[9px] text-gray-500 uppercase tracking-widest block">{label}</span>
        <span className="font-display text-sm tracking-wider" style={{ color, textShadow: `0 0 10px ${color}80` }}>{value}</span>
      </div>
    </div>
  );
}
