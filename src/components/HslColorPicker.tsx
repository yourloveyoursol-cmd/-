import React from 'react';
import { X } from 'lucide-react';
import { HSL, hslToCss } from '../types';

interface Props {
  title: string;
  value: HSL;
  onChange: (hsl: HSL) => void;
  onClose: () => void;
}

const SLIDERS: { key: keyof HSL; label: string; max: number }[] = [
  { key: 'h', label: '색상 (Hue)', max: 360 },
  { key: 's', label: '채도 (Saturation)', max: 100 },
  { key: 'l', label: '밝기 (Lightness)', max: 100 },
];

export default function HslColorPicker({ title, value, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-700">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div
          className="mb-5 h-16 w-full rounded-2xl border-4 border-white shadow-inner"
          style={{ backgroundColor: hslToCss(value) }}
        />

        <div className="space-y-4">
          {SLIDERS.map(({ key, label, max }) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm font-semibold text-gray-500">
                <span>{label}</span>
                <span>{value[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={max}
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
                className="w-full accent-pink-400"
              />
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-gray-100 py-2 font-bold text-gray-600 hover:bg-gray-200"
        >
          완료
        </button>
      </div>
    </div>
  );
}
