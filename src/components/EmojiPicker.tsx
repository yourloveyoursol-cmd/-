import React from 'react';
import { X } from 'lucide-react';
import { EMOJI_PRESETS } from '../types';

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-700">아이콘 선택</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_PRESETS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="flex aspect-square items-center justify-center rounded-xl text-2xl hover:bg-pink-50 active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
