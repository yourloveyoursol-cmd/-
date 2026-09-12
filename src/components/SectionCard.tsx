import React, { useState } from 'react';
import { Eye, EyeOff, Palette } from 'lucide-react';
import { SectionMeta, hslToCss } from '../types';
import EmojiPicker from './EmojiPicker';
import HslColorPicker from './HslColorPicker';

interface Props {
  meta: SectionMeta;
  onMetaChange: (meta: SectionMeta) => void;
  editMode: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ meta, onMetaChange, editMode, children, className = '' }: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!meta.visible && !editMode) return null;

  return (
    <section
      className={`flex flex-col rounded-[2rem] border-4 border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-opacity ${
        !meta.visible ? 'opacity-40' : ''
      } ${className}`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            disabled={!editMode}
            onClick={() => setShowEmojiPicker(true)}
            className={`text-3xl leading-none ${editMode ? 'rounded-full hover:bg-gray-100 active:scale-90' : ''}`}
            title={editMode ? '아이콘 변경' : undefined}
          >
            {meta.emoji}
          </button>
          {editMode ? (
            <input
              value={meta.title}
              onChange={(e) => onMetaChange({ ...meta, title: e.target.value })}
              style={{ color: hslToCss(meta.titleColor) }}
              className="min-w-0 flex-1 rounded-lg border-2 border-dashed border-gray-200 bg-transparent px-2 py-0.5 text-xl font-black outline-none focus:border-gray-300"
            />
          ) : (
            <h2 className="text-outline truncate text-xl font-black" style={{ color: hslToCss(meta.titleColor) }}>
              {meta.title}
            </h2>
          )}
        </div>

        {editMode && (
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={() => setShowColorPicker(true)}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-90"
              title="제목 색상"
            >
              <Palette size={18} />
            </button>
            <button
              onClick={() => onMetaChange({ ...meta, visible: !meta.visible })}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-90"
              title={meta.visible ? '섹션 숨기기' : '섹션 표시하기'}
            >
              {meta.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1">{children}</div>

      {showEmojiPicker && (
        <EmojiPicker onSelect={(emoji) => onMetaChange({ ...meta, emoji })} onClose={() => setShowEmojiPicker(false)} />
      )}
      {showColorPicker && (
        <HslColorPicker
          title={`${meta.title} 제목 색상`}
          value={meta.titleColor}
          onChange={(titleColor) => onMetaChange({ ...meta, titleColor })}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </section>
  );
}
