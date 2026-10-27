import React from 'react';
import { Character, CanvasStyleConfig } from '../types';
import { CharacterIcon } from './CharacterIcon';

interface UnownedCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  unownedCharacters: Character[];
  styleConfig: CanvasStyleConfig;
  onRemoveUnowned: (char: Character) => void;
}

export const UnownedCanvas: React.FC<UnownedCanvasProps> = ({
  canvasRef,
  unownedCharacters,
  styleConfig,
  onRemoveUnowned,
}) => {
  const strikers = unownedCharacters.filter((c) => c.role === 'STRIKER');
  const specials = unownedCharacters.filter((c) => c.role === 'SPECIAL');

  const strikerColumns = styleConfig.strikerColumns || 4;
  const specialColumns = styleConfig.specialColumns || 2;
  const totalCols = strikerColumns + specialColumns;

  // アイコンの大きさ（最大76px）は変えずに、列数に合わせてキャンバスの横幅を自動補正
  // 4列-2列 (6列) の時は 6*76 + 4*8 + 60 = 548px
  const maxCanvasWidth = totalCols * 76 + Math.max(0, totalCols - 2) * 8 + 60;

  return (
    <div className="w-full flex justify-center py-1">
      {/* 
        画像出力対象のルートコンテナ (canvasRef)
        - 列数に応じた最大幅を維持し、スマホ等の小画面では w-full で100%綺麗に収まる
      */}
      <div
        ref={canvasRef}
        style={{ maxWidth: `${maxCanvasWidth}px` }}
        className="w-full p-[3px] bg-transparent inline-block box-border transition-all"
      >
        {/* 
          枠内本体
        */}
        <div className="w-full h-auto rounded-xl border border-sky-300 bg-[#f4faff] shadow-sm p-2 sm:p-3.5 font-rounded flex flex-col box-border select-none">
          {/* タイトル行 */}
          <div className="pt-0.5 pb-2 sm:pb-3 mb-2 sm:mb-3 border-b-2 border-sky-200 flex items-center justify-between shrink-0">
            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight truncate">
              {styleConfig.title || '未所持確定チケット候補生徒'}
            </h2>
            <span className="text-xs sm:text-sm font-extrabold text-sky-700 shrink-0 ml-2 sm:ml-3">
              未所持：{unownedCharacters.length}人
            </span>
          </div>

          {/* 
            キャンバス内アイコンエリア
            - 左：STRIKER (strikerColumns 列)
            - 中央：仕切り線
            - 右：SPECIAL (specialColumns 列)
          */}
          <div className="flex justify-center items-stretch gap-1 sm:gap-2">
            {/* 左：STRIKER */}
            <div style={{ flex: strikerColumns }} className="min-w-0">
              {strikers.length > 0 ? (
                <div
                  className="grid gap-1 sm:gap-2 content-start"
                  style={{
                    gridTemplateColumns: `repeat(${strikerColumns}, minmax(0, 1fr))`,
                  }}
                >
                  {strikers.map((char) => (
                    <div key={char.id} className="w-full max-w-[76px] mx-auto">
                      <CharacterIcon
                        character={char}
                        size={undefined}
                        borderRadius={styleConfig.borderRadius}
                        borderWidth={styleConfig.borderWidth}
                        borderColorMode={styleConfig.borderColorMode}
                        isUnowned={true}
                        showUnownedOverlay={false}
                        onClick={() => onRemoveUnowned(char)}
                        titlePrefix="【クリックで所持済に戻す】"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-16 sm:h-20 flex items-center justify-center text-slate-400 text-xs font-bold">
                  STRIKER なし
                </div>
              )}
            </div>

            {/* 中央仕切り線 */}
            <div className="flex items-stretch justify-center px-1 sm:px-2.5 shrink-0">
              <div className="w-[1.5px] bg-sky-300 h-full rounded-full self-stretch" />
            </div>

            {/* 右：SPECIAL */}
            <div style={{ flex: specialColumns }} className="min-w-0">
              {specials.length > 0 ? (
                <div
                  className="grid gap-1 sm:gap-2 content-start"
                  style={{
                    gridTemplateColumns: `repeat(${specialColumns}, minmax(0, 1fr))`,
                  }}
                >
                  {specials.map((char) => (
                    <div key={char.id} className="w-full max-w-[76px] mx-auto">
                      <CharacterIcon
                        character={char}
                        size={undefined}
                        borderRadius={styleConfig.borderRadius}
                        borderWidth={styleConfig.borderWidth}
                        borderColorMode={styleConfig.borderColorMode}
                        isUnowned={true}
                        showUnownedOverlay={false}
                        onClick={() => onRemoveUnowned(char)}
                        titlePrefix="【クリックで所持済に戻す】"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-16 sm:h-20 flex items-center justify-center text-slate-400 text-xs font-bold">
                  SPECIAL なし
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
