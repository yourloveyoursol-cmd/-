import React from 'react';
import { Minus, Plus, Users, UserCheck, UserX } from 'lucide-react';
import { DayData } from '../types';

interface Props {
  attendance: DayData['attendance'];
  onChange: (attendance: DayData['attendance']) => void;
}

function Counter({
  icon,
  label,
  value,
  color,
  onDelta,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  onDelta: (delta: number) => void;
}) {
  return (
    <div className={`flex flex-1 flex-col items-center rounded-2xl p-3 ${color}`}>
      <div className="mb-1 flex items-center gap-1 text-sm font-bold text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mb-2 text-4xl font-black text-gray-800">{value}</div>
      <div className="flex gap-2">
        <button
          onClick={() => onDelta(-1)}
          className="rounded-full bg-white p-1.5 shadow active:scale-90"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => onDelta(1)}
          className="rounded-full bg-white p-1.5 shadow active:scale-90"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function AttendanceWidget({ attendance, onChange }: Props) {
  const clamp = (n: number) => Math.max(0, n);
  return (
    <div className="flex gap-3">
      <Counter
        icon={<Users size={16} />}
        label="총 원아"
        value={attendance.total}
        color="bg-sky-50"
        onDelta={(d) => onChange({ ...attendance, total: clamp(attendance.total + d) })}
      />
      <Counter
        icon={<UserCheck size={16} />}
        label="출석"
        value={attendance.present}
        color="bg-emerald-50"
        onDelta={(d) => onChange({ ...attendance, present: clamp(attendance.present + d) })}
      />
      <Counter
        icon={<UserX size={16} />}
        label="결석"
        value={attendance.absent}
        color="bg-rose-50"
        onDelta={(d) => onChange({ ...attendance, absent: clamp(attendance.absent + d) })}
      />
    </div>
  );
}
