import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, HSV } from '../utils/color';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [hsv, setHsv] = useState<HSV>(() => {
    const initialRgb = hexToRgb(color);
    return initialRgb ? rgbToHsv(initialRgb) : { h: 0, s: 1, v: 1 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging) return;
    const rgb = hexToRgb(color);
    if (rgb) {
      const newHsv = rgbToHsv(rgb);
      setHsv(prev => ({ h: newHsv.h, s: prev.s, v: prev.v }));
    }
  }, [color, isDragging]);

  const handleHueChange = useCallback((e: MouseEvent) => {
    if (!hueRef.current) return;
    const { width, left } = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(width, e.clientX - left));
    const newHue = (x / width) * 360;

    const newHsvState = { h: newHue, s: 1, v: 1 };
    const newColorHex = rgbToHex(hsvToRgb(newHsvState));
    
    setHsv(newHsvState);
    onChange(newColorHex);
  }, [onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleHueChange(e.nativeEvent);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleHueChange(moveEvent);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const hueX = (hsv.h / 360) * 100;

  return (
    <div className="space-y-4">
      <div
        ref={hueRef}
        className="relative w-full h-6 rounded-lg cursor-pointer"
        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute w-4 h-4 top-1/2 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hueX}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm themed-text-secondary">Выбранный цвет:</p>
        <div className="w-8 h-8 rounded-lg border themed-border" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
};

export default ColorPicker;
