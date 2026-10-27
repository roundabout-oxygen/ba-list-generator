export type RecruitmentType =
  | 'normal'
  | 'archive'
  | 'limited'
  | 'fest'
  | 'recollect'
  | 'collab'
  | 'event_or_other';

export type RoleType = 'STRIKER' | 'SPECIAL';

export type BorderColorMode = 'none' | 'attack' | 'defense' | 'role';

export interface Character {
  id: string;
  name: string;
  rarity: string;
  icon: string;
  weapon: string;
  cover: string;
  role: RoleType | string;
  pos: string;
  class: string;
  school: string;
  attack_type: string;
  defense_type: string;
  recruitment_symbol: string;
  recruitment_type: RecruitmentType;
  recruitment_label: string;
  obtain_symbol: string;
  release_date: string; // "YYYY/MM/DD"
  release_year: number;
  impl_order: number;
  hard_farmable: string;
  shop_farmable: string;
  event_reward: string;
  note: string;
}

export interface FilterConfig {
  maxDate: string; // "YYYY-MM-DD", default "2026-04-20"
  rarities: string[]; // default ["★3"]
  recruitmentTypes: RecruitmentType[]; // default ["normal"]
  searchQuery: string;
  school: string; // "all" or school name
  attackType: string; // "all" or attack type
  defenseType: string; // "all" or defense type
}

export interface CanvasStyleConfig {
  title: string;
  subtitle: string;
  showCount: boolean;
  showDateCondition: boolean;
  iconSize: number; // default 60
  borderRadius: number; // default 8
  borderWidth: number; // default 2
  borderColorMode: BorderColorMode;
  showIndicatorDots: boolean;
  showCharacterName: boolean;
  columnsPerRole: number; // 0 = auto, or 5..12
}
