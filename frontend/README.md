# Threads運用診断アプリ - フロントエンド

**プロジェクト**: Threads運用診断アプリ（MVP）
**バージョン**: 1.0.0
**最終更新**: 2026-01-15

---

## 📋 プロジェクト概要

Threads自動投稿システム（29,800円）の販売促進のため、診断アプリによる納得形成と自動導線を構築するMVP（Minimum Viable Product）です。

**目的**:
- ユーザーのThreads運用の現在地を診断（12問・2-3分）
- 4軸スコア（設計力・量産力・改善力・事業力）を可視化
- タイプ別カスタムメッセージで課題を提示
- 自然な流れで商品（自動投稿システム）への導線を作る

**特徴**:
- フロントエンド専用MVP（バックエンドAPI不使用）
- sessionStorageでセッション管理
- UTAGE統合（メール登録・特典配信）
- Google Analytics 4イベント計測

---

## 🛠️ 技術スタック

### フロントエンド

- **React** 19.2.3（最新安定版）
- **TypeScript** 5.9.3（strictモード有効）
- **Vite** 7.2.4（高速ビルドツール）
- **MUI v7** 7.3.7（UIコンポーネントライブラリ）
- **Zustand** 5.0.10（軽量状態管理）
- **React Router** v7.12.0（ルーティング）
- **Recharts** 3.6.0（レーダーチャート）

### 開発ツール

- **Vitest** 4.0.17（テストフレームワーク）
- **ESLint** 9.39.2（静的解析）
- **Prettier**（コードフォーマット）
- **GitHub Actions**（CI/CD）

### 外部サービス

- **Google Analytics 4**（イベント計測）
- **Google Tag Manager**（タグ管理）
- **UTAGE**（メール登録・特典配信）
- **Vercel**（ホスティング）

---

## 🚀 環境構築

### 前提条件

- **Node.js** 18.x 以上
- **npm** 9.x 以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/threads-diagnosis-app.git
cd threads-diagnosis-app/frontend

# 依存パッケージをインストール
npm install
```

### 環境変数設定

`.env.local`ファイルを`frontend/`ディレクトリに作成し、以下の環境変数を設定してください。

```bash
# Google Analytics 4測定ID
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Managerコンテナ ID
VITE_GTM_ID=GTM-XXXXXXX

# UTAGE登録フォームベースURL
VITE_UTAGE_BASE_URL=https://utage-system.com/p/XXXXXXXXXX

# 商品LPのURL
VITE_LP_URL=https://your-lp-domain.com/threads-auto-system
```

**取得先**:
- GA4測定ID: https://analytics.google.com/
- GTM コンテナID: https://tagmanager.google.com/
- UTAGE URL: UTAGE管理画面
- LP URL: 商品LP作成後

---

## 💻 開発サーバー起動

```bash
# 開発サーバー起動（ポート3247）
npm run dev

# ブラウザで開く
# http://localhost:3247
```

**ポート設定**:
- デフォルト: `3247`（複数プロジェクト並行開発のため、一般的でないポートを使用）
- 変更方法: `vite.config.ts`の`server.port`を編集

---

## 🧪 テスト

### 全テスト実行

```bash
# 全テスト実行（watchモード）
npm test

# 全テスト実行（1回のみ）
npm run test:unit

# カバレッジ確認
npm run test:coverage

# 期待カバレッジ: 71%以上
```

### テスト結果

- **テストファイル数**: 5ファイル
- **テスト数**: 105テスト
- **カバレッジ**: 71.34%

---

## 🏗️ ビルド

```bash
# プロダクションビルド
npm run build

# ビルド成功確認
# dist/ディレクトリが生成される
# dist/index.html、dist/assets/が作成される

# ビルドサイズ確認
du -sh dist/
# 期待値: 1MB未満（実測: 0.95MB）
```

### ビルド出力

```
dist/
├── index.html           # 0.46 kB
└── assets/
    ├── index-*.css      # 0.88 kB
    └── index-*.js       # 961 kB（gzip後: 294 kB）
```

---

## 🔍 Lint

```bash
# ESLint実行
npm run lint

# エラーがないことを確認
```

**Lint設定**:
- 関数行数: 100行以下
- ファイル行数: 700行以下
- 複雑度: 10以下
- 行長: 120文字

---

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   │   ├── common/          # 共通コンポーネント（ErrorBoundary等）
│   │   ├── diagnosis/       # 診断ページ専用コンポーネント
│   │   └── result/          # 結果ページ専用コンポーネント（レーダーチャート等）
│   ├── pages/               # ページコンポーネント
│   │   ├── DiagnosisPage.tsx   # P-001: 診断ページ
│   │   └── ResultPage.tsx      # P-002: 結果ページ
│   ├── logic/               # ビジネスロジック
│   │   ├── diagnosisLogic.ts   # 診断ロジック（スコア計算、タイプ判定）
│   │   └── messageEngine.ts    # カスタムメッセージ生成
│   ├── stores/              # Zustand状態管理
│   │   └── diagnosisStore.ts   # 診断状態（回答、進捗）
│   ├── types/               # 型定義
│   │   └── index.ts            # 全型定義を集約
│   ├── hooks/               # カスタムフック
│   │   └── useGA4.ts           # GA4イベント送信フック
│   ├── utils/               # ユーティリティ関数
│   │   ├── sessionStorage.ts   # sessionStorage管理
│   │   └── urlGenerator.ts     # UTMパラメータ付きURL生成
│   ├── constants/           # 定数
│   │   ├── QUESTIONS.ts        # 12問の質問定義
│   │   ├── MESSAGE_RULES.ts    # カスタムメッセージルール
│   │   └── TYPES.ts            # タイプ定義（T1-T4）
│   ├── App.tsx              # ルーティング設定
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── public/                  # 静的ファイル
├── dist/                    # ビルド出力（git管理外）
├── package.json             # 依存パッケージ
├── vite.config.ts           # Vite設定
├── tsconfig.json            # TypeScript設定
└── README.md                # このファイル
```

