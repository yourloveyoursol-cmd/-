import React, { useEffect, useState } from 'react';

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
  editMode: boolean;
}

export default function ActivityTimeline({ items, onChange, editMode }: Props) {
  const [draft, setDraft] = useState(items.join('\n'));

  useEffect(() => {
    setDraft(items.join('\n'));
  }, [items]);

  const commit = () => {
    const parsed = draft
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onChange(parsed);
  };

  if (editMode) {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        placeholder={'활동을 순서대로 한 줄씩 입력하세요.\n예)\n아침모임\n자유놀이\n점심시간'}
        className="h-40 w-full resize-none rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-3 text-base font-semibold text-gray-700 outline-none focus:border-orange-300"
      />
    );
  }

  if (items.length === 0) {
    return <p className="text-sm font-semibold text-gray-400">오늘의 활동을 등록해 주세요 🎨</p>;
  }

  return (
    <ol className="space-y-0">
      {items.map((item, idx) => (
        <li key={idx} className="relative flex items-start gap-3 pb-4 last:pb-0">
          {idx < items.length - 1 && (
            <span className="absolute left-[13px] top-7 h-full w-0.5 bg-orange-200" aria-hidden />
          )}
          <span className="z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-400 text-sm font-black text-white shadow">
            {idx + 1}
          </span>
          <span className="pt-0.5 text-base font-bold text-gray-700">{item}</span>
        </li>
      ))}
    </ol>
  );
}
