import React from 'react';
import { Character, BorderColorMode } from '../types';
import { ATTACK_COLORS, DEFENSE_COLORS } from '../utils/constants';

interface CharacterIconProps {
  character: Character;
  size?: number; // 指定なしの場合は親要素の横幅100%に追従
  borderRadius?: number;
  borderWidth?: number;
  borderColorMode?: BorderColorMode;
  isUnowned?: boolean; // 下部リストでの「未」グレー表示用
  showUnownedOverlay?: boolean; // true のとき isUnowned ならグレー＋「未」を表示
  onClick?: (char: Character, e: React.MouseEvent) => void;
  titlePrefix?: string;
}

export const CharacterIcon: React.FC<CharacterIconProps> = ({
  character,
  size,
  borderRadius = 8,
  borderWidth = 2,
  borderColorMode = 'none',
  isUnowned = false,
  showUnownedOverlay = false,
  onClick,
  titlePrefix = '',
}) => {
  const atkColor = ATTACK_COLORS[character.attack_type]?.border || '#64748b';
  const defColor = DEFENSE_COLORS[character.defense_type]?.border || '#64748b';

  let computedBorderColor = '#cbd5e1'; // デフォルトの薄い水色/スレート枠
  if (borderColorMode === 'attack') {
    computedBorderColor = atkColor;
  } else if (borderColorMode === 'defense') {
    computedBorderColor = defColor;
  } else if (borderColorMode === 'role') {
    computedBorderColor = character.role === 'STRIKER' ? '#ef4444' : '#0284c7';
  }

  const effectiveBorderWidth = borderColorMode === 'none' ? Math.min(1, borderWidth) : borderWidth;
  const isGrayed = showUnownedOverlay && isUnowned;

  const tooltip = `${titlePrefix ? titlePrefix + '\n' : ''}${character.name} (${character.rarity})\n実装日: ${character.release_date} (${character.recruitment_label})\n部隊: ${character.role} / ${character.class} (${character.school})\n攻撃: ${character.attack_type} / 防御: ${character.defense_type}`;

  return (
    <div
      onClick={(e) => onClick?.(character, e)}
      className="flex flex-col items-center select-none group w-full"
      style={size ? { width: `${size}px` } : undefined}
      title={tooltip}
    >
      <div
        style={{
          width: size ? `${size}px` : '100%',
          aspectRatio: '1 / 1',
          borderRadius: `${borderRadius}px`,
          borderWidth: `${effectiveBorderWidth}px`,
          borderStyle: effectiveBorderWidth > 0 ? 'solid' : 'none',
          borderColor: isGrayed ? '#94a3b8' : computedBorderColor,
          boxSizing: 'border-box',
        }}
        className={`relative overflow-hidden bg-white shadow-sm transition-all duration-150 ${
          onClick ? 'cursor-pointer active:scale-95 hover:shadow-md hover:-translate-y-0.5' : ''
        } ${
          isGrayed
            ? 'ring-2 ring-slate-500/70'
            : onClick
            ? 'hover:ring-2 hover:ring-sky-400'
            : ''
        }`}
      >
        {/* 生徒アイコン画像 */}
        <img
          src={character.icon}
          alt={character.name}
          className={`w-full h-full object-cover pointer-events-none block transition-all duration-150 ${
            isGrayed ? 'grayscale brightness-[0.45] contrast-125' : ''
          }`}
          draggable={false}
        />

        {/* 端の馴染ませ用ソフトインナーシャドウ */}
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-black/10" />

        {/* 下部リストで未所持選択された際の「未」オーバーレイ表示 */}
        {isGrayed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-slate-900/35">
            <span
              className="font-rounded font-black text-white select-none tracking-wider flex items-center justify-center rounded-md px-1.5 py-0.5 text-base sm:text-xl"
              style={{
                lineHeight: 1,
                textShadow: '0 2px 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.95)',
              }}
            >
              未
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