---

## 🎨 主要機能

### P-001: 診断ページ

- 12問の質問フォーム（1問1画面）
- 4択選択（カード型UI）
- プログレスバー表示
- 戻るボタン（診断ページ内のみ）
- sessionStorageに回答を保存

### P-002: 結果ページ

- タイプ判定表示（6タイプ: BEGINNER/T1-T4/BALANCED）
- 100点満点スコア表示
- 4軸レーダーチャート（Recharts）
- カスタムメッセージ（1-2文）
- 次の一手（今日/今週/今月）
- タイプ別商品提案CTA
- UTAGE統合（特典登録ボタン）
- GA4イベント送信

---

## 📊 診断ロジック

### スコア計算

- 各軸3問×8点満点=24点
- 4軸合計96点満点
- 100点換算: `(rawScore / 24) * 100`

### タイプ判定

| タイプ | 判定条件 | 状態説明 |
|--------|---------|---------|
| **BEGINNER** | 全軸0点 | まだ何も決めていない「はじまりの状態」 |
| **T1（迷子）** | 設計力が最低 | 誰に何を届けるかがまだ定まっていない状態 |
| **T2（整え途中）** | 量産力が最低 | やる気はあるのに続ける仕組みがない状態 |
| **T3（伸ばせる）** | 改善力が最低 | 頑張っているのに成果に変わらない状態 |
| **T4（もったいない）** | 事業力が最低 | 発信は強いのに売上に変換できていない状態 |
| **BALANCED** | 全軸85点以上 | 続けるための土台がきれいに整っている状態 |

---

## 🔗 外部サービス統合

### Google Analytics 4

**イベント一覧**（7イベント）:

| イベント名 | 説明 | パラメータ |
|-----------|------|-----------|
| `Diagnosis_Start` | 診断開始 | `diagnosis_type`, `diagnosis_score`, `timestamp` |
| `Diagnosis_Complete` | 診断完了 | 同上 |
| `Result_View` | 結果表示 | 同上 |
| `CTA_View` | CTA表示 | 同上 |
| `CTA_Click` | CTAクリック | 同上 |
| `Benefit_Register` | 特典登録 | 同上 |
| `LP_Click` | LP遷移 | 同上 |

### UTAGE統合

- 特典: 「Threads運用 7日間リセット設計シート」
- タイプ別タグ付け（T1/T2/T3/T4）
- UTMパラメータ自動付与

---

## 📝 デプロイ

詳細は[DEPLOYMENT.md](../DEPLOYMENT.md)を参照してください。

**クイックスタート**:

```bash
# 1. Vercelにログイン
# https://vercel.com/

# 2. GitHubリポジトリを連携

# 3. 環境変数を設定
# - VITE_GA4_MEASUREMENT_ID
# - VITE_GTM_ID
# - VITE_UTAGE_BASE_URL
# - VITE_LP_URL

# 4. デプロイ実行
# mainブランチにpushすると自動デプロイ
```

---

## 🧑‍💻 開発規約

### 命名規則

- **ファイル名**: PascalCase（コンポーネント）、camelCase（ユーティリティ）
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **型/インターフェース**: PascalCase

### コード品質

- **TypeScript strictモード**: 有効
- **未使用の変数/import**: 禁止
- **console.log本番環境**: 禁止（開発中は許可）
- **関数行数**: 100行以下
- **ファイル行数**: 700行以下

---

## 🐛 トラブルシューティング

### 問題1: ビルドエラー

```bash
# 依存パッケージを再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 問題2: テスト失敗

```bash
# キャッシュをクリア
npm test -- --clearCache
npm test
```

### 問題3: 開発サーバーが起動しない

```bash
# ポート3247が使用中の場合
lsof -ti:3247 | xargs kill -9
npm run dev
```

---

## 📄 ライセンス

Private（商用利用）

---

## 📞 サポート

- **GitHubリポジトリ**: プロジェクトのGitHubリポジトリでIssueを作成
- **ドキュメント**: [CLAUDE.md](../CLAUDE.md)、[DEPLOYMENT.md](../DEPLOYMENT.md)

---

**最終更新**: 2026-01-15
**次回レビュー推奨日**: 2026-02-15（1ヶ月後）