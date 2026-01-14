# Threads運用診断アプリ - 要件定義テンプレート

**このファイルは要件定義エージェント（@要件定義）が読み込んで、自動的に requirements.md を生成するためのテンプレートです。**

---

## 1. プロジェクト概要

### 1.1 成果目標

Threads自動投稿システム（29,800円）の販売促進のため、診断アプリによる納得形成と自動導線を構築する。LP直行型から、診断経由型に変更することで、成約率を2.4倍に向上させる。

**本質的な目的**（ラダリング法で特定）:
ターゲットユーザー（副業・個人事業主予備軍、ひとり起業家）の経済的自立と自己実現を支援する。

### 1.2 成功指標

#### 定量的指標
- 時間削減率: 100%（60時間/月 → 0時間/月）
- コスト削減率: 98.3%（180,000円/月 → 3,000円/月）
- エラー削減率: 100%（15% → 0%）
- 売上向上率: 140%（14,900円/月 → 35,760円/月）
- 月間診断受診者: 30-50人
- 診断完了率: 80%以上
- LP遷移率（CTR）: 25%以上

#### 定性的指標
- ユーザーが自分の現在地を理解し、納得して商品を購入する
- 「診断を受けてよかった」と感じるユーザー体験
- 運用が自動化され、時間的自由が得られる
- スケーラブルな集客導線が確立される

---

## 2. システム全体像

### 2.1 現状業務フロー（As-Is）

```
Threads投稿
   ↓
プロフィール
   ↓
LP（29,800円）← ❌ いきなり商品提案
   ↓
購入 ← ❌ 心理的ハードル高すぎ（CVR 0.5%）
```

**問題点**:
- 教育ステップがない
- 信頼関係ゼロでいきなり販売
- 納得形成なし
- 見込み客リストが溜まらない

### 2.2 To-Be業務フロー（AI自動化後）

```
Threads投稿
   ↓
「無料診断受けませんか？」← 🎯 心理的ハードル低
   ↓
診断アプリ（12問・2-3分）← 🤖 完全自動
   ↓
診断結果（即時表示）← 🤖 完全自動
 ├─ あなたの現在地（スコア・タイプ）← 💡 納得形成
 ├─ 詰まりポイント可視化 ← 💡 課題認識
 ├─ 次の一手提示 ← 💡 解決策提示
 └─ 商品提案（自然な流れ）← ✅ 納得して購入
   ↓
特典登録（メール）← 📧 見込み客リスト化
   ↓
特典配信（自動）← 🤖 完全自動
   ↓
購入 ← ✅ CVR 10%（20倍向上）
```

### 2.3 ユーザーロールと権限

**MVPルート（究極のMVP：2ページ）を採用**

| ロール | アクセス可能な機能 | 認証 |
|--------|-------------------|------|
| **ゲスト（匿名）** | 診断受診、結果閲覧 | 不要 |
| **特典登録ユーザー** | 診断結果 + 特典受け取り | メールのみ |

**認証不要の理由**:
- MVP優先（最小限の機能で価値検証）
- ユーザー体験の最大化（登録障壁を排除）
- 個人情報管理の軽量化

---

## 3. ページ詳細仕様

### 3.1 P-001: 診断ページ（質問フォーム）

#### 目的
ユーザーのThreads運用の現在地を診断し、4軸スコア（設計力・量産力・改善力・事業力）を算出する。

#### 主要機能
- 12問の質問表示（1問1画面、サクサク進行）
- 4択選択（0点/3点/6点/8点）
- プログレスバー表示（N/12問）
- 戻るボタン（前の質問に戻れる）
- 同意チェック（診断開始前）

#### 必要な操作

| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 診断開始 | 同意チェック確認 | チェックボックス | 質問1表示 |
| 質問回答 | 4択から1つ選択 | 選択肢クリック | 次の質問表示 |
| 戻る | 前の質問に戻る | 戻るボタンクリック | 前の質問表示 |
| 診断完了 | 12問全回答 | 最終回答送信 | 結果ページ遷移 |

