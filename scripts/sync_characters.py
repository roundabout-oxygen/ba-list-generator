import os
import re
import json
import time
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(BASE_DIR, "public", "icons")
OUTPUT_JSON = os.path.join(BASE_DIR, "public", "characters.json")
DIST_JSON = os.path.join(BASE_DIR, "dist", "characters.json")

os.makedirs(ICONS_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (BlueArchiveListGenerator-SyncBot/1.0; +https://github.com/roundabout-oxygen/ba-list-generator)'
}

RECRUITMENT_TYPE_MAP = {
    '○': 'normal',       # 通常募集（恒常）
    '●': 'archive',      # アーカイブ募集
    '◇': 'limited',      # 期間限定募集
    '☆': 'fest',         # 特殊期間限定募集（周年/フェス）
    '★': 'recollect',    # リコレクト募集
    '▽': 'collab',       # コラボ募集
    '-': 'event_or_other' # 配布・その他
}

RECRUITMENT_LABEL_MAP = {
    'normal': '恒常（通常募集）',
    'archive': 'アーカイブ募集',
    'limited': '期間限定募集',
    'fest': '周年限定（フェス）',
    'recollect': 'リコレクト募集',
    'collab': 'コラボ限定',
    'event_or_other': '配布・その他'
}

# 1. キャラクター実装履歴の取得
url_hist = 'https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E5%AE%9F%E8%A3%85%E5%B1%A5%E6%AD%B4'
print("Fetching character implementation history from wiki...")
req_hist = urllib.request.Request(url_hist, headers=headers)
with urllib.request.urlopen(req_hist, timeout=20) as res:
    hist_html = res.read().decode('utf-8', errors='ignore')

tables = re.findall(r'<table.*?>(.*?)</table>', hist_html, re.DOTALL)
hist_rows = []
for t in tables:
    t_rows = re.findall(r'<tr>(.*?)</tr>', t, re.DOTALL)
    if t_rows:
        ths = [re.sub(r'<[^>]+>', '', th).strip() for th in re.findall(r'<th.*?>(.*?)</th>', t_rows[0], re.DOTALL)]
        if '実装日' in ths and '名前' in ths:
            hist_rows = t_rows[1:]
            break

hist_map = {}
total_hist_rows = len(hist_rows)
for idx, r in enumerate(hist_rows):
    tds = re.findall(r'<td.*?>(.*?)</td>', r, re.DOTALL)
    if len(tds) >= 8:
        name_m = re.search(r'title=[\"\']([^\"\']+)[\"\']', tds[1])
        name = name_m.group(1) if name_m else re.sub(r'<[^>]+>', '', tds[1]).strip()
        name = name.replace('\n', '').strip()
        if not name:
            continue
        date_str = re.sub(r'<[^>]+>', '', tds[2]).strip()
        rec_symbol = re.sub(r'<[^>]+>', '', tds[3]).strip()
        hard = re.sub(r'<[^>]+>', '', tds[4]).strip()
        shop = re.sub(r'<[^>]+>', '', tds[5]).strip()
        event = re.sub(r'<[^>]+>', '', tds[6]).strip()
        note = re.sub(r'<[^>]+>', '', tds[7]).strip()

        year = int(date_str[:4]) if len(date_str) >= 4 and date_str[:4].isdigit() else 0
        # 実装履歴テーブルは上が最新・下が最古。同日実装でも元の並び順を維持するため impl_order を算出（古いほど小さい値）
        impl_order = total_hist_rows - idx

        hist_map[name] = {
            'release_date': date_str,
            'release_year': year,
            'recruitment_symbol': rec_symbol,
            'hard_farmable': hard,
            'shop_farmable': shop,
            'event_reward': event,
            'note': note,
            'impl_order': impl_order
        }

print(f"Loaded {len(hist_map)} implementation history entries.")

# 2. サーバー負荷軽減のためインターバルを置いてキャラクター一覧を取得
time.sleep(1.5)

url_chars = 'https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E4%B8%80%E8%A6%A7'
print("Fetching playable characters list from wiki...")
req_chars = urllib.request.Request(url_chars, headers=headers)
with urllib.request.urlopen(req_chars, timeout=20) as res:
    chars_html = res.read().decode('utf-8', errors='ignore')

start = chars_html.find('id="sortabletable1"')
end = chars_html.find('</table>', start)
table_html = chars_html[start:end]
rows = re.findall(r'<tr>(.*?)</tr>', table_html, re.DOTALL)

playable_characters = []
seen_names = set()

for r in rows[1:]:
    tds = re.findall(r'<td.*?>(.*?)</td>', r, re.DOTALL)
    if len(tds) >= 20:
        rarity = re.sub(r'<[^>]+>', '', tds[0]).strip()
        img_m = re.search(r'data-src=[\"\']([^\"\']+)[\"\']', tds[1])
        if not img_m:
            img_m = re.search(r'src=[\"\']([^\"\']+)[\"\']', tds[1])
        img_rel = img_m.group(1) if img_m else ''

        name_m = re.search(r'title=[\"\']([^\"\']+)[\"\']', tds[2])
        name = name_m.group(1) if name_m else re.sub(r'<[^>]+>', '', tds[2]).strip()
        name = name.replace('\n', '').strip()

        if not name or name in seen_names:
            continue
        seen_names.add(name)

        weapon = re.sub(r'<[^>]+>', '', tds[3]).strip()
        cover = re.sub(r'<[^>]+>', '', tds[4]).strip()
        role = re.sub(r'<[^>]+>', '', tds[5]).strip()
        pos = re.sub(r'<[^>]+>', '', tds[6]).strip()
        cls = re.sub(r'<[^>]+>', '', tds[7]).strip()
        school = re.sub(r'<[^>]+>', '', tds[8]).strip()
        atk = re.sub(r'<[^>]+>', '', tds[9]).strip()
        df = re.sub(r'<[^>]+>', '', tds[10]).replace('\n', '').replace(' ', '').strip()
        rec_col = re.sub(r'<[^>]+>', '', tds[18]).strip()
        obtain_col = re.sub(r'<[^>]+>', '', tds[19]).strip()

        safe_name = re.sub(r'[\\/*?:"<>|]', '_', name)
        filename = f"{safe_name}.png"

        h_info = hist_map.get(name, {})
        rec_sym = h_info.get('recruitment_symbol') or rec_col or '-'
        rec_type = RECRUITMENT_TYPE_MAP.get(rec_sym, 'event_or_other')
        rec_label = RECRUITMENT_LABEL_MAP.get(rec_type, 'その他')

        playable_characters.append({
            'name': name,
            'rarity': rarity,
            'img_url': 'https://bluearchive.wikiru.jp/' + img_rel if img_rel else '',
            'filename': filename,
            'icon': f"icons/{filename}",
            'weapon': weapon,
            'cover': cover,
            'role': role,
            'pos': pos,
            'class': cls,
            'school': school,
            'attack_type': atk,
            'defense_type': df,
            'recruitment_symbol': rec_sym,
            'recruitment_type': rec_type,
            'recruitment_label': rec_label,
            'obtain_symbol': obtain_col,
            'release_date': h_info.get('release_date', ''),
            'release_year': h_info.get('release_year', 0),
            'impl_order': h_info.get('impl_order', 9999),
            'hard_farmable': h_info.get('hard_farmable', '-'),
            'shop_farmable': h_info.get('shop_farmable', '-'),
            'event_reward': h_info.get('event_reward', '-'),
            'note': h_info.get('note', ''),
        })

print(f"Loaded {len(playable_characters)} unique playable characters.")

# 3. 差分アイコンダウンロード
new_downloads = 0
for char in playable_characters:
    if not char['img_url']:
        continue
    target_path = os.path.join(ICONS_DIR, char['filename'])
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        continue

    print(f"New character icon found: {char['name']} -> downloading...")
    time.sleep(1.5)
    try:
        req = urllib.request.Request(char['img_url'], headers=headers)
        with urllib.request.urlopen(req, timeout=15) as res:
            data = res.read()
            with open(target_path, 'wb') as out_f:
                out_f.write(data)
        new_downloads += 1
    except Exception as e:
        print(f"Error downloading icon for {char['name']}: {e}")

print(f"Icon sync completed. Newly downloaded icons: {new_downloads}")

# 4. 実装順（古い順: release_date 昇順, impl_order 昇順）でソートして ID を付与
playable_characters.sort(key=lambda c: (c['release_date'] or '9999/99/99', c['impl_order'], c['name']))

final_db = []
for idx, c in enumerate(playable_characters):
    entry = dict(c)
    entry.pop('img_url', None)
    entry.pop('filename', None)
    entry['id'] = f"char_{idx+1:03d}"
    final_db.append(entry)

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(final_db, f, ensure_ascii=False, indent=2)

if os.path.exists(os.path.dirname(DIST_JSON)):
    with open(DIST_JSON, "w", encoding="utf-8") as f:
        json.dump(final_db, f, ensure_ascii=False, indent=2)

print(f"Database successfully updated: {OUTPUT_JSON} ({len(final_db)} entries)")
