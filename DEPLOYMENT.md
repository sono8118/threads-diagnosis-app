# Threads運用診断アプリ - デプロイ手順書

**最終更新**: 2026-01-15
**対象環境**: Vercel（本番環境）

---

## 📋 デプロイ前チェックリスト

- [ ] 全テストが通ること（`npm test`）
- [ ] ビルドエラーがないこと（`npm run build`）
- [ ] 環境変数が正しく設定されていること
- [ ] LPのURLが本番環境用に更新されていること

---

## 🚀 Vercelデプロイ手順

### 1. 初回デプロイ（GitHub連携）

#### Step 1: GitHubリポジトリ準備

```bash
# ローカルで最新コミット作成
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### Step 2: Vercel連携

1. **Vercelダッシュボードにログイン**
   - URL: https://vercel.com/
   - GitHubアカウントでログイン

2. **New Project作成**
   - 「Add New...」→「Project」をクリック
   - GitHubリポジトリを選択: `Threads運用診断`
   - 「Import」をクリック

3. **プロジェクト設定**
   ```yaml
   Project Name: threads-diagnosis-app（自動生成、変更可）
   Framework Preset: Vite（自動検出）
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **環境変数設定**

   「Environment Variables」セクションで以下を設定：

   | 変数名 | 値 | 備考 |
   |--------|-----|------|
   | `VITE_GA4_MEASUREMENT_ID` | `G-QCY3LS1JDY` | Google Analytics 4測定ID |
   | `VITE_GTM_ID` | `GTM-NWHK3T3B` | Google Tag Manager ID |
   | `VITE_UTAGE_BASE_URL` | `https://utage-system.com/p/MWHWhUfP4DEQ` | UTAGE登録フォームURL |
   | `VITE_LP_URL` | `https://your-lp-domain.com/threads-auto-system` | 商品LPのURL（本番用に更新） |

   **重要**: `VITE_LP_URL`は本番LPのURLに必ず更新してください。

5. **デプロイ実行**
   - 「Deploy」ボタンをクリック
   - ビルド・デプロイが自動で開始（約1-2分）

6. **デプロイ完了確認**
   - デプロイ完了後、URLが発行されます
   - 例: `https://threads-diagnosis-app.vercel.app`
   - ブラウザで動作確認

---

### 2. 2回目以降のデプロイ（自動デプロイ）

GitHubの`main`ブランチにpushすると自動でデプロイされます。

```bash
# ローカルで変更をコミット
git add .
git commit -m "Update: 〇〇機能を追加"
git push origin main

# Vercelが自動でビルド・デプロイを開始
# 完了通知がメールで届きます
```

**デプロイ状況確認**:
- Vercelダッシュボード → Deployments
- ビルドログ、エラーログを確認可能

---

### 3. ブランチデプロイ（プレビュー環境）

`main`以外のブランチにpushすると、プレビュー環境が自動作成されます。

```bash
# featureブランチを作成
git checkout -b feature/new-function
git add .
git commit -m "Add: 新機能を追加"
git push origin feature/new-function

# Vercelが自動でプレビュー環境を作成
# URLが発行されます（例: threads-diagnosis-app-git-feature-new-function.vercel.app）
```

**メリット**:
- 本番環境に影響なくテスト可能
- プルリクエストごとにプレビューURL発行

---

## 🔧 ビルド・テストコマンド

### ローカル開発

```bash
# 開発サーバー起動（ポート3247）
cd frontend
npm run dev

# ブラウザで開く
# http://localhost:3247
```

### ビルド確認

```bash
# プロダクションビルド
cd frontend
npm run build

# ビルド成功確認
# dist/ディレクトリが生成される
# dist/index.html、dist/assets/が作成される

# ビルドサイズ確認
du -sh dist/
# 期待値: 1MB未満
```

### テスト実行

```bash
# 全テスト実行
cd frontend
npm test

# カバレッジ確認
npm run test:coverage

# 期待値: 71%以上
```

### Lint実行

```bash
# ESLint実行
cd frontend
npm run lint

# エラーがないことを確認
```

---

## ⚙️ 環境変数の詳細

### 必須環境変数

