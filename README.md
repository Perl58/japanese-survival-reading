# Hibiki Japanese

**Read a little Japanese before your trip.**

Practice reading station signs, menus, and product labels you’ll see in Japan. Take it at your own pace. Recognizing even one word is a step forward.

**[Get Hibiki Japanese on Google Play](https://play.google.com/store/apps/details?id=com.hibikilearn.pyanoki)**

## Try a konbini shopping mission

You’re at a convenience store in Japan. Your shopping list says **ツナマヨのおにぎりと麦茶**. Which pair goes in your basket?

1. **うめのおにぎり ＋ 麦茶**
2. **ツナマヨのおにぎり ＋ 緑茶**
3. **ツナマヨのおにぎり ＋ 麦茶**

<details>
<summary>Check your basket</summary>

The third pair is right. **ツナマヨのおにぎり** is a tuna mayo rice ball, and **麦茶（むぎちゃ）** is barley tea.

</details>

At the register, you want to pay in cash. Which would you say, **現金で** or **カードで**?

<details>
<summary>Check your answer</summary>

**現金で（げんきんで）** means “in cash.” You can say **現金でお願いします** (“I’ll pay in cash, please”).

</details>

## 日本語でのご紹介

Hibiki Japaneseは、日本旅行で出会う駅の案内や商品の表示を、自分のペースで読む練習ができるAndroidアプリです。上のミニ体験では、コンビニでおにぎりとお茶を選び、レジで支払い方法を伝えます。旅先で「これ、読めた」「伝わった」をひとつずつ増やせるように作っています。

## このリポジトリについて

このリポジトリには、Hibiki Japaneseの出発点となった初期Web版 **Japanese Survival Reading** のソースコードを掲載しています。現在のAndroid版は、上のGoogle Playリンクからご覧いただけます。

<details>
<summary>初期Web版の開発経緯と起動手順</summary>

初期Web版はRevenueCat Shipaton 2026に向けて開発しました。「ひびき先生」と一緒に、Stage 1（1-1〜1-4、全68問）で駅周りの日本語を学べます。Perxona Connect Kitのサンプル内で開発を始め、3Dアバターを独自イラストに置き換えたあと、2026年8月20日に独立したプロジェクトに分離しました。

- `src/` — フロントエンド（Vite、React、TypeScript、Tailwind CSS v4）
- `public/avatars/teacher/` — ひびき先生のイラスト
- `server/` — Expressバックエンド（`/api/tts`、`/api/health`）

音声機能を使う場合は、[VOICEVOX](https://voicevox.hiroshiba.jp/)を先に起動します。起動していない場合は、キャプションと口パクで表示します。

リポジトリのルートでフロントエンドを起動します。

```bash
npm install
npm run dev
```

別のターミナルでバックエンドを起動します。

```bash
cd server
npm install
npm run dev
```

フロントエンドのターミナルに表示されたURL（通常は `http://localhost:5173`）をブラウザで開きます。

本番用にビルドする場合は、ルートで `npm run build` を実行します。出力先は `dist/` です。ビルド後は `cd server && npm start` で配信できます。

</details>

[プライバシーポリシー / Privacy Policy](./privacy-policy.md)
