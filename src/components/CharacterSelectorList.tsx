import React, { useState, useEffect, useMemo } from 'react';
import { Character, CanvasStyleConfig } from '../types';
import { CharacterIcon } from './CharacterIcon';
import { Download, Settings, X } from 'lucide-react';

interface CharacterSelectorListProps {
  characters: Character[];
  unownedIds: Set<string>;
  styleConfig: CanvasStyleConfig;
  onChangeStyle?: (next: CanvasStyleConfig) => void;
  onToggleUnowned: (char: Character) => void;
  listRef?: React.RefObject<HTMLDivElement | null>;
  onExportListPng?: () => Promise<void>;
  isExportingList?: boolean;
}

export const CharacterSelectorList: React.FC<CharacterSelectorListProps> = ({
  characters,
  unownedIds,
  styleConfig,
  onChangeStyle,
  onToggleUnowned,
  listRef,
  onExportListPng,
  isExportingList = false,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // スマホ版ではキャンバスと同じ列数に合わせる。PC版では設定されたlistStrikerColumns / listSpecialColumns (デフォルト: 8列 - 4列)
  const strikerCols = isMobile
    ? (styleConfig.strikerColumns || 4)
    : (styleConfig.listStrikerColumns || 8);
  const specialCols = isMobile
    ? (styleConfig.specialColumns || 2)
    : (styleConfig.listSpecialColumns || 4);

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
    <div className="space-y-3">
      {/* 
        画像保存対象のリスト枠コンテナ (listRef)
        - タイトルヘッダーは不要との要望により完全削除
        - 周囲に十分なパディング（p-3 sm:p-4）を確保し、端が欠けずに綺麗に画像出力
      */}
      <div
        ref={listRef}
        className="bg-white rounded-xl border border-sky-200 p-3 sm:p-4 shadow-sm font-rounded divide-y divide-sky-100 box-border"
      >
        {yearGroups.map(({ year, strikers, specials }) => (
          <div key={year} className="py-2.5 first:pt-0 last:pb-0">
            {/* 年ラベル */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                {year > 0 ? `${year}年` : 'その他'}
              </span>
              <div className="h-px bg-sky-100 flex-1" />
            </div>

            {/* 左右2列（左：STRIKER、右：SPECIAL）- 列数比率で綺麗に分割 */}
            <div className="flex items-start gap-1.5 sm:gap-3">
              {/* 左：STRIKER */}
              <div
                style={{ flex: strikerCols }}
                className="min-w-0 pr-1.5 sm:pr-2 border-r border-sky-100"
              >
                {strikers.length > 0 ? (
                  <div
                    className="grid gap-1 sm:gap-1.5 content-start"
                    style={{
                      gridTemplateColumns: `repeat(${strikerCols}, minmax(0, 1fr))`,
                    }}
                  >
                    {strikers.map((char) => (
                      <CharacterIcon
                        key={char.id}
                        character={char}
                        size={undefined}
                        borderRadius={styleConfig.borderRadius}
                        borderWidth={styleConfig.borderWidth}
                        borderColorMode={styleConfig.borderColorMode}
                        showCharacterName={false}
                        isUnowned={unownedIds.has(char.id)}
                        showUnownedOverlay={true}
                        onClick={onToggleUnowned}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-8 flex items-center justify-center text-slate-300 text-[10px]">
                    なし
                  </div>
                )}
              </div>

              {/* 右：SPECIAL */}
              <div
                style={{ flex: specialCols }}
                className="min-w-0 pl-0.5 sm:pl-1"
              >
                {specials.length > 0 ? (
                  <div
                    className="grid gap-1 sm:gap-1.5 content-start"
                    style={{
                      gridTemplateColumns: `repeat(${specialCols}, minmax(0, 1fr))`,
                    }}
                  >
                    {specials.map((char) => (
                      <CharacterIcon
                        key={char.id}
                        character={char}
                        size={undefined}
                        borderRadius={styleConfig.borderRadius}
                        borderWidth={styleConfig.borderWidth}
                        borderColorMode={styleConfig.borderColorMode}
                        showCharacterName={false}
                        isUnowned={unownedIds.has(char.id)}
                        showUnownedOverlay={true}
                        onClick={onToggleUnowned}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-8 flex items-center justify-center text-slate-300 text-[10px]">
                    なし
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 
        画面下部の生徒リストの一番下に配置する保存バー
        - PC版では「生徒リスト画像を保存」ボタンの左に⚙ボタンを設置し、リストの列数（ストライカー〇列 スペシャル〇列）を設定可能
      */}
      {onExportListPng && (
        <div className="flex items-center justify-center gap-2 pt-1 pb-4">
          {/* PC版のみ⚙設定ボタンを表示 */}
          {onChangeStyle && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-xl border text-xs font-bold transition shadow-sm active:scale-95 ${
                  isSettingsOpen
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-slate-600 border-sky-300 hover:bg-sky-50'
                }`}
                title="生徒リストの列数設定"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* 列数設定ポップオーバー */}
              {isSettingsOpen && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-xl border-2 border-sky-300 shadow-xl z-30 min-w-[260px] font-rounded text-xs space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-1 border-b border-sky-100">
                    <span className="font-black text-sky-900">リスト列数設定 (PC)</span>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-bold text-slate-600">ストライカー:</span>
                    <select
                      value={styleConfig.listStrikerColumns ?? 8}
                      onChange={(e) =>
                        onChangeStyle({
                          ...styleConfig,
                          listStrikerColumns: Number(e.target.value),
                        })
                      }
                      className="border border-sky-300 rounded px-2 py-0.5 font-bold text-slate-700 bg-white focus:outline-none focus:border-sky-500"
                    >
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16].map((n) => (
                        <option key={n} value={n}>
                          {n}列
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-600">スペシャル:</span>
                    <select
                      value={styleConfig.listSpecialColumns ?? 4}
                      onChange={(e) =>
                        onChangeStyle({
                          ...styleConfig,
                          listSpecialColumns: Number(e.target.value),
                        })
                      }
                      className="border border-sky-300 rounded px-2 py-0.5 font-bold text-slate-700 bg-white focus:outline-none focus:border-sky-500"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}列
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 生徒リスト画像保存ボタン */}
          <button
            type="button"
            onClick={onExportListPng}
            disabled={isExportingList}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:opacity-60 text-white text-xs font-black transition shadow-md shadow-sky-200 active:scale-95"
          >
            {isExportingList ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>リスト画像を出力中...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>生徒リスト画像を保存（PNG）</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