#### 処理フロー

1. **診断開始**
   - ランディング画面表示
   - 同意チェックボックス提示
   - 「診断を始める」ボタンクリック
   - GA4イベント: `Diagnosis_Start`

2. **質問回答ループ（12回）**
   - 質問N/12を表示
   - 4択から選択
   - 回答をローカル状態に保存
   - GA4イベント: `Answer_Question_N`
   - 自動的に次の質問へ遷移

3. **診断完了**
   - 最終質問（12問目）回答
   - フロントエンドでスコア計算（即時）
   - 結果ページ（P-002）に遷移
   - GA4イベント: `Diagnosis_Complete`

#### データ構造（フロントエンド状態管理）

```yaml
DiagnosisState:
  currentQuestionIndex: number (0-11)
  answers:
    - questionId: number
      value: 0 | 3 | 6 | 8
  progress: number (0-100%)

DiagnosisResult:
  rawScores:
    design: number (0-24)
    production: number (0-24)
    improvement: number (0-24)
    business: number (0-24)
  normalizedScores:
    design: number (0-100)
    production: number (0-100)
    improvement: number (0-100)
    business: number (0-100)
  totalScore: number (0-100)
  diagnosisType: 'T1' | 'T2' | 'T3' | 'T4'
  isZeroScore: boolean
  isExcellent: boolean (85点以上)
  lowestAxis: 'design' | 'production' | 'improvement' | 'business'
```

#### 12問の質問内容（確定版）

**【軸1】設計力（戦略）**
- Q1: あなたの発信を届けたい人を、30秒で説明できますか？
- Q2: あなたの投稿で、フォロワーは何を得られますか？（3つ即答できるか）
- Q3: 他の発信者との違いを、一言で説明できますか？

**【軸2】量産力（実行力）**
- Q4: 今すぐ投稿しようと思ったとき、ネタがストックされていますか？
- Q5: 投稿を作るとき、使っている型（テンプレート）はありますか？
- Q6: 1つの投稿を作るのに、平均どのくらい時間がかかりますか？

**【軸3】改善力（PDCA）**
- Q7: 投稿後、数値（いいね・保存・コメント）をどのくらいの頻度で確認していますか？
- Q8: 伸びた投稿・伸びなかった投稿の違いを説明できますか？
- Q9: 過去に伸びた投稿を、意図的に再現して投稿したことはありますか？

**【軸4】事業力（マネタイズ）**
- Q10: Threadsから案内できる商品・サービスはありますか？
- Q11: Threadsから商品・サービスまでの導線は整っていますか？
- Q12: Threadsをきっかけに、実際に商品・サービスが売れたことはありますか？

各質問の選択肢は4択（0点/3点/6点/8点）で統一。

---

### 3.2 P-002: 診断結果ページ

#### 目的
診断結果を可視化し、ユーザーの現在地・詰まりポイント・次の一手を提示。自然な流れで商品（自動投稿システム）への導線を作る。

#### 主要機能
- タイプ判定表示（T1/T2/T3/T4）
- 100点満点スコア表示
- 4軸レーダーチャート（設計力・量産力・改善力・事業力）
- カスタムメッセージ（1-2文）
- 次の一手（今日/今週/今月）
- 商品提案CTA（タイプ別）
- 特典登録フォーム（メールアドレス入力）
- スクショ推奨案内
- LPへのリンク（UTMパラメータ付き）

#### 必要な操作

| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 結果表示 | 診断結果の可視化 | 診断データ | レポート画面 |
| 特典登録 | メールアドレス入力 | メールアドレス | 登録完了メッセージ |
| LPリンク | 商品LPへ遷移 | ボタンクリック | LP表示（別タブ） |
| スクショ | 結果を保存 | ユーザー操作 | （ブラウザ機能） |

#### 処理フロー

