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

  return (
    <div className="w-full flex justify-center py-1">
      {/* 
        画像出力対象のルートコンテナ (canvasRef)
        - CSS transform によるズレや被りを一切排除
        - 幅: 最大548px、画面幅がそれより狭いスマホ時は w-full でぴったり100%収まる
        - これにより通常のDOMフロー通り、行数が増えたら確実に下のリストを押し下げ、重なりが一切発生しません
      */}
      <div
        ref={canvasRef}
        className="w-full max-w-[548px] p-[3px] bg-transparent inline-block box-border"
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
            - 左：STRIKER 4列 (4fr)
            - 中央：仕切り線 (px-1.5〜3)
            - 右：SPECIAL 2列 (2fr)
            - 画面幅に応じて4:2の比率を維持したまま各アイコンが自然に縮小フィット
          */}
          <div className="flex justify-center items-stretch gap-1 sm:gap-2">
            {/* 左：STRIKER 4列 */}
            <div className="flex-[4] min-w-0">
              {strikers.length > 0 ? (
                <div className="grid grid-cols-4 gap-1 sm:gap-2 content-start">
                  {strikers.map((char) => (
                    <div key={char.id} className="w-full max-w-[76px] mx-auto">
                      <CharacterIcon
                        character={char}
                        size={undefined}
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

            {/* 右：SPECIAL 2列 */}
            <div className="flex-[2] min-w-0">
              {specials.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 sm:gap-2 content-start">
                  {specials.map((char) => (
                    <div key={char.id} className="w-full max-w-[76px] mx-auto">
                      <CharacterIcon
                        character={char}
                        size={undefined}
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
