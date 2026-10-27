import React from 'react';
import { Character, BorderColorMode } from '../types';
import { ATTACK_COLORS, DEFENSE_COLORS } from '../utils/constants';

interface CharacterIconProps {
  character: Character;
  size?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColorMode?: BorderColorMode;
  showIndicatorDots?: boolean;
  showCharacterName?: boolean;
  isUnowned?: boolean; // 下部リストでの「未」グレー表示用
  showUnownedOverlay?: boolean; // true のとき isUnowned ならグレー＋「未」を表示
  onClick?: (char: Character, e: React.MouseEvent) => void;
  titlePrefix?: string;
}

export const CharacterIcon: React.FC<CharacterIconProps> = ({
  character,
  size = 60,
  borderRadius = 8,
  borderWidth = 2,
  borderColorMode = 'none',
  showIndicatorDots = false,
  showCharacterName = false,
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
      className="inline-flex flex-col items-center select-none group"
      style={{ width: `${size}px` }}
      title={tooltip}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
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
          style={{ aspectRatio: '1 / 1' }}
          className={`w-full h-full object-cover pointer-events-none block transition-all duration-150 ${
            isGrayed ? 'grayscale brightness-[0.45] contrast-125' : ''
          }`}
          loading="lazy"
          draggable={false}
        />

        {/* 端の馴染ませ用ソフトインナーシャドウ (ba-icon-canvas 準拠) */}
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-black/10" />

        {/* 攻撃・防御のインジケータードット (ba-icon-canvas 準拠) */}
        {showIndicatorDots && (
          <div className="absolute top-1 left-1 flex gap-0.5 pointer-events-none z-10">
            <span
              className="w-2 h-2 rounded-full shadow border border-white/80"
              style={{ backgroundColor: atkColor }}
            />
            <span
              className="w-2 h-2 rounded-full shadow border border-white/80"
              style={{ backgroundColor: defColor }}
            />
          </div>
        )}

        {/* 下部リストで未所持選択された際の「未」オーバーレイ表示 */}
        {isGrayed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-slate-900/35">
            <span
              className="font-rounded font-black text-white select-none tracking-wider flex items-center justify-center rounded-md px-1.5 py-0.5"
              style={{
                fontSize: `${Math.max(14, Math.round(size * 0.36))}px`,
                lineHeight: 1,
                textShadow: '0 2px 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.95)',
              }}
            >
              未
            </span>
          </div>
        )}
      </div>

      {/* オプション：生徒名ラベル表示 */}
      {showCharacterName && (
        <span
          className={`mt-1 w-full text-center truncate font-bold leading-tight ${
            isGrayed ? 'text-slate-400' : 'text-slate-700'
          }`}
          style={{ fontSize: `${Math.max(9, Math.round(size * 0.16))}px` }}
        >
          {character.name}
        </span>
      )}
    </div>
  );
};