1. **結果ページ表示**
   - 診断データをプロップスで受け取る
   - タイプ判定ロジック実行（フロントエンド）
   - スコア計算（96点→100点換算）
   - カスタムメッセージ生成（if-thenルール）
   - GA4イベント: `Diagnosis_Complete` + `Type: T1-T4` + `Score: N`

2. **結果の可視化**
   - タイプ名表示（例: T1「設計力重視型」）
   - スコア表示（大きく100点表記）
   - 4軸レーダーチャート描画
   - カスタムメッセージ表示（該当する場合）
   - 次の一手（今日/今週/今月）表示

3. **商品提案CTA**
   - タイプ別のメッセージ表示
     - T1/T2: 「まずは仕組み化から始めましょう」→ フロント29,800円
     - T3/T4: 「ここから先は伴走が必要です」→ バックエンド案内
   - UTMパラメータ付きLPリンク生成
   - ボタン表示「自動投稿システムの詳細を見る」

4. **LPリンククリック**
   - GA4イベント: `Click_LP_Link` + `Type: T1-T4` + `Score: N`
   - 別タブでLP表示
   - UTMパラメータ:
     ```
     utm_source=diagnosis_app
     utm_medium=result_page
     utm_campaign=threads_diagnosis
     utm_content=T1-T4
     utm_term=score_N
     ```

5. **特典登録（オプション）**
   - メールアドレス入力フォーム表示
   - バリデーション（メール形式チェック）
   - バックエンドAPI呼び出し: `POST /api/register-benefit`
   - 登録完了メッセージ表示
   - 特典配信（Resend経由）

#### データ構造

```yaml
ResultPageData:
  diagnosisResult: DiagnosisResult (P-001から継承)
  customMessages: string[] (1-2個)
  nextSteps:
    today: string
    thisWeek: string
    thisMonth: string
  ctaContent:
    title: string
    description: string
    buttonText: string
    lpUrl: string (UTMパラメータ付き)
```

#### カスタムメッセージ生成ルール（if-then）

```yaml
Rules:
  - condition: totalScore == 0
    message: "現在のThreads運用には改善の余地が大きくあります。まずは基本的な投稿習慣の確立から始めましょう。"
    priority: 100

  - condition: totalScore >= 85
    message: "素晴らしい！Threadsを効果的に活用できています。この調子で継続的な改善を続けましょう。"
    priority: 95

  - condition: Q6 == 0 (45分以上)
    message: "投稿作成に45分以上かかっている場合、テンプレート化やAIツールの活用を検討しましょう。"
    priority: 80

  - condition: Q7 == 0 (ほとんど見ない)
    message: "改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。"
    priority: 80

  - condition: Q10 == 0 (商品なし)
    message: "出口がないため、どれだけ頑張っても成果に変換されません。"
    priority: 80
```

---

## 4. データ設計概要

### 4.1 主要エンティティ

```yaml
User:
  概要: 診断ユーザー（特典登録時に作成）
  主要属性:
    - id (UUID)
    - email (string, unique)
    - name (string, optional)
    - createdAt (datetime)
    - updatedAt (datetime)
  関連:
    - DiagnosisResult (1対多)

DiagnosisResult:
  概要: 診断結果データ
  主要属性:
    - id (UUID)
    - userId (UUID, nullable) # 特典登録前はnull
    - answers (JSON) # 12問の回答
    - rawScores (JSON) # 4軸の生スコア
    - normalizedScores (JSON) # 100点換算スコア
    - totalScore (integer) # 総合スコア
    - diagnosisType (enum: T1/T2/T3/T4)
    - createdAt (datetime)
  関連:
    - User (多対1, optional)

AnalyticsEvent:
  概要: GA4イベントのバックアップ（オプション）
  主要属性:
    - id (UUID)
    - eventName (string)
    - diagnosisResultId (UUID, optional)
    - userId (UUID, optional)
    - metadata (JSON)
    - createdAt (datetime)
```

