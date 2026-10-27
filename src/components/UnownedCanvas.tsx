import React, { useRef, useState, useEffect } from 'react';
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
  const ORIGINAL_WIDTH = 548; // 外枠幅 542px + 左右マージン 6px = 548px

  // 外側レスポンシブコンテナの幅を監視し、スマホ表示時に縮小スケールを計算
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [canvasHeight, setCanvasHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (!wrapperRef.current) return;
      const availableWidth = wrapperRef.current.clientWidth;
      if (availableWidth < ORIGINAL_WIDTH) {
        // 画面幅（スマホ）に合わせて縮小（少し余白を持たせる）
        const newScale = Math.max(0.4, (availableWidth - 8) / ORIGINAL_WIDTH);
        setScale(newScale);
      } else {
        setScale(1);
      }

      if (canvasRef.current) {
        setCanvasHeight(canvasRef.current.offsetHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    if (canvasRef.current) observer.observe(canvasRef.current);

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [unownedCharacters, styleConfig]);

  return (
    <div
      ref={wrapperRef}
      className="w-full flex justify-center overflow-hidden py-1"
      style={{
        // スマホで transform: scale() を適用した際、周囲の要素との重なりや隙間を防ぐため高さをスケール分で確保
        height: scale < 1 && canvasHeight ? `${canvasHeight * scale}px` : 'auto',
      }}
    >
      {/* 
        画像出力対象のルートコンテナ (canvasRef)
        - 保存時はPC版と同一の高解像度・実寸（横幅542px）
        - スマホなどの画面幅が狭い端末では CSS transform: scale() により画面幅にピッタリ自動リサイズ
      */}
      <div
        ref={canvasRef}
        className="p-[3px] bg-transparent inline-block shrink-0 box-border origin-top"
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {/* 
          枠内本体
          - 横幅固定: 542px
          - 高さ: min-h の固定（420px等）を撤廃し、h-auto で行数（1行〜複数行）に応じて自然に伸縮
        */}
        <div
          style={{ width: '542px' }}
          className="h-auto rounded-xl border border-sky-300 bg-[#f4faff] shadow-sm p-3.5 font-rounded flex flex-col box-border select-none"
        >
          {/* タイトル行 */}
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
          <div className="flex justify-center items-stretch">
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
                <div className="h-20 flex items-center justify-center text-slate-400 text-xs font-bold">
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
                <div className="h-20 flex items-center justify-center text-slate-400 text-xs font-bold">
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
