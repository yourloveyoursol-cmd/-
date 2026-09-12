import React, { useEffect, useState } from 'react';
import { RotateCw, Loader2, Info } from 'lucide-react';
import { MealState } from '../types';
import { splitMenuLines, classifyToTray } from '../lib/mealParser';
import { fetchMealFromNeis } from '../lib/meal';
import { formatKorean } from '../lib/date';

interface Props {
  meal: MealState;
  onChange: (meal: MealState) => void;
  editMode: boolean;
  date: string;
}

function TrayCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-2 text-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
      <span className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-300">{label}</span>
      <span className="text-sm font-black leading-tight text-gray-700">{value || '-'}</span>
    </div>
  );
}

export default function MealTrayWidget({ meal, onChange, editMode, date }: Props) {
  const [draft, setDraft] = useState(meal.rawInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(meal.rawInput);
  }, [meal.rawInput]);

  const commit = () => {
    const items = splitMenuLines(draft);
    const tray = classifyToTray(items);
    onChange({ ...meal, rawInput: draft, tray, source: 'manual', isSubstitute: false, note: undefined });
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMealFromNeis(date);
      onChange({
        rawInput: result.items.join('\n'),
        tray: result.tray,
        source: 'neis',
        fetchedDate: result.actualDate,
        isSubstitute: result.isSubstitute,
        note: result.note,
        updatedAt: new Date().toISOString(),
      });
    } catch (e: any) {
      setError(e?.message || '급식 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-600 hover:bg-violet-200 active:scale-95 disabled:opacity-50"
          title="나이스 급식 정보 새로고침"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
          급식 새로고침
        </button>
        {meal.source === 'neis' && meal.fetchedDate && (
          <span className="text-[11px] font-semibold text-gray-400">나이스 연동 · {formatKorean(meal.fetchedDate)}</span>
        )}
      </div>

      {meal.isSubstitute && meal.note && (
        <div className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>{meal.note}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">{error}</div>
      )}

      {/* 급식 식판 */}
      <div className="rounded-[1.75rem] border-[3px] border-gray-200 bg-gray-100 p-3 shadow-inner">
        <div className="mb-2 grid grid-cols-4 gap-2">
          {meal.tray.sides.map((side, idx) => (
            <TrayCell key={idx} label={`반찬${idx + 1}`} value={side} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TrayCell label="밥" value={meal.tray.rice} />
          <TrayCell label="국" value={meal.tray.soup} />
        </div>
      </div>

      {editMode && (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          placeholder={'메뉴를 한 줄씩 입력하세요.\n예)\n흑미밥\n미역국\n제육볶음\n김치\n우유'}
          className="h-28 w-full resize-none rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-3 text-sm font-semibold text-gray-700 outline-none focus:border-violet-300"
        />
      )}
    </div>
  );
}
