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

  // キャンバス専用アイコンサイズ（76px固定）
  const CANVAS_ICON_SIZE = 76;
  const GAP = 8; // アイコン間の隙間 (8px)

  return (
    <div className="w-full flex justify-center overflow-x-auto py-1">
      {/* 
        画像出力対象のルートコンテナ (canvasRef)
        - 外枠の外に3pxの余白を設ける (p-[3px])
        - 外枠の外側は透過 (bg-transparent)
      */}
      <div
        ref={canvasRef}
        className="p-[3px] bg-transparent inline-block shrink-0 box-border"
      >
        {/* 
          枠内本体
          - 背景色: かなり薄い水色 (bg-[#f4faff])
          - 外枠ボーダー: 薄い青 (#7dd3fc または border-sky-300) で背景・透過境界をくっきり視認可能に
          - 幅: 内側パディング(14px*2) + STRIKER 4列(328px) + 余白(12px) + 仕切り線(1.5px) + 余白(12px) + SPECIAL 2列(160px) = 541.5px (約542px)
          - 高さ: min-h-[420px] h-auto
        */}
        <div
          style={{ width: '542px' }}
          className="min-h-[420px] h-auto rounded-xl border border-sky-300 bg-[#f4faff] shadow-sm p-3.5 font-rounded flex flex-col box-border select-none"
        >
          {/* タイトル行：仕切り線の色を濃く (border-sky-200) */}
          <div className="pt-1 pb-3 mb-3 border-b-2 border-sky-200 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-black text-slate-800 tracking-tight truncate">
              {styleConfig.title || '未所持確定チケット候補生徒'}
            </h2>
            <span className="text-sm font-extrabold text-sky-700 shrink-0 ml-3">
              未所持：{unownedCharacters.length}人
            </span>
          </div>

          {/* 
            キャンバス内アイコンエリア
            - 左：STRIKER 4列 (76*4 + 8*3 = 328px)
            - 中央：少し余白(左右12px)を設けた上で、濃い水色の独立した垂直仕切り線 (w-[1.5px] bg-sky-300) を配置
            - 右：SPECIAL 2列 (76*2 + 8*1 = 160px)
          */}
          <div className="flex-1 flex justify-center items-stretch">
            {/* 左：STRIKER（4人固定、幅328px） */}
            <div style={{ width: '328px' }} className="shrink-0">
              {strikers.length > 0 ? (
                <div
                  className="grid grid-cols-4 content-start"
                  style={{ gap: `${GAP}px`, width: '328px' }}
                >
                  {strikers.map((char) => (
                    <CharacterIcon
                      key={char.id}
                      character={char}
                      size={CANVAS_ICON_SIZE}
                      borderRadius={styleConfig.borderRadius}
                      borderWidth={styleConfig.borderWidth}
                      borderColorMode={styleConfig.borderColorMode}
                      showIndicatorDots={styleConfig.showIndicatorDots}
                      showCharacterName={false}
                      isUnowned={true}
                      showUnownedOverlay={false}
                      onClick={() => onRemoveUnowned(char)}
                      titlePrefix="【クリックで所持済に戻す】"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-bold">
                  STRIKER なし
                </div>
              )}
            </div>

            {/* ストライカーとスペシャルの間の余白 ＆ はっきり見える仕切り線 */}
            <div className="flex items-stretch justify-center px-3 shrink-0">
              <div className="w-[1.5px] bg-sky-300 h-full rounded-full self-stretch" />
            </div>

            {/* 右：SPECIAL（2人固定、幅160px） */}
            <div style={{ width: '160px' }} className="shrink-0">
              {specials.length > 0 ? (
                <div
                  className="grid grid-cols-2 content-start"
                  style={{ gap: `${GAP}px`, width: '160px' }}
                >
                  {specials.map((char) => (
                    <CharacterIcon
                      key={char.id}
                      character={char}
                      size={CANVAS_ICON_SIZE}
                      borderRadius={styleConfig.borderRadius}
                      borderWidth={styleConfig.borderWidth}
                      borderColorMode={styleConfig.borderColorMode}
                      showIndicatorDots={styleConfig.showIndicatorDots}
                      showCharacterName={false}
                      isUnowned={true}
                      showUnownedOverlay={false}
                      onClick={() => onRemoveUnowned(char)}
                      titlePrefix="【クリックで所持済に戻す】"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-bold">
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
