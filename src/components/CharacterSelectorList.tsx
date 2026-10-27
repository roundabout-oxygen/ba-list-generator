import React, { useMemo } from 'react';
import { Character, CanvasStyleConfig } from '../types';
import { CharacterIcon } from './CharacterIcon';

interface CharacterSelectorListProps {
  characters: Character[];
  unownedIds: Set<string>;
  styleConfig: CanvasStyleConfig;
  onToggleUnowned: (char: Character) => void;
}

export const CharacterSelectorList: React.FC<CharacterSelectorListProps> = ({
  characters,
  unownedIds,
  styleConfig,
  onToggleUnowned,
}) => {
  // 実装年ごとにグループ化
  // 要求：下部リストは「最近のが手前の左上に来る並び」（年：2026年→古い年、各年内も新しい順）
  const yearGroups = useMemo(() => {
    const map = new Map<number, Character[]>();
    for (const c of characters) {
      const y = c.release_year || 0;
      if (!map.has(y)) {
        map.set(y, []);
      }
      map.get(y)!.push(c);
    }

    // 年は降順（新しい年が一番上・手前）
    const sortedYears = Array.from(map.keys()).sort((a, b) => b - a);

    return sortedYears.map((year) => {
      const list = map.get(year)!;

      // 年内の生徒も新しい順（降順：release_date 降順 -> impl_order 降順）
      // これにより左上から右へ、手前（上部）に最新生徒が並びます
      const sortedNewestFirst = [...list].sort((a, b) => {
        const dateA = a.release_date || '0000/00/00';
        const dateB = b.release_date || '0000/00/00';
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (b.impl_order || 0) - (a.impl_order || 0);
      });

      return {
        year,
        strikers: sortedNewestFirst.filter((c) => c.role === 'STRIKER'),
        specials: sortedNewestFirst.filter((c) => c.role === 'SPECIAL'),
      };
    });
  }, [characters]);

  if (characters.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-sky-200 p-8 text-center text-slate-400 text-xs font-bold">
        該当する生徒が見つかりません。
      </div>
    );
  }

  return (
    /* 1つの枠に収める */
    <div className="bg-white rounded-xl border border-sky-200 p-3 shadow-sm divide-y divide-sky-100">
      {yearGroups.map(({ year, strikers, specials }) => (
        <div key={year} className="py-2.5 first:pt-0 last:pb-0">
          {/* 年ラベル（小分けの箱にはせず、シンプルな区切りラベルのみ） */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              {year > 0 ? `${year}年` : 'その他'}
            </span>
            <div className="h-px bg-sky-100 flex-1" />
          </div>

          {/* 左右2列（左65%：STRIKER、右35%：SPECIAL） */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: '65% 35%' }}
          >
            {/* 左：STRIKER（最新が手前・左上） */}
            <div className="flex flex-wrap gap-1 content-start pr-1.5 border-r border-sky-100 min-h-[44px]">
              {strikers.map((char) => (
                <CharacterIcon
                  key={char.id}
                  character={char}
                  size={styleConfig.iconSize}
                  borderRadius={styleConfig.borderRadius}
                  borderWidth={styleConfig.borderWidth}
                  borderColorMode={styleConfig.borderColorMode}
                  showIndicatorDots={styleConfig.showIndicatorDots}
                  showCharacterName={false}
                  isUnowned={unownedIds.has(char.id)}
                  showUnownedOverlay={true}
                  onClick={onToggleUnowned}
                />
              ))}
            </div>

            {/* 右：SPECIAL（最新が手前・左上） */}
            <div className="flex flex-wrap gap-1 content-start pl-1 min-h-[44px]">
              {specials.map((char) => (
                <CharacterIcon
                  key={char.id}
                  character={char}
                  size={styleConfig.iconSize}
                  borderRadius={styleConfig.borderRadius}
                  borderWidth={styleConfig.borderWidth}
                  borderColorMode={styleConfig.borderColorMode}
                  showIndicatorDots={styleConfig.showIndicatorDots}
                  showCharacterName={false}
                  isUnowned={unownedIds.has(char.id)}
                  showUnownedOverlay={true}
                  onClick={onToggleUnowned}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
