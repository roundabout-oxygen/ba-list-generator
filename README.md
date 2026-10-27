# ba-list-generator (ブルーアーカイブ 未所持生徒チェッカー & リスト画像メーカー)

ブルーアーカイブ（ブルアカ）攻略Wiki（wikiru.jp）の「キャラクター一覧」および「キャラクター実装履歴」から各生徒のアイコン・属性・募集区分・実装日を自動取得し、未所持の生徒をクリックで選択して綺麗なリスト画像を出力できるWebアプリです。

🌐 **Webアプリ (GitHub Pages)**:
[https://roundabout-oxygen.github.io/ba-list-generator/](https://roundabout-oxygen.github.io/ba-list-generator/)

## 主な機能

1. **Wiki自動巡回・月1自動同期**
   - `scripts/sync_characters.py` により、[キャラクター一覧](https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E4%B8%80%E8%A6%A7) と [キャラクター実装履歴](https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E5%AE%9F%E8%A3%85%E5%B1%A5%E6%AD%B4) を統合して `public/characters.json` とアイコン画像を更新します。
   - `.github/workflows/monthly-sync.yml` により毎月1日の自動巡回＆GitHub Pagesデプロイに対応しています。

2. **実装年別 × 左右2列（STRIKER / SPECIAL）の生徒選択リスト（画面下部）**
   - デフォルトで「2026年4月20日までに実装された★3生徒（アーカイブ募集・限定募集を除く恒常生徒）」を古い順（2022年→2026年、同一年内も実装順）で表示します。
   - 初期状態はすべて「所持済（カラー表示）」からスタートし、アイコンをクリックするとグレー表示＋「**未**」マークに切り替わります。

3. **リアルタイム連動キャンバス & 高解像度PNG出力（画面上部）**
   - 未所持として選択された生徒がリアルタイムで上部キャンバス（左：STRIKER、右：SPECIAL、実装順）にカラーアイコンで並びます。
   - タイトルの自由編集、未所持人数のカウント表示、属性枠線カラー切替（攻撃・防御・部隊色）、PNG画像ダウンロード、クリップボードへの直接コピーに対応しています。
   - 選択状態や設定はブラウザの `localStorage` に自動保存されます。

## 起動方法

```bash
npm install
npm run dev
```
または `start.bat` をダブルクリックして起動できます。

## ライセンス・フォント著作権表示
- 使用フォント: **M PLUS Rounded 1c**
  Copyright (c) 2015, Coji Morishita, M+ FONTS PROJECT (https://fonts.google.com/specimen/M+PLUS+Rounded+1c)
