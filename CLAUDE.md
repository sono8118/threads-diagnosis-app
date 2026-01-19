# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: Threads運用診断アプリ
開始日: 2026-01-14
開発アプローチ: 究極のMVP（2ページ）
技術スタック:
  frontend: React 18 + TypeScript 5 + Vite 5
  ui: MUI v6
  state: Zustand
  routing: React Router v6
  chart: Recharts
  hosting: Vercel
  analytics: Google Analytics 4 + Google Tag Manager
  integration: UTAGE（メール登録・特典配信）
```

## 開発環境
```yaml
ポート設定:
  # 複数プロジェクト並行開発のため、一般的でないポートを使用
  frontend: 3247

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - VITE_GA4_MEASUREMENT_ID   # Google Analytics 4測定ID
    - VITE_GTM_ID                # Google Tag Manager ID
    - VITE_UTAGE_BASE_URL        # UTAGE登録フォームベースURL
    - VITE_LP_URL                # 商品LPのURL
```

## テスト認証情報
```yaml
開発用データ:
  # MVPではユーザー認証なし（匿名診断）
  # 以下はテスト用の診断データ

テスト診断パターン:
  パターン1_全0点:
    - 全質問で0点を選択
    - 期待結果: totalScore=0, type=T1（最優先）

  パターン2_満点:
    - 全質問で8点を選択
    - 期待結果: totalScore=100, isExcellent=true

  パターン3_T1迷子タイプ:
    - 設計力: 0-3点（最低）
    - その他: 6-8点
    - 期待結果: type=T1

  パターン4_T2しんどいタイプ:
    - 量産力: 0-3点（最低）
    - その他: 6-8点
    - 期待結果: type=T2

  パターン5_T3伸ばせるタイプ:
    - 改善力: 0-3点（最低）
    - その他: 6-8点
    - 期待結果: type=T3

  パターン6_T4もったいないタイプ:
    - 継続力: 0-3点（最低）
    - その他: 6-8点
    - 期待結果: type=T4

