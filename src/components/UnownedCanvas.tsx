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
  const ORIGINAL_WIDTH = 548; // 外枠542px + マージン6px

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const containerWidth = wrapperRef.current.clientWidth;
      if (containerWidth > 0 && containerWidth < ORIGINAL_WIDTH) {
        const s = containerWidth / ORIGINAL_WIDTH;
        setScale(s);
        if (canvasRef.current) {
          setScaledHeight(canvasRef.current.offsetHeight * s);
        }
      } else {
        setScale(1);
        setScaledHeight(undefined);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    if (canvasRef.current) observer.observe(canvasRef.current);

    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, [unownedCharacters, styleConfig]);

  return (
    <div className="w-full flex justify-center py-1">
      {/* 
        外側レスポンシブコンテナ
        - 横幅最大100%
        - 高さは scale 適用時の実高さを反映（初期値は auto）
      */}
      <div
        ref={wrapperRef}
        className="w-full max-w-[548px] flex justify-center overflow-visible"
        style={{
          height: scaledHeight !== undefined ? `${scaledHeight}px` : 'auto',
          minHeight: '60px',
        }}
      >
        {/* 
          画像出力対象のルートコンテナ (canvasRef)
          - 幅548px固定
          - スマホ時は scale() で中央基準に縮小
        */}
        <div
          ref={canvasRef}
          className="p-[3px] bg-transparent inline-block shrink-0 box-border origin-top"
          style={{
            width: `${ORIGINAL_WIDTH}px`,
            transform: scale < 1 ? `scale(${scale})` : undefined,
          }}
        >
          {/* 
            枠内本体
            - 横幅固定: 542px
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
              - 中央：仕切り線
              - 右：SPECIAL 2列 (76*2 + 8*1 = 160px)
            */}
            <div className="flex justify-center items-stretch">
              {/* 左：STRIKER */}
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

              {/* 仕切り線 */}
              <div className="flex items-stretch justify-center px-3 shrink-0">
                <div className="w-[1.5px] bg-sky-300 h-full rounded-full self-stretch" />
              </div>

              {/* 右：SPECIAL */}
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
    </div>
  );
};
