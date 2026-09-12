import React from 'react';

interface Props {
  text: string;
  onChange: (text: string) => void;
  editMode: boolean;
}

export default function DailyMessageWidget({ text, onChange, editMode }: Props) {
  if (editMode) {
    return (
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="오늘 아이들에게 전하고 싶은 한마디를 적어주세요."
        className="h-24 w-full resize-none rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-3 text-base font-semibold text-gray-700 outline-none focus:border-pink-300"
      />
    );
  }
  return (
    <p className="whitespace-pre-wrap text-lg font-bold leading-relaxed text-gray-700">
      {text || '오늘의 한마디를 등록해 주세요 💌'}
    </p>
  );
}
