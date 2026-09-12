import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { PromiseItem } from '../types';

interface Props {
  items: PromiseItem[];
  onChange: (items: PromiseItem[]) => void;
  editMode: boolean;
}

export default function PromisesWidget({ items, onChange, editMode }: Props) {
  const [draft, setDraft] = useState(items.map((i) => i.text).join('\n'));

  useEffect(() => {
    setDraft(items.map((i) => i.text).join('\n'));
  }, [items]);

  const commit = () => {
    const prevByText = new Map(items.map((i) => [i.text, i.checked]));
    const parsed = draft
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((text) => ({ text, checked: prevByText.get(text) ?? false }));
    onChange(parsed);
  };

  const toggle = (idx: number) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item)));
  };

  if (editMode) {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        placeholder={'약속을 한 줄씩 입력하세요.\n예)\n친구와 사이좋게 지내요\n차례를 지켜요'}
        className="h-40 w-full resize-none rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-3 text-base font-semibold text-gray-700 outline-none focus:border-rose-300"
      />
    );
  }

  if (items.length === 0) {
    return <p className="text-sm font-semibold text-gray-400">오늘의 약속을 등록해 주세요 ❤️</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx}>
          <button
            onClick={() => toggle(idx)}
            className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition-colors ${
              item.checked ? 'border-rose-200 bg-rose-50' : 'border-gray-100 bg-white/70'
            }`}
          >
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 ${
                item.checked ? 'border-rose-400 bg-rose-400 text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {item.checked && <Check size={16} strokeWidth={3} />}
            </span>
            <span
              className={`text-base font-bold ${
                item.checked ? 'text-rose-400 line-through' : 'text-gray-700'
              }`}
            >
              {item.text}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
