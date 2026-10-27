import React, { useState } from 'react';
import { PresetConfig } from '../types';
import { RECRUITMENT_OPTIONS } from '../utils/constants';
import { Bookmark, Plus, Trash2, X, Check, HelpCircle } from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: PresetConfig[];
  currentPresetValues: {
    title: string;
    minDate: string;
    maxDate: string;
    rarities: string[];
    recruitmentTypes: string[];
  };
  onSaveCurrentAsPreset: (name: string) => void;
  onLoadPreset: (preset: PresetConfig) => void;
  onDeletePreset: (id: string) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  presets,
  currentPresetValues,
  onSaveCurrentAsPreset,
  onLoadPreset,
  onDeletePreset,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetConfig | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveCurrentAsPreset(newPresetName.trim());
    setNewPresetName('');
    setShowAddForm(false);
  };

  const getRecruitmentLabels = (types: string[]) => {
    return RECRUITMENT_OPTIONS.filter((o) => types.includes(o.type))
      .map((o) => o.shortLabel)
      .join('・');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border-2 border-sky-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] font-rounded text-slate-800"
      >
        {/* モーダルヘッダー */}
        <div className="px-4 py-3 bg-gradient-to-r from-sky-50 via-white to-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-sm">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm text-slate-800">設定プリセット管理</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* モーダルコンテンツ */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* 現在の設定をプリセットとして保存するセクション */}
          <div className="bg-sky-50/60 rounded-xl border border-sky-100 p-3">
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-lg shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>現在の設定をプリセットに保存</span>
              </button>
            ) : (
              <form onSubmit={handleSave} className="space-y-2">
                <div className="font-bold text-sky-900 text-xs">新規プリセットとして保存</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="プリセット名を入力 (例: 恒常★3全期間)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-sky-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 text-xs"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-sm transition active:scale-95 shrink-0"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-lg transition shrink-0"
                  >
                    キャンセル
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 bg-white/70 p-2 rounded border border-sky-100">
                  保存内容：タイトル「{currentPresetValues.title}」 / 期間「{currentPresetValues.minDate || '最初'}〜{currentPresetValues.maxDate || '最新'}」 / レア「{currentPresetValues.rarities.join('・')}」 / 募集「{getRecruitmentLabels(currentPresetValues.recruitmentTypes)}」
                </div>
              </form>
            )}
          </div>

          {/* プリセット一覧 */}
          <div>
            <div className="font-extrabold text-slate-700 mb-2 flex items-center justify-between">
              <span>登録済みプリセット ({presets.length}件)</span>
              <span className="text-[10px] font-normal text-slate-400">タップして内容確認・読み込み</span>
            </div>

            <div className="space-y-2">
              {presets.map((preset) => {
                const isSelected = selectedPreset?.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`rounded-xl border transition overflow-hidden ${
                      isSelected
                        ? 'border-sky-400 ring-2 ring-sky-300 bg-sky-50/30'
                        : 'border-sky-100 bg-white hover:border-sky-300'
                    }`}
                  >
                    {/* プリセットタイトルバー（タップで詳細選択） */}
                    <div
                      onClick={() => setSelectedPreset(isSelected ? null : preset)}
                      className="p-3 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                        <span className="font-black text-xs text-slate-800">{preset.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {preset.minDate || '全期間'}〜{preset.maxDate || '最新'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`プリセット「${preset.name}」を削除しますか？`)) {
                              onDeletePreset(preset.id);
                              if (selectedPreset?.id === preset.id) setSelectedPreset(null);
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 rounded transition"
                          title="プリセットを削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* タップされたプリセットの設定内容表示 & 読込確認ボタン */}
                    {isSelected && (
                      <div className="px-3 pb-3 pt-1 border-t border-sky-100 bg-white/80 space-y-2 animate-in fade-in duration-100">
                        <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100/80 space-y-1.5 text-[11px]">
                          <div className="flex">
                            <span className="w-16 font-bold text-slate-500 shrink-0">タイトル:</span>
                            <span className="font-extrabold text-slate-800">{preset.title || '（なし）'}</span>
                          </div>
                          <div className="flex">
                            <span className="w-16 font-bold text-slate-500 shrink-0">実装日:</span>
                            <span className="font-extrabold text-slate-800">
                              {preset.minDate ? `${preset.minDate} から ` : '最初 から '}
                              {preset.maxDate ? `${preset.maxDate} まで` : '最新 まで'}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="w-16 font-bold text-slate-500 shrink-0">レア度:</span>
                            <span className="font-extrabold text-slate-800">{preset.rarities.join('・')}</span>
                          </div>
                          <div className="flex">
                            <span className="w-16 font-bold text-slate-500 shrink-0">募集区分:</span>
                            <span className="font-extrabold text-slate-800">{getRecruitmentLabels(preset.recruitmentTypes)}</span>
                          </div>
                        </div>

                        {/* 「読み込みますか？」の確認後に読み込み実行 */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-sky-800 text-[11px] flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                            この設定を読み込みますか？
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onLoadPreset(preset);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-extrabold rounded-lg shadow-sm transition active:scale-95 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>はい、読み込む</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {presets.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-sky-100 rounded-xl">
                  登録されたプリセットはありません
                </div>
              )}
            </div>
          </div>
        </div>

        {/* モーダルフッター */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