### 4.2 エンティティ関係図

```
User ─┬─ DiagnosisResult (1対多)
      │
      └─ AnalyticsEvent (1対多, optional)

DiagnosisResult ─── AnalyticsEvent (1対多, optional)
```

**注意**: MVPではUserは特典登録時のみ作成。匿名診断の場合、DiagnosisResultのuserIdはnull。

### 4.3 バリデーションルール

```yaml
User.email:
  - ルール: 有効なメール形式
  - 理由: 特典配信のため

User.name:
  - ルール: 2文字以上（入力時）
  - 理由: パーソナライゼーションのため（オプション）

DiagnosisResult.answers:
  - ルール: 12問全て回答必須
  - 理由: 不完全な診断結果を防ぐ

DiagnosisResult.totalScore:
  - ルール: 0-100の整数
  - 理由: 表示用スコア範囲
```

---

## 5. 制約事項

### 外部API制限

- **Resend（メール配信）**:
  - 無料枠: 月3,000通（1日100通制限）
  - 超過時: $0.0004/通
  - 対策: 月間診断受診者30-50人想定のため、無料枠内で十分

- **Google Analytics 4**:
  - 無料プラン: イベント上限なし
  - 制限: データ保持期間14ヶ月（無料）

### 技術的制約

- **ブラウザ対応**: モダンブラウザのみ（Chrome、Firefox、Safari、Edge最新版）
- **レスポンシブ**: iPhone SE以上のサイズで動作保証
- **データ保存**: ブラウザ閉じるまで（sessionStorage）、永続保存なし
- **PDF生成**: MVP では実装しない（将来機能）

---

## 5.1 セキュリティ要件

### 基本方針
本プロジェクトは **CVSS 3.1** に準拠したセキュリティ要件を満たすこと。

### プロジェクト固有の必須要件

**認証機能なし（MVP）**:
- ✅ 入力値のサニタイゼーション（XSS対策）
- ✅ HTTPS強制（本番環境）
- ✅ セキュリティヘッダー設定（本番環境）
- ✅ エラーメッセージでの情報漏洩防止

**メール配信機能あり**:
- ✅ メールアドレスのバリデーション
- ✅ スパム送信防止（1ユーザー1日1回制限）
- ✅ Resend APIキーの環境変数管理

### 運用要件：可用性とヘルスチェック

**ヘルスチェックエンドポイント（バックエンド）**:
- エンドポイント: `/api/health`
- 要件: データベース接続確認、5秒以内の応答

**グレースフルシャットダウン**:
- SIGTERMシグナルハンドラー実装
- タイムアウト: 8秒

---

## 6. 複合API処理（バックエンド内部処理）

### 複合処理-001: 特典登録＋配信

**トリガー**: ユーザーが結果ページで「特典を受け取る」ボタンクリック

**フロントエンドAPI**: `POST /api/register-benefit`

**リクエストボディ**:
```json
{
  "email": "user@example.com",
  "name": "山田太郎" (optional),
  "diagnosisResultId": "uuid"
}
```

**バックエンド内部処理**:
1. **診断結果取得**: PostgreSQLから診断結果を取得
2. **ユーザー登録 or 取得**:
   - メールアドレスで既存ユーザー検索
   - なければ新規作成、あれば既存ユーザー取得
3. **診断結果とユーザー紐付け**: `diagnosisResult.userId` を更新
4. **特典配信**（Resend API）:
   - メール送信
   - 件名: 「【特典】Threads運用診断レポート」
   - 本文: タイプ別メッセージ + 診断結果サマリー
   - 将来: PDF添付（Phase 2で実装）

**レスポンス**:
```json
{
  "message": "特典を送信しました",
  "userId": "uuid"
}
```

**外部サービス依存**: Resend API、PostgreSQL

**エラーハンドリング**:
- 診断結果が見つからない: `404 Not Found`
- メール送信失敗: `500 Internal Server Error` + リトライ処理

