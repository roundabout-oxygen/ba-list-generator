import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { Character, FilterConfig, CanvasStyleConfig, PresetConfig } from './types';
import {
  DEFAULT_MAX_DATE,
  matchFuzzyJapanese,
} from './utils/constants';
import { ControlPanel } from './components/ControlPanel';
import { UnownedCanvas } from './components/UnownedCanvas';
import { CharacterSelectorList } from './components/CharacterSelectorList';

const STORAGE_KEY_UNOWNED = 'ba_unowned_checker_unowned_names_v2';
const STORAGE_KEY_STYLE = 'ba_unowned_checker_style_v2';
const STORAGE_KEY_FILTER = 'ba_unowned_checker_filter_v2';
const STORAGE_KEY_PRESETS = 'ba_list_generator_presets_v1';

const DEFAULT_FILTER: FilterConfig = {
  minDate: '',
  maxDate: DEFAULT_MAX_DATE, // "2026-04-20"
  rarities: ['★3'],
  recruitmentTypes: ['normal'], // アーカイブ募集・限定募集を除く通常募集（恒常）
  searchQuery: '',
  school: 'all',
  attackType: 'all',
  defenseType: 'all',
};

const DEFAULT_PRESETS: PresetConfig[] = [
  {
    id: 'preset_unowned_guaranteed',
    name: '未所持確定チケ',
    title: '未所持確定チケット候補生徒',
    minDate: '',
    maxDate: DEFAULT_MAX_DATE,
    rarities: ['★3'],
    recruitmentTypes: ['normal'],
    createdAt: 1700000000000,
  },
];

const DEFAULT_STYLE: CanvasStyleConfig = {
  title: '未所持確定チケット候補生徒',
  subtitle: '',
  showCount: true,
  showDateCondition: true,
  iconSize: 52, // 下部リスト用の設定
  borderRadius: 6,
  borderWidth: 2,
  borderColorMode: 'none',
  showIndicatorDots: false, // デフォルトは属性ドットなし
  showCharacterName: false,
  columnsPerRole: 0,
  strikerColumns: 4,
  specialColumns: 2,
};

export const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 未所持として選択された生徒名（初期状態は全て所持済＝空セット）
  const [unownedNames, setUnownedNames] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNOWNED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.warn('Failed to load unowned state from localStorage:', e);
    }
    return new Set();
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTER);
      if (saved) {
        return { ...DEFAULT_FILTER, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load filter config:', e);
    }
    return DEFAULT_FILTER;
  });

  const [styleConfig, setStyleConfig] = useState<CanvasStyleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STYLE);
      if (saved) {
        return { ...DEFAULT_STYLE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load style config:', e);
    }
    return DEFAULT_STYLE;
  });

  const [presets, setPresets] = useState<PresetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRESETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load presets:', e);
    }
    return DEFAULT_PRESETS;
  });

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isExportingList, setIsExportingList] = useState(false);

  // キャラクターデータの読み込み
  useEffect(() => {
    fetch('./characters.json')
      .then((res) => res.json())
      .then((data: Character[]) => {
        const sorted = [...data].sort((a, b) => {
          const dateA = a.release_date || '9999/99/99';
          const dateB = b.release_date || '9999/99/99';
          if (dateA !== dateB) return dateA.localeCompare(dateB);
          return (a.impl_order || 0) - (b.impl_order || 0);
        });
        setCharacters(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load characters.json:', err);
        setLoading(false);
      });
  }, []);

  // localStorage 自動保存
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_UNOWNED,
        JSON.stringify(Array.from(unownedNames))
      );
    } catch (e) {
      console.warn('Failed to save unowned state:', e);
    }
  }, [unownedNames]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTER, JSON.stringify(filterConfig));
    } catch (e) {
      console.warn('Failed to save filter config:', e);
    }
  }, [filterConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STYLE, JSON.stringify(styleConfig));
    } catch (e) {
      console.warn('Failed to save style config:', e);
    }
  }, [styleConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(presets));
    } catch (e) {
      console.warn('Failed to save presets:', e);
    }
  }, [presets]);

  // 全学校リスト
  const schools = useMemo(() => {
    const s = new Set<string>();
    characters.forEach((c) => {
      if (c.school) s.add(c.school);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [characters]);

  // 条件でフィルタリングされた生徒一覧（古い順）
  const filteredCharacters = useMemo(() => {
    const minDateSlash = filterConfig.minDate
      ? filterConfig.minDate.replace(/-/g, '/')
      : '';
    const maxDateSlash = filterConfig.maxDate
      ? filterConfig.maxDate.replace(/-/g, '/')
      : '9999/99/99';

    return characters.filter((c) => {
      if (c.release_date && minDateSlash && c.release_date < minDateSlash) return false;
      if (c.release_date && c.release_date > maxDateSlash) return false;
      if (
        filterConfig.rarities.length > 0 &&
        !filterConfig.rarities.includes(c.rarity)
      ) {
        return false;
      }
      if (
        filterConfig.recruitmentTypes.length > 0 &&
        !filterConfig.recruitmentTypes.includes(c.recruitment_type)
      ) {
        return false;
      }
      if (
        filterConfig.attackType !== 'all' &&
        c.attack_type !== filterConfig.attackType
      ) {
        return false;
      }
      if (
        filterConfig.defenseType !== 'all' &&
        c.defense_type !== filterConfig.defenseType
      ) {
        return false;
      }
      if (filterConfig.school !== 'all' && c.school !== filterConfig.school) {
        return false;
      }
      if (
        filterConfig.searchQuery.trim() &&
        !matchFuzzyJapanese(c.name, filterConfig.searchQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [characters, filterConfig]);

  const unownedIds = useMemo(() => {
    const set = new Set<string>();
    characters.forEach((c) => {
      if (unownedNames.has(c.name)) {
        set.add(c.id);
      }
    });
    return set;
  }, [characters, unownedNames]);

  const unownedFilteredCharacters = useMemo(() => {
    return filteredCharacters.filter((c) => unownedNames.has(c.name));
  }, [filteredCharacters, unownedNames]);

  const handleToggleUnowned = (char: Character) => {
    setUnownedNames((prev) => {
      const next = new Set(prev);
      if (next.has(char.name)) {
        next.delete(char.name);
      } else {
        next.add(char.name);
      }
      return next;
    });
  };

  const handleSelectAllUnowned = () => {
    setUnownedNames((prev) => {
      const next = new Set(prev);
      filteredCharacters.forEach((c) => next.add(c.name));
      return next;
    });
  };

  const handleClearAllUnowned = () => {
    setUnownedNames(new Set());
  };

  const handleResetDefaultFilter = () => {
    setFilterConfig(DEFAULT_FILTER);
  };

  const handleSaveCurrentAsPreset = (name: string) => {
    const newPreset: PresetConfig = {
      id: `preset_${Date.now()}`,
      name,
      title: styleConfig.title,
      minDate: filterConfig.minDate || '',
      maxDate: filterConfig.maxDate || '',
      rarities: [...filterConfig.rarities],
      recruitmentTypes: [...filterConfig.recruitmentTypes],
      createdAt: Date.now(),
    };
    setPresets((prev) => [newPreset, ...prev]);
  };

  const handleLoadPreset = (preset: PresetConfig) => {
    setFilterConfig((prev) => ({
      ...prev,
      minDate: preset.minDate || '',
      maxDate: preset.maxDate || '',
      rarities: [...preset.rarities],
      recruitmentTypes: [...preset.recruitmentTypes],
    }));
    setStyleConfig((prev) => ({
      ...prev,
      title: preset.title || '',
    }));
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleExportPng = async () => {
    if (!canvasRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: false,
        skipAutoScale: true,
      });
      const link = document.createElement('a');
      link.download = `BA-Unowned-List-${filterConfig.maxDate || 'all'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('画像の出力に失敗しました。');
    }
  };

  const handleExportListPng = async () => {
    if (!listRef.current) return;
    setIsExportingList(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(listRef.current, {
        pixelRatio: 2,
        cacheBust: false,
        skipAutoScale: true,
      });
      const link = document.createElement('a');
      link.download = `BA-Student-List-${filterConfig.maxDate || 'all'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export student list PNG:', err);
      alert('生徒リスト画像の出力に失敗しました。');
    } finally {
      setIsExportingList(false);
    }
  };

  const handleCopyClipboard = async (): Promise<boolean> => {
    if (!canvasRef.current) return false;
    try {
      await document.fonts.ready;
      const blob = await toBlob(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: false,
        skipAutoScale: true,
      });
      if (!blob) return false;
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      alert('クリップボードへのコピーに失敗しました。');
      return false;
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#f0f8ff] text-slate-800 font-rounded p-2 sm:p-4">
      {/* メインコンテンツ（タイトルヘッダーは全削除し、余計な余白・改行も排除） */}
      <main className="max-w-6xl w-full mx-auto space-y-3">
        {/* 操作・フィルターパネル（1行表示 ＋ 開閉で展開） */}
        <ControlPanel
          filterConfig={filterConfig}
          onChangeFilter={setFilterConfig}
          styleConfig={styleConfig}
          onChangeStyle={setStyleConfig}
          schools={schools}
          totalFilteredCount={filteredCharacters.length}
          unownedCount={unownedFilteredCharacters.length}
          onSelectAllUnowned={handleSelectAllUnowned}
          onClearAllUnowned={handleClearAllUnowned}
          onResetDefaultFilter={handleResetDefaultFilter}
          onExportPng={handleExportPng}
          onCopyClipboard={handleCopyClipboard}
          presets={presets}
          onSaveCurrentAsPreset={handleSaveCurrentAsPreset}
          onLoadPreset={handleLoadPreset}
          onDeletePreset={handleDeletePreset}
        />

        {/* 画面上部：出力用キャンバス（色分けやSTRIKER/SPECIALタイトルなし、左右に分かれただけのシンプル設計） */}
        <UnownedCanvas
          canvasRef={canvasRef}
          unownedCharacters={unownedFilteredCharacters}
          styleConfig={styleConfig}
          onRemoveUnowned={handleToggleUnowned}
        />

        {/* 画面下部：対象生徒一覧（1つの枠に収め、年毎にシンプル区切り、全体が1画面に収まりやすい省スペース設計） */}
        {loading ? (
          <div className="bg-white rounded-xl border border-sky-200 p-8 text-center text-xs font-bold text-sky-600">
            読み込み中...
          </div>
        ) : (
          <CharacterSelectorList
            characters={filteredCharacters}
            unownedIds={unownedIds}
            styleConfig={styleConfig}
            onToggleUnowned={handleToggleUnowned}
            listRef={listRef}
            onExportListPng={handleExportListPng}
            isExportingList={isExportingList}
          />
        )}
      </main>
    </div>
  );
};

export default App;
