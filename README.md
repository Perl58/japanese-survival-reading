# Japanese Survival Reading

日本語初学者向けの実用的な読み取り練習アプリ。駅・空港・メニューなど、実際の場面で出会う漢字・カタカナを読む練習をします。
先生キャラクター「ひびき先生」と一緒に、Stage 1（1-1〜1-4、全68問）で駅周りの日本語を学べます。

RevenueCat Shipaton 2026 向けに開発中。詳しい経緯・意思決定はプロジェクトの `phase-plan.md` を参照してください。

## 構成

- `src/` — フロントエンド（Vite + React + TypeScript + Tailwind CSS v4）
- `public/avatars/teacher/` — ひびき先生のイラストアバター（レイヤー合成用PNG）
- `server/` — バックエンド（Express）。今のところ `/api/tts`（VOICEVOX音声合成のプロキシ）と `/api/health` のみ

以前は Perxona Connect Kit のサンプル一式（`perxona-connect-kit-main/`）の中で開発していましたが、
3Dアバター（Perxona presenter SDK）を独自イラストのアバターに置き換えたタイミングでPerxonaへの依存がなくなったため、
このアプリ単体の独立プロジェクトとして分離しました（2026-08-20）。

## セットアップ

### 1. VOICEVOXを起動する（音声機能を使う場合）

https://voicevox.hiroshiba.jp からダウンロードして起動し、開いたままにしておく。
ローカルAPI（`http://127.0.0.1:50021`）が自動的に立ち上がります。VOICEVOXが起動していなくても、
アプリはキャプション＋口パクだけの表示にフォールバックするので動作します。

### 2. フロントエンドを起動

```bash
npm install
npm run dev
```

### 3. バックエンドを起動（別ターミナル）

```bash
cd server
npm install
npm run dev
```

### 4. ブラウザで開く

フロントエンドのターミナルに表示されるURL（通常 `http://localhost:5173`）を開く。

## 本番ビルド

```bash
npm run build          # dist/ に出力
cd server && npm start # NODE_ENV=production で server/server.mjs が dist/ を配信
```

## Privacy Policy

This app does not collect personal user data. We use RevenueCat Ads for advertisement delivery. No sensitive data is stored or transmitted.
