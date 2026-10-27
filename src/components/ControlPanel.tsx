import React, { useState, useEffect, useRef } from 'react';
import {
  FilterConfig,
  CanvasStyleConfig,
  RecruitmentType,
  BorderColorMode,
  PresetConfig,
} from '../types';
import {
  RECRUITMENT_OPTIONS,
  DEFAULT_MAX_DATE,
  ATTACK_COLORS,
  DEFENSE_COLORS,
  DEFENSE_SHORT_LABELS,
} from '../utils/constants';
import { PresetModal } from './PresetModal';
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Bookmark,
} from 'lucide-react';

interface ControlPanelProps {
  filterConfig: FilterConfig;
  onChangeFilter: (next: FilterConfig) => void;
  styleConfig: CanvasStyleConfig;
  onChangeStyle: (next: CanvasStyleConfig) => void;
  schools: string[];
  totalFilteredCount: number;
  unownedCount: number;
  onSelectAllUnowned: () => void;
  onClearAllUnowned: () => void;
  onResetDefaultFilter: () => void;
  onExportPng: () => Promise<void>;
  onCopyClipboard: () => Promise<boolean>;
  presets: PresetConfig[];
  onSaveCurrentAsPreset: (name: string) => void;
  onLoadPreset: (preset: PresetConfig) => void;
  onDeletePreset: (id: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  filterConfig,
  onChangeFilter,
  styleConfig,
  onChangeStyle,
  schools,
  totalFilteredCount,
  unownedCount,
  onSelectAllUnowned,
  onClearAllUnowned,
  onResetDefaultFilter,
  onExportPng,
  onCopyClipboard,
  presets,
  onSaveCurrentAsPreset,
  onLoadPreset,
  onDeletePreset,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // 初期は折りたたみ（設定ボタンと保存ボタンだけ表示）
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const expandedPanelRef = useRef<HTMLDivElement | null>(null);

  // パネルが開いている時に外側をクリック・タップしたら自動で閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // プリセット管理モーダルが開いている最中は閉じない
      if (isPresetModalOpen) return;

      const target = e.target as Node;
      const inTopBar = topBarRef.current?.contains(target);
      const inExpanded = expandedPanelRef.current?.contains(target);

      if (!inTopBar && !inExpanded) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isPresetModalOpen]);

  const handleToggleOpen = () => {
    if (!isOpen && typeof window !== 'undefined' && window.scrollY > 20) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(!isOpen);
  };

  const handleCopy = async () => {
    if (isCopying) return;
    setIsCopying(true);
    try {
      const ok = await onCopyClipboard();
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setIsCopying(false);
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExportPng();
    } finally {
      setIsExporting(false);
    }
  };

  const toggleRarity = (rarity: string) => {
    const exists = filterConfig.rarities.includes(rarity);
    const next = exists
      ? filterConfig.rarities.filter((r) => r !== rarity)
      : [...filterConfig.rarities, rarity];
    if (next.length > 0) {
      onChangeFilter({ ...filterConfig, rarities: next });
    }
  };

  const toggleRecruitment = (type: RecruitmentType) => {
    const exists = filterConfig.recruitmentTypes.includes(type);
    const next = exists
      ? filterConfig.recruitmentTypes.filter((t) => t !== type)
      : [...filterConfig.recruitmentTypes, type];
    if (next.length > 0) {
      onChangeFilter({ ...filterConfig, recruitmentTypes: next });
    }
  };

  return (
    <>
      {/* 
        一番上の操作バー（スクロールしても常に画面上部に固定表示）
      */}
      <div
        ref={topBarRef}
        className="sticky top-1 sm:top-2 z-40 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-sky-200 shadow-md overflow-hidden"
      >
        <div className="p-2 sm:p-3 bg-gradient-to-r from-sky-50/90 via-white to-sky-50/90 flex items-center justify-between gap-2">
          {/* 左側：設定ボタン ＆ PC用タイトル入力（スマホ時はタイトル入力を非表示にして折りたたみ内へ） */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={handleToggleOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm shrink-0 active:scale-95 ${
                isOpen
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white text-sky-700 border-sky-300 hover:bg-sky-50'
              }`}
              title="設定・条件フィルターを開閉"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>設定</span>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* PC版のみ一行目にタイトル入力欄を表示 */}
            <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-extrabold text-sky-800 shrink-0">
                タイトル:
              </span>
              <input
                type="text"
                value={styleConfig.title}
                onChange={(e) => onChangeStyle({ ...styleConfig, title: e.target.value })}
                placeholder="未所属確定チケット候補生徒"
                className="flex-1 max-w-sm px-3 py-1 rounded-xl border border-sky-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* スマホ時：現在のタイトル（省略表示） */}
            <span className="sm:hidden text-xs font-extrabold text-slate-700 truncate">
              {styleConfig.title}
            </span>
          </div>

          {/* 右側：画像保存ボタン群（スマホでも初期表示） */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 画像コピー（PC表示のみ初期表示、スマホ時は設定を開いた中へ） */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={isCopying}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 disabled:opacity-60 text-sky-800 text-xs font-extrabold transition shadow-sm active:scale-95"
              title="画像をクリップボードにコピー"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">完了!</span>
                </>
              ) : isCopying ? (
                <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-600" />
                  <span>画像コピー</span>
                </>
              )}
            </button>

            {/* 画像保存（主役ボタン） */}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:opacity-60 text-white text-xs font-extrabold transition shadow-sm shadow-sky-200 active:scale-95"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>保存中</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>画像保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 
        展開エリア（設定ボタンを押した時に表示）
        - 通常フロー配置（sticky対象外・内部スクロールバーなし）のため、パネル上でスクロール・スワイプしてもページ全体が自然にスクロールし、一番上のバーのみ追従します
      */}
      {isOpen && (
        <div
          ref={expandedPanelRef}
          className="!mt-1.5 bg-white rounded-2xl border-2 border-sky-200 shadow-sm divide-y divide-sky-100 text-xs overflow-hidden"
        >
          {/* スマホ時のみ表示するタイトル編集・一括操作バー */}
          <div className="p-3 bg-sky-50/40 flex flex-wrap items-center justify-between gap-2.5">
            <div className="w-full sm:hidden flex items-center gap-2">
              <span className="text-xs font-extrabold text-sky-800 shrink-0">
                リストタイトル:
              </span>
              <input
                type="text"
                value={styleConfig.title}
                onChange={(e) => onChangeStyle({ ...styleConfig, title: e.target.value })}
                placeholder="未所属確定チケット候補生徒"
                className="flex-1 px-2.5 py-1 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* スマホ時のみ設定内にコピーボタンを配置 */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={isCopying}
                className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 disabled:opacity-60 text-sky-800 text-xs font-bold transition shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>コピー完了!</span>
                  </>
                ) : isCopying ? (
                  <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-sky-600" />
                    <span>画像コピー</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClearAllUnowned}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-sky-800 text-xs font-bold transition shadow-sm active:scale-95"
              >
                <Square className="w-3.5 h-3.5 text-sky-600" />
                <span>全て所持済</span>
              </button>

              <button
                type="button"
                onClick={onSelectAllUnowned}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-sky-800 text-xs font-bold transition shadow-sm active:scale-95"
              >
                <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>全て未所持</span>
              </button>
            </div>
          </div>

          {/* 基本フィルター（実装日・レアリティ・募集区分・検索・リセット・プリセット） */}
          <div className="p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* 実装日範囲（〜から 〜まで） */}
              <div className="flex flex-wrap items-center gap-1 bg-sky-50/70 px-2 py-1 rounded-xl border border-sky-100">
                <Filter className="w-3 h-3 text-sky-600" />
                <span className="font-bold text-slate-600 text-[11px]">実装日:</span>
                <input
                  type="date"
                  value={filterConfig.minDate || ''}
                  onChange={(e) =>
                    onChangeFilter({ ...filterConfig, minDate: e.target.value })
                  }
                  className="bg-white border border-sky-200 rounded px-1.5 py-0.5 font-bold text-slate-700 text-xs focus:outline-none focus:border-sky-400"
                />
                <span className="font-bold text-slate-500 text-[11px]">から</span>
                <input
                  type="date"
                  value={filterConfig.maxDate}
                  onChange={(e) =>
                    onChangeFilter({ ...filterConfig, maxDate: e.target.value })
                  }
                  className="bg-white border border-sky-200 rounded px-1.5 py-0.5 font-bold text-slate-700 text-xs focus:outline-none focus:border-sky-400"
                />
                <span className="font-bold text-slate-500 text-[11px]">まで</span>
              </div>

              {/* レアリティ */}
              <div className="flex items-center gap-1 bg-sky-50/70 px-2 py-1 rounded-xl border border-sky-100">
                <span className="font-bold text-slate-600 text-[11px]">レア:</span>
                {['★3', '★2', '★1'].map((r) => {
                  const active = filterConfig.rarities.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRarity(r)}
                      className={`px-2 py-0.5 rounded-lg font-extrabold transition text-xs ${
                        active
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-white text-slate-500 border border-sky-100 hover:bg-sky-50'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              {/* 募集区分 */}
              <div className="flex flex-wrap items-center gap-1 bg-sky-50/70 px-2 py-1 rounded-xl border border-sky-100">
                <span className="font-bold text-slate-600 text-[11px]">募集区分:</span>
                {RECRUITMENT_OPTIONS.map((opt) => {
                  const active = filterConfig.recruitmentTypes.includes(opt.type);
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => toggleRecruitment(opt.type)}
                      title={opt.description}
                      className={`px-2 py-0.5 rounded-lg font-extrabold transition text-xs ${
                        active
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-white text-slate-500 border border-sky-100 hover:bg-sky-50'
                      }`}
                    >
                      {opt.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 検索 ＆ リセット ＆ プリセット */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filterConfig.searchQuery}
                  onChange={(e) =>
                    onChangeFilter({ ...filterConfig, searchQuery: e.target.value })
                  }
                  placeholder="生徒名で検索..."
                  className="w-full sm:w-36 pl-7 pr-2.5 py-1 rounded-xl border border-sky-200 bg-sky-50/40 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-400"
                />
              </div>

              <button
                type="button"
                onClick={onResetDefaultFilter}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-600 font-bold transition text-xs shrink-0 active:scale-95"
                title={`初期条件（${DEFAULT_MAX_DATE}までの恒常★3生徒）に戻す`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                <span>リセット</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPresetModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold transition text-xs shrink-0 active:scale-95 shadow-sm"
                title="プリセットの保存・読み込み"
              >
                <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                <span>プリセット</span>
              </button>
            </div>
          </div>

          {/* 詳細設定（属性・学校・表示設定） */}
          <div className="p-3 bg-sky-50/50 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* PC:左 / スマホ:上 - 属性・学校 */}
            <div className="bg-white p-2.5 rounded-xl border border-sky-100 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-slate-600 font-bold text-[11px] w-10 shrink-0">攻撃:</span>
                <button
                  type="button"
                  onClick={() => onChangeFilter({ ...filterConfig, attackType: 'all' })}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    filterConfig.attackType === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  全
                </button>
                {Object.keys(ATTACK_COLORS).map((atk) => {
                  const col = ATTACK_COLORS[atk];
                  const active = filterConfig.attackType === atk;
                  return (
                    <button
                      key={atk}
                      type="button"
                      onClick={() =>
                        onChangeFilter({
                          ...filterConfig,
                          attackType: active ? 'all' : atk,
                        })
                      }
                      style={{
                        backgroundColor: active ? col.border : col.bg,
                        color: active ? '#fff' : col.text,
                        borderColor: col.border,
                      }}
                      className="px-2 py-0.5 min-w-[38px] text-center rounded text-[11px] font-extrabold border transition"
                    >
                      {atk}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <span className="text-slate-600 font-bold text-[11px] w-10 shrink-0">防御:</span>
                <button
                  type="button"
                  onClick={() => onChangeFilter({ ...filterConfig, defenseType: 'all' })}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    filterConfig.defenseType === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  全
                </button>
                {Object.keys(DEFENSE_COLORS).map((def) => {
                  const col = DEFENSE_COLORS[def];
                  const active = filterConfig.defenseType === def;
                  return (
                    <button
                      key={def}
                      type="button"
                      onClick={() =>
                        onChangeFilter({
                          ...filterConfig,
                          defenseType: active ? 'all' : def,
                        })
                      }
                      style={{
                        backgroundColor: active ? col.border : col.bg,
                        color: active ? '#fff' : col.text,
                        borderColor: col.border,
                      }}
                      className="px-2 py-0.5 min-w-[38px] text-center rounded text-[11px] font-extrabold border transition"
                    >
                      {DEFENSE_SHORT_LABELS[def] || def}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-slate-600 font-bold text-[11px] w-10 shrink-0">学校:</span>
                <select
                  value={filterConfig.school}
                  onChange={(e) =>
                    onChangeFilter({ ...filterConfig, school: e.target.value })
                  }
                  className="border border-sky-200 rounded px-2 py-0.5 font-bold text-slate-700 text-xs bg-white focus:outline-none focus:border-sky-400"
                >
                  <option value="all">すべての学校</option>
                  {schools.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
                <span className="ml-auto text-slate-500 font-bold text-xs">
                  未所持: <strong className="text-sky-600">{unownedCount}</strong> / {totalFilteredCount}人
                </span>
              </div>
            </div>

            {/* PC:右 / スマホ:下 - 表示設定（外枠色を変えて枠内に◇表示設定と書いて他と差別化） */}
            <div className="bg-sky-50/70 p-2.5 rounded-xl border-2 border-sky-400 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 pb-1 border-b border-sky-200 text-sky-800 font-extrabold text-xs">
                <span>◇ 表示設定</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-600 font-bold text-[11px] shrink-0">枠色:</span>
                {(
                  [
                    { mode: 'none', label: '標準' },
                    { mode: 'attack', label: '攻撃属性' },
                    { mode: 'defense', label: '防御属性' },
                    { mode: 'role', label: '役割' },
                  ] as { mode: BorderColorMode; label: string }[]
                ).map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      onChangeStyle({
                        ...styleConfig,
                        borderColorMode: mode,
                        borderWidth: mode === 'none' ? 1 : Math.max(2, styleConfig.borderWidth),
                      })
                    }
                    className={`px-2 py-0.5 rounded-lg font-bold transition text-xs ${
                      styleConfig.borderColorMode === mode
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-sky-50 text-slate-600 hover:bg-sky-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold text-[11px]">角丸:</span>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={2}
                    value={styleConfig.borderRadius}
                    onChange={(e) =>
                      onChangeStyle({ ...styleConfig, borderRadius: Number(e.target.value) })
                    }
                    className="accent-sky-500 w-20"
                  />
                  <span className="font-mono font-bold text-slate-700 text-xs w-6">
                    {styleConfig.borderRadius}px
                  </span>
                </div>
              </div>

              {/* キャンバス列数設定（デフォルト: STRIKER 4列 - SPECIAL 2列） */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-sky-200">
                <span className="text-slate-600 font-bold text-[11px] shrink-0">列数:</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="text-[11px] text-sky-800 font-bold">STRIKER</span>
                  <select
                    value={styleConfig.strikerColumns ?? 4}
                    onChange={(e) =>
                      onChangeStyle({
                        ...styleConfig,
                        strikerColumns: Number(e.target.value),
                      })
                    }
                    className="border border-sky-300 rounded px-1.5 py-0.5 font-bold text-slate-700 text-xs bg-white focus:outline-none focus:border-sky-500"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n}列
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 font-normal">-</span>
                  <span className="text-[11px] text-sky-800 font-bold">SPECIAL</span>
                  <select
                    value={styleConfig.specialColumns ?? 2}
                    onChange={(e) =>
                      onChangeStyle({
                        ...styleConfig,
                        specialColumns: Number(e.target.value),
                      })
                    }
                    className="border border-sky-300 rounded px-1.5 py-0.5 font-bold text-slate-700 text-xs bg-white focus:outline-none focus:border-sky-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}列
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 展開パネル右下の小さく閉じるボタン */}
            <div className="md:col-span-2 flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-sky-200 bg-white hover:bg-sky-100 text-slate-600 font-bold text-[11px] transition shadow-sm active:scale-95"
                title="設定パネルを閉じる"
              >
                <ChevronUp className="w-3 h-3 text-sky-600" />
                <span>閉じる</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プリセット管理モーダル（backdrop-filter要素の外側に配置し、fixed位置ずれを防止） */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        presets={presets}
        currentPresetValues={{
          title: styleConfig.title,
          minDate: filterConfig.minDate || '',
          maxDate: filterConfig.maxDate || '',
          rarities: filterConfig.rarities,
          recruitmentTypes: filterConfig.recruitmentTypes,
        }}
        onSaveCurrentAsPreset={onSaveCurrentAsPreset}
        onLoadPreset={onLoadPreset}
        onDeletePreset={onDeletePreset}
      />
    </>
  );
};