---

## 7. 技術スタック

### フロントエンド
- **フレームワーク**: React 18
- **言語**: TypeScript 5
- **UIライブラリ**: MUI v6
- **状態管理**: Zustand（軽量グローバル状態）
- **サーバー状態**: React Query
- **ルーティング**: React Router v6
- **ビルドツール**: Vite 5
- **チャート**: Recharts（レーダーチャート）

### バックエンド
- **言語**: Python 3.11+
- **フレームワーク**: FastAPI
- **ORM**: SQLAlchemy
- **マイグレーション**: Alembic

### データベース
- **メインDB**: PostgreSQL 15+（Neon推奨）
  - サーバーレス、無料枠で十分
  - 自動スケーリング

### インフラ
- **フロントエンド**: Vercel（自動デプロイ、無料枠）
- **バックエンド**: Google Cloud Run（コンテナ、従量課金）
- **データベース**: Neon（PostgreSQL、無料枠）
- **メール**: Resend（無料枠月3,000通）

### 開発ツール
- **バージョン管理**: Git + GitHub
- **CI/CD**: GitHub Actions
- **テスト**:
  - Vitest（ユニット）
  - React Testing Library（統合）
  - Playwright（E2E）
- **Lint/Format**:
  - ESLint（関数100行、ファイル700行制限）
  - Prettier（行長120文字）

---

## 8. 必要な外部サービス・アカウント

### 必須サービス

| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| Neon | PostgreSQLホスティング | https://neon.tech | 無料枠で十分 |
| Resend | メール配信 | https://resend.com | 無料枠月3,000通 |
| Vercel | フロントエンドホスティング | https://vercel.com | 無料プラン |
| Google Cloud Run | バックエンドホスティング | https://cloud.google.com | 従量課金 |
| Google Analytics 4 | アクセス解析 | https://analytics.google.com | 無料 |
| Google Tag Manager | タグ管理 | https://tagmanager.google.com | 無料 |

### オプションサービス（Phase 2以降）

| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| LINE Messaging API | LINE連携 | https://developers.line.biz | フリープラン200通/月 |
| Sentry | エラー監視 | https://sentry.io | 無料枠あり |

---

## 9. AI自動化プロンプト集

### プロンプト1: 診断ロジック（フロントエンド実装）

**目的**: 12問の回答から4軸スコアとタイプ判定を実行

**実装**: TypeScript関数

```typescript
function calculateDiagnosis(answers: UserAnswers): DiagnosisResult {
  // 1. 軸ごとのスコア計算（各軸3問×8点=24点満点）
  const rawScores = calculateAxisScores(answers);

  // 2. 100点換算
  const normalizedScores = normalizeScores(rawScores);

  // 3. 合計点
  const totalScore = Math.round(
    Object.values(normalizedScores).reduce((sum, s) => sum + s, 0) / 4
  );

  // 4. 特別判定
  const isZeroScore = Object.values(rawScores).every(s => s === 0);
  const isExcellent = Object.values(normalizedScores).every(s => s >= 85);

  // 5. 最低軸特定
  const lowestAxis = findLowestAxis(rawScores);

  // 6. タイプ判定（同点時は優先順位: design > production > improvement > business）
  const diagnosisType = determineDiagnosisType(rawScores, lowestAxis);

  return {
    rawScores,
    normalizedScores,
    totalScore,
    diagnosisType,
    isZeroScore,
    isExcellent,
    lowestAxis
  };
}
```

---

### プロンプト2: カスタムメッセージ生成（MessageRuleEngine）

**目的**: 特定の回答パターンに対してカスタムメッセージを生成

**実装**: JSON駆動ルールエンジン