外部サービス:
  UTAGE:
    テスト用URL: （開発時に設定）
    タイプ別タグ: T1/T2/T3/T4

  Google Analytics 4:
    測定ID: （開発時に設定）
    計測イベント: 6イベント（Diagnosis_Start, Diagnosis_Complete, Result_View, CTA_Click, Benefit_Register, LP_Click）

  Google Tag Manager:
    コンテナID: （開発時に設定）
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: DiagnosisPage.tsx, ResultPage.tsx)
  - ユーティリティ: camelCase.ts (例: diagnosisLogic.ts, messageEngine.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: QUESTIONS.ts, MESSAGE_RULES.ts)
  - フック: use + PascalCase.ts (例: useDiagnosis.ts, useGA4.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
  - Zustandストア: useDiagnosisStore, useResultStore等
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止（開発中は許可）
  - エラーハンドリング必須
  - 関数行数: 100行以下（96.7%カバー）
  - ファイル行数: 700行以下（96.9%カバー）
  - 複雑度: 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
  - Prettier適用
```

## プロジェクト固有ルール

### ディレクトリ構造
```yaml
src/
  components/          # 再利用可能なコンポーネント
    common/           # 共通コンポーネント（Button, Card等）
    diagnosis/        # 診断ページ専用コンポーネント
    result/           # 結果ページ専用コンポーネント

  pages/              # ページコンポーネント
    DiagnosisPage.tsx # P-001: 診断ページ
    ResultPage.tsx    # P-002: 結果ページ

  logic/              # ビジネスロジック
    diagnosisLogic.ts # 診断ロジック（スコア計算、タイプ判定）
    messageEngine.ts  # カスタムメッセージ生成

  stores/             # Zustand状態管理
    diagnosisStore.ts # 診断状態（回答、進捗）
    resultStore.ts    # 結果状態（スコア、タイプ）

  types/              # 型定義
    index.ts          # 全型定義を集約

  hooks/              # カスタムフック
    useDiagnosis.ts   # 診断ロジックフック
    useGA4.ts         # GA4イベント送信フック

  utils/              # ユーティリティ関数
    sessionStorage.ts # sessionStorage管理
    urlGenerator.ts   # UTMパラメータ付きURL生成

  constants/          # 定数
    QUESTIONS.ts      # 12問の質問定義
    MESSAGE_RULES.ts  # カスタムメッセージルール
    TYPES.ts          # タイプ定義（T1-T4）
```

### sessionStorage管理
```yaml
キー名規則:
  - threads_diagnosis_session  # 診断セッションデータ

保存データ構造:
  DiagnosisSession:
    answers: Answer[]           # 12問の回答
    computedScores: object      # 4軸スコア
    computedType: string        # T1/T2/T3/T4
    timestamp: number           # 作成日時

重要ルール:
  - 結果ページはsessionStorageにデータがない場合、診断トップへリダイレクト
  - ブラウザタブを閉じるとデータは自動削除
  - 永続化はしない（MVP方針）
```

### GA4イベント
```yaml
イベント送信タイミング:
  Diagnosis_Start:      診断開始ボタンクリック時
  Diagnosis_Complete:   12問全回答完了時
  Result_View:          結果ページ表示時
  CTA_Click:            商品提案CTAクリック時
  Benefit_Register:     特典登録ボタンクリック時
  LP_Click:             LPリンククリック時

イベントパラメータ（全イベント共通）:
  diagnosis_type: T1/T2/T3/T4
  diagnosis_score: 0-100
  timestamp: ISO8601形式
```

### UTMパラメータ
```yaml
固定値:
  utm_source: diagnosis
  utm_medium: app
  utm_campaign: threads_manager

動的値:
  utm_content: T1/T2/T3/T4（タイプ別）
  utm_term: score_N（スコア別、0-100）

生成ルール:
  - 全リンク（UTAGE、LP）に付与
  - urlGenerator.ts で一元管理
```

## プロジェクト固有の実装方針

### MVP最適化版の原則
```yaml
実装しない機能:
  - バックエンドAPI
  - データベース永続化
  - ユーザー認証
  - 履歴保存・再閲覧
  - 管理画面
  - PDF生成
  - メール自動配信（UTAGE外）

実装する機能:
  - 診断フォーム（12問）
  - フロント完結の診断ロジック
  - 結果表示（レーダーチャート含む）
  - カスタムメッセージ生成
  - UTAGE遷移
  - GA4イベント計測
```

### 診断ロジック
```yaml
スコア計算:
  - 各軸3問×8点満点=24点
  - 4軸合計96点満点
  - 100点換算: (rawScore / 24) * 100

タイプ判定:
  - 4軸のうち最低スコアの軸で判定
  - 同点時の優先順位（スコア帯による使い分け）:
    - 低～中スコア帯（80点未満の軸がある）: 継続力 > 設計力 > 量産力 > 改善力
    - 高得点帯（全軸80点以上）: 改善力 > 継続力 > 量産力 > 設計力
  - 判定結果: T1/T2/T3/T4

特殊判定:
  - 全0点: isZeroScore = true
  - 全85点以上: isExcellent = true
```

### カスタムメッセージエンジン
```yaml
実装方式:
  - JSON駆動ルールエンジン
  - constants/MESSAGE_RULES.ts で定義
  - 優先度順にルール評価
  - 最大2個のメッセージ表示

ルール構造:
  id: ルール識別子
  priority: 優先度（100が最高）
  conditions: 条件式
  message: 表示メッセージ
  enabled: 有効/無効フラグ
```

## 🆕 最新技術情報（知識カットオフ対応）

```yaml
# 2026年1月時点の技術情報

React 18:
  - Concurrent Features安定版
  - Automatic Batching対応
  - Suspense for Data Fetching推奨

MUI v6:
  - 最新安定版
  - Emotion（CSS-in-JS）がデフォルト
  - テーマカスタマイズ強化

Recharts:
  - v2.x系を使用
  - レーダーチャート: <RadarChart> コンポーネント
  - レスポンシブ: <ResponsiveContainer> 必須

Vercel:
  - Vite対応完全サポート
  - 環境変数: VITE_* プレフィックス必須
  - 自動HTTPS有効

Google Analytics 4:
  - gtag.js またはGoogle Tag Manager経由
  - イベント駆動型計測
  - カスタムパラメータ無制限
```

## トラブルシューティング

### よくある問題と解決策

```yaml
問題1: 結果ページで「データがありません」エラー
原因: sessionStorageにデータが保存されていない
解決策:
  - 診断ページで全12問に回答したか確認
  - ブラウザのsessionStorageが有効か確認
  - 別タブで開いていないか確認

問題2: レーダーチャートが表示されない
原因: Rechartsのインポートエラーまたはデータ形式エラー
解決策:
  - Rechartsが正しくインストールされているか確認
  - データが正しい形式（4軸スコア）か確認
  - ResponsiveContainerで囲んでいるか確認

問題3: GA4イベントが計測されない
原因: GTM設定ミスまたはイベント送信タイミングエラー
解決策:
  - GTMプレビューモードで確認
  - dataLayerにイベントがpushされているか確認
  - 本番環境でのみ動作する設定になっていないか確認

問題4: UTAGE遷移時にパラメータが消える
原因: URL生成ロジックのエラー
解決策:
  - urlGenerator.ts の実装を確認
  - encodeURIComponentが適切に使用されているか確認
  - UTAGEのURL形式に合っているか確認
```

## 開発フロー

### 開発開始手順

1. **Phase 2（推奨）**: Git/GitHub管理
   - リポジトリ初期化
   - 初回コミット

2. **Phase 3**: フロントエンド基盤構築
   - `npm create vite@latest . -- --template react-ts`
   - MUI、Zustand、React Router、Recharts インストール
   - 型定義作成（src/types/index.ts）
   - 診断ロジック実装（src/logic/diagnosisLogic.ts）

3. **Phase 4**: ページ実装
   - P-001: 診断ページ
   - P-002: 結果ページ

4. **Phase 5-8**: 機能実装
   - カスタムメッセージエンジン
   - UTAGE統合
   - レーダーチャート
   - GA4イベント

5. **Phase 9**: テスト
   - ユニットテスト（Vitest）
   - 統合テスト（React Testing Library）

6. **Phase 10**: デプロイ
   - Vercel連携
   - 環境変数設定
   - 本番環境テスト

---

## 13. E2Eテスト自律実行の絶対原則

**【重要】セッション開始時・compact後の自動判定**

このセクションはE2Eテストオーケストレーターによって自動生成されました。

---

**最初に必ず専門知識を注入してください**

E2Eテスト実行中の場合、以下を実行してから開始してください：

```
inject_knowledge ツールで keyword: "@E2Eテストオーケストレーター"
を実行してから開始してください。（初回必須・compact後も必須）
```

重要：キーワードは "@E2Eテストオーケストレーター"
をそのまま使用してください。変換や推測は不要です。

準備完了です。まず知識注入を実行してから、タスクを開始してください。

---

**E2Eテストオーケストレーター実行中の判定**:
- SCOPE_PROGRESS.mdに「## 📊 E2Eテスト全体進捗」が存在する場合
- または、セッション再開時に前回のメッセージに「E2Eテスト」「オーケストレーター」キーワードがある場合

**セッション開始時・compact後の自動処理**:
1. 上記の判定基準でE2Eテスト実行中と判定
2. inject_knowledge('@E2Eテストオーケストレーター') を必ず実行
3. docs/e2e-best-practices.md の存在確認（なければ初期テンプレート作成）
4. SCOPE_PROGRESS.mdから [ ] テストの続きを自動で特定
5. [x] のテストは絶対にスキップ
6. ユーザー確認不要、完全自律モードで継続
7. ページ選定も自動（未完了ページを上から順に選択）
8. 停止条件：全テスト100%完了のみ

**5回エスカレーション後の処理**:
- チェックリストに [-] マークを付ける
- docs/e2e-test-history/skipped-tests.md に記録
- 次のテストへ自動で進む（停止しない）

**ベストプラクティス自動蓄積**:
- 各テストで成功した方法を docs/e2e-best-practices.md に自動保存
- 後続テストが前のテストの知見を自動活用
- 試行錯誤が減っていく（学習効果）

**重要**:
- この原則はCLAUDE.mdに記載されているため、compact後も自動で適用される
- セッション開始時にこのセクションがない場合、オーケストレーターが自動で追加する

---

**CLAUDE.md作成日**: 2026-01-14
**次のステップ**: Phase 2（Git/GitHub管理）または Phase 3（フロントエンド基盤構築）
