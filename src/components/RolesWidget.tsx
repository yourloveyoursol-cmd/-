import React from 'react';
import { Plus, Trash2, UserRound } from 'lucide-react';
import { RoleAssignment } from '../types';

interface Props {
  roles: RoleAssignment[];
  onChange: (roles: RoleAssignment[]) => void;
  editMode: boolean;
}

export default function RolesWidget({ roles, onChange, editMode }: Props) {
  const update = (id: string, patch: Partial<RoleAssignment>) => {
    onChange(roles.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(roles.filter((r) => r.id !== id));

  const add = () => {
    onChange([...roles, { id: `role-${Date.now()}`, role: '새 역할', child: '' }]);
  };

  if (roles.length === 0 && !editMode) {
    return <p className="text-sm font-semibold text-gray-400">오늘의 역할을 등록해 주세요 🙌</p>;
  }

  return (
    <div className="space-y-2">
      {roles.map((r) =>
        editMode ? (
          <div key={r.id} className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2">
            <input
              value={r.role}
              onChange={(e) => update(r.id, { role: e.target.value })}
              placeholder="역할 이름"
              className="w-24 flex-shrink-0 rounded-lg border-2 border-dashed border-emerald-200 bg-white px-2 py-1 text-sm font-bold text-gray-700 outline-none"
            />
            <input
              value={r.child}
              onChange={(e) => update(r.id, { child: e.target.value })}
              placeholder="어린이 이름"
              className="min-w-0 flex-1 rounded-lg border-2 border-dashed border-emerald-200 bg-white px-2 py-1 text-sm font-bold text-gray-700 outline-none"
            />
            <button onClick={() => remove(r.id)} className="flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-emerald-100 hover:text-rose-500">
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div key={r.id} className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
            <span className="text-sm font-bold text-emerald-600">{r.role}</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-base font-black text-gray-700 shadow-sm">
              <UserRound size={16} className="text-emerald-400" />
              {r.child || '미정'}
            </span>
          </div>
        ),
      )}
      {editMode && (
        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-emerald-200 py-2 text-sm font-bold text-emerald-500 hover:bg-emerald-50"
        >
          <Plus size={16} /> 역할 추가
        </button>
      )}
    </div>
  );
}