**ルール定義例（message-rules.json）**:
```json
{
  "version": "1.0.0",
  "rules": [
    {
      "id": "score-zero",
      "priority": 100,
      "conditions": {
        "logic": "AND",
        "conditions": [
          { "field": "totalScore", "operator": "equals", "value": 0 }
        ]
      },
      "message": "現在のThreads運用には改善の余地が大きくあります。まずは基本的な投稿習慣の確立から始めましょう。",
      "enabled": true
    }
  ]
}
```

---

## 10. 暗黙知Few-shot例集

**形式知化の例**:

| 暗黙知（元） | 形式知化ルール | プロンプト実装 |
|------------|--------------|--------------|
| 「なんとなく続かない人」 | 投稿作成時間45分以上 + ネタストックなし | if (Q6==0 && Q4==0) → 「型とストックがないため消耗している」 |
| 「伸びない理由が分からない人」 | 数字を見ない + 仮説なし | if (Q7==0 && Q8==0) → 「改善ループが止まっている」 |
| 「頑張っても売れない人」 | 商品なし + 導線なし | if (Q10==0 && Q11==0) → 「出口がない」 |

---

## 11. 実装ロードマップ

### MVP（2ページ）: 15日間

| Phase | タスク | 工数 |
|-------|--------|------|
| 1 | 型定義 + 診断ロジック | 2日 |
| 2 | 診断フォームUI | 2日 |
| 3 | 結果表示UI + レーダーチャート | 2日 |
| 4 | カスタムメッセージエンジン | 2日 |
| 5 | バックエンドAPI | 2日 |
| 6 | 特典配信（Resend統合） | 2日 |
| 7 | GA4/GTM統合 | 1日 |
| 8 | テスト・調整 | 2日 |

### Phase 2（機能拡張）: +7日

| タスク | 工数 |
|--------|------|
| PDF生成機能 | 2日 |
| LINE連携 | 3日 |
| ダッシュボード（管理画面） | 2日 |

---

## 12. Google Analytics（GA4）トラッキング設計

### 主要イベント

| イベント名 | カテゴリ | アクション | ラベル | 値 |
|-----------|---------|-----------|--------|-----|
| `Diagnosis_Start` | Diagnosis | Start | Quiz Started | - |
| `Answer_Question_N` | Diagnosis | Answer Question | Question N | 0-8 |
| `Diagnosis_Complete` | Diagnosis | Complete | Type: T1-T4 | スコア |
| `Click_LP_Link` | Conversion | Click LP Link | Type: T1-T4 | スコア |

### UTMパラメータ設計

LPへのリンクに付与：

```
utm_source=diagnosis_app
utm_medium=result_page
utm_campaign=threads_diagnosis
utm_content=T1 (タイプ)
utm_term=score_85 (スコア)
```

### コンバージョンファネル

```
診断開始（100人）
  ↓ 完了率80%
診断完了（80人）← GA4イベント: Diagnosis_Complete
  ↓ CTR 25%
LPクリック（20人）← GA4イベント: Click_LP_Link
  ↓ CVR 10%（UTAGE LPで計測）
購入（2人）
```

---

## 13. 要件定義エージェントへの指示

**@要件定義エージェント へ**:

このテンプレートを読み込んで、`docs/requirements.md` を自動生成してください。

**スキップするステップ**:
- Step#1（成果目標の特定）← 既に完了
- Step#2（実現可能性調査）← 既に完了
- Step#2.5（開発アプローチの選択）← MVPルート選択済み
- Step#3（認証・権限設計）← MVPは認証なし

**開始するステップ**:
- **Step#4（ページリスト）から開始**してください
- ページ数: 2ページ（診断ページ + 結果ページ）
- 認証: 不要（匿名診断）

**追加の注意事項**:
- GA4/GTMトラッキングの実装を忘れずに含めてください
- Resend統合の詳細を記載してください
- カスタムメッセージエンジンの実装詳細を含めてください
- 12問の質問内容は変更しないでください（確定版を使用）

---

**テンプレート作成日**: 2026-01-14
**次のステップ**: 要件定義エージェント（@要件定義）に渡して requirements.md を生成