| 変数名 | 説明 | 取得先 | 例 |
|--------|------|--------|-----|
| `VITE_GA4_MEASUREMENT_ID` | Google Analytics 4測定ID | https://analytics.google.com/ | `G-QCY3LS1JDY` |
| `VITE_GTM_ID` | Google Tag Managerコンテナ ID | https://tagmanager.google.com/ | `GTM-NWHK3T3B` |
| `VITE_UTAGE_BASE_URL` | UTAGE登録フォームベースURL | UTAGE管理画面 | `https://utage-system.com/p/XXXXXXXX` |
| `VITE_LP_URL` | 商品LPのURL | 商品LP作成後 | `https://your-lp.com/threads-system` |

### 開発環境専用（オプション）

| 変数名 | 説明 | 開発時の値 |
|--------|------|-----------|
| `NODE_ENV` | 環境識別子 | `development` |
| `VITE_FRONTEND_URL` | フロントエンドURL | `http://localhost:3247` |
| `VITE_E2E_MODE` | E2Eテストモード | `true` |

**注意**: 本番環境（Vercel）では開発環境専用変数は不要です。

---

## 🐛 トラブルシューティング

### 1. ビルドエラー: `Module not found`

**症状**:
```
Error: Cannot find module '@mui/material'
```

**原因**: 依存パッケージがインストールされていない

**解決策**:
```bash
cd frontend
npm install
npm run build
```

---

### 2. デプロイエラー: `Build failed`

**症状**: Vercelでビルドが失敗する

**原因**: TypeScriptコンパイルエラー、または環境変数未設定

**解決策**:
1. ローカルでビルドテスト
   ```bash
   cd frontend
   npm run build
   ```
2. エラーメッセージを確認してコードを修正
3. Vercelの環境変数が正しく設定されているか確認

---

### 3. 本番環境でGA4イベントが計測されない

**症状**: Google Analyticsに診断イベントが記録されない

**原因**: 環境変数`VITE_GA4_MEASUREMENT_ID`が未設定、または誤っている

**解決策**:
1. Vercelダッシュボード → Settings → Environment Variables
2. `VITE_GA4_MEASUREMENT_ID`の値を確認
3. 正しい測定ID（`G-XXXXXXXXXX`形式）に更新
4. 再デプロイ

---

### 4. UTAGE遷移時にエラーが出る

**症状**: 「特典を受け取る」ボタンクリック時にエラー

**原因**: `VITE_UTAGE_BASE_URL`が未設定、または誤っている

**解決策**:
1. ブラウザの開発者コンソールでエラーメッセージ確認
2. Vercelの環境変数`VITE_UTAGE_BASE_URL`を確認
3. 正しいUTAGE URLに更新
4. 再デプロイ

---

### 5. バンドルサイズ警告

**症状**: ビルド時に`Some chunks are larger than 500 kB`警告

**原因**: MUI + Recharts + React Routerのサイズ

**現状**: 問題なし（gzip後294KB、1MB未満）

**将来的な最適化**:
- Rechartsの動的インポート検討
- コード分割（dynamic import）

---

## 📊 デプロイ後の確認項目

### 機能確認

- [ ] 診断ページが表示される
- [ ] 12問全て回答できる
- [ ] 結果ページが表示される
- [ ] レーダーチャートが表示される
- [ ] 「特典を受け取る」ボタンが動作する（UTAGE遷移）
- [ ] 「商品LPへ」ボタンが動作する

### 計測確認

- [ ] GA4イベント送信確認（Diagnosis_Start, Diagnosis_Complete, Result_View等）
- [ ] GTMプレビューモードでdataLayer確認
- [ ] UTMパラメータが正しく付与されている

### パフォーマンス確認

- [ ] PageSpeed Insightsで90点以上
- [ ] LighthouseでPerformance 90点以上
- [ ] 初回読み込み3秒以内

---

## 🔐 セキュリティ確認

### HTTPSとセキュリティヘッダー

Vercelは以下を自動設定します：

- ✅ HTTPS強制
- ✅ HSTS（HTTP Strict Transport Security）
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy

追加設定は不要です。

---

## 📞 サポート

### 問題が解決しない場合

1. **Vercelサポート**: https://vercel.com/support
2. **GitHubリポジトリIssue**: プロジェクトのGitHubリポジトリでIssueを作成
3. **ログ確認**: Vercelダッシュボード → Deployments → ビルドログ

---

## 📝 デプロイ履歴

| 日付 | バージョン | 変更内容 | デプロイ担当 |
|------|-----------|---------|------------|
| 2026-01-15 | v1.0.0 | 初回本番デプロイ | - |
| | | | |

---

**最終更新**: 2026-01-15
**次回レビュー推奨日**: 2026-02-15（1ヶ月後）