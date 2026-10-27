import { RecruitmentType } from '../types';

export const APP_VERSION = 'v1.0.0';

export const DEFAULT_MAX_DATE = '2026-04-20';

export const ATTACK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '爆発': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
  '貫通': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
  '神秘': { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
  '振動': { bg: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
  '分解': { bg: '#d1fae5', text: '#059669', border: '#10b981' },
};

export const DEFENSE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '軽装備': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
  '重装甲': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
  '特殊装甲': { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
  '弾力装甲': { bg: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
  '複合装甲': { bg: '#d1fae5', text: '#059669', border: '#10b981' },
};

export const DEFENSE_SHORT_LABELS: Record<string, string> = {
  '軽装備': '軽装',
  '重装甲': '重装',
  '特殊装甲': '特殊',
  '弾力装甲': '弾力',
  '複合装甲': '複合',
};

export const RECRUITMENT_OPTIONS: {
  type: RecruitmentType;
  label: string;
  shortLabel: string;
  symbol: string;
  description: string;
}[] = [
  {
    type: 'normal',
    label: '通常募集（恒常）',
    shortLabel: '恒常',
    symbol: '○',
    description: '通常の募集から常時排出される生徒（アーカイブ・限定を除く）',
  },
  {
    type: 'archive',
    label: 'アーカイブ募集',
    shortLabel: 'アーカイブ',
    symbol: '●',
    description: 'アーカイブ募集へ移行した初期恒常生徒',
  },
  {
    type: 'limited',
    label: '期間限定募集',
    shortLabel: '限定',
    symbol: '◇',
    description: '季節イベント等の期間限定募集生徒',
  },
  {
    type: 'fest',
    label: '周年限定（フェス）',
    shortLabel: '周年/フェス',
    symbol: '☆',
    description: '周年・ハーフアニバーサリーの特殊期間限定生徒',
  },
  {
    type: 'recollect',
    label: 'リコレクト募集',
    shortLabel: 'リコレクト',
    symbol: '★',
    description: 'リコレクト募集対象の限定生徒',
  },
  {
    type: 'collab',
    label: 'コラボ募集',
    shortLabel: 'コラボ',
    symbol: '▽',
    description: '他作品コラボ限定の募集生徒',
  },
  {
    type: 'event_or_other',
    label: '配布・その他',
    shortLabel: '配布/他',
    symbol: '-',
    description: 'イベント報酬や初期配布など募集以外の生徒',
  },
];

// ひらがなをカタカナに変換して曖昧検索を可能にするヘルパー
export function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

export function matchFuzzyJapanese(target: string, query: string): boolean {
  if (!query.trim()) return true;
  const normTarget = toKatakana(target.toLowerCase());
  const normQuery = toKatakana(query.trim().toLowerCase());
  return normTarget.includes(normQuery);
}
