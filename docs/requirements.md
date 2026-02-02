# Threads運用診断アプリ - 要件定義書

## 要件定義の作成原則
- **「あったらいいな」は絶対に作らない**
- **拡張可能性のための余分な要素は一切追加しない**
- **将来の「もしかして」のための準備は禁止**
- **今、ここで必要な最小限の要素のみ**

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
特典登録（UTAGE）← 📧 見込み客リスト化
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
| **特典登録ユーザー** | 診断結果 + 特典受け取り（UTAGE管理） | メールのみ（UTAGE側） |

**認証不要の理由**:
- MVP優先（最小限の機能で価値検証）
- ユーザー体験の最大化（登録障壁を排除）
- 個人情報管理の軽量化（UTAGE側で一元管理）

---

## 3. ページ詳細仕様

### 3.1 P-001: 診断ページ（質問フォーム）

#### 目的
ユーザーのThreads運用の現在地を診断し、4軸スコア（設計力・量産力・改善力・継続力）を算出する。

#### UIデザインコンセプト
- やさしく寄り添う"セルフチェック型診断UI"
- 丸みのあるカード、柔らかい影、広めの余白
- 安心感のある配色とトーン（無機質なSaaS管理画面ではない）
- ページタイトル: 「Threads運用診断」（実装済み）
- 全画面背景: グラデーション（`linear-gradient(180deg, #f8f9fa 0%, #e8f4f8 100%)`）

#### 主要機能
- 12問の質問表示（1問1画面、サクサク進行）
- 4択選択（点数表記なし、カード型、2×2グリッド配置、共通選択肢）
- プログレスバー表示（N/12問 + 残り設問数「あと11問」など）
- **戻るボタン（診断ページ内のみ、結果ページからは戻れない）**
- 同意チェック（診断開始前、カード全体がクリック可能）
- 同意未チェック時のダイアログ（MUIダイアログ、ネイティブアラート廃止）

#### 必要な操作

| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 診断開始 | 同意チェック確認 | チェックボックス | 質問1表示 |
| 質問回答 | 4択から1つ選択 | 選択肢クリック | 次の質問表示 |
| 戻る | 前の質問に戻る（診断ページ内のみ） | 戻るボタンクリック | 前の質問表示 |
| 診断完了 | 12問全回答 | 最終回答送信 | 結果ページ遷移 |

#### 処理フロー

1. **診断開始**
   - ランディング画面表示
     - キャッチコピー：「12問（2〜3分）で、今のThreads運用の状態と次に楽になる一歩が見えてきます」
     - 診断でわかること：
       - 今のあなたのThreadsの状態
       - うまく進まない理由
       - これから楽になる一歩
   - 同意チェックボックス提示（文言：「診断結果に合ったアドバイスを受け取ります」）
   - 同意カード全体がクリック可能（「静かな同意・うなずき」のトーン）
   - 「診断を始める」ボタンクリック
   - GA4イベント: `Diagnosis_Start`

2. **質問回答ループ（12回）**
   - 質問N/12を表示
   - 4択から選択
   - 回答をsessionStorageに保存
   - GA4イベント: `Answer_Question_N`（オプション）
   - 自動的に次の質問へ遷移

3. **診断完了**
   - 最終質問（12問目）回答
   - フロントエンドでスコア計算（即時）
   - sessionStorageに保存:
     - `answers`: 12問の回答
     - `computedScores`: 4軸スコア
     - `computedType`: タイプ判定（T1/T2/T3/T4）
     - `timestamp`: セッション作成日時
   - 結果ページ（P-002）に遷移
   - GA4イベント: `Diagnosis_Complete`

#### データ構造（sessionStorage）

```typescript
interface DiagnosisSession {
  answers: Answer[];           // 12問の選択
  computedScores: {            // 4軸スコア（0-100）
    design: number;
    production: number;
    improvement: number;
    continuation: number;
  };
  computedType: 'T1' | 'T2' | 'T3' | 'T4';  // タイプ判定結果
  timestamp: number;           // セッション作成日時
}

interface Answer {
  questionId: number;          // 1-12
  value: 0 | 3 | 6 | 8;        // 選択した点数
}
```

#### 12問の質問内容（やさしく寄り添うトーン版 - 実装済み）

**【軸1】設計力（戦略）**
- Q1: あなたは発信を「どんな人」に届けたいか、はっきり説明できますか？
- Q2: あなたの投稿で、フォロワーは「どんな変化や気づき」を得られるかを3つ説明できますか？
- Q3: あなたの発信で、「ここは大事にしている」といえるポイントはありますか？

**【軸2】量産力（実行力）**
- Q4: 今すぐ投稿しようと思ったとき、迷わずネタを出せますか？
- Q5: 投稿を作るときに、毎回使っている型（テンプレート）がありますか？
- Q6: 1つの投稿を、負担を感じず短時間で作れていますか？

**【軸3】改善力（PDCA）**
- Q7: 投稿後の数値を見て、「良かった理由・悪かった理由」を考えていますか？
- Q8: 数値をもとに、次の投稿内容を変えたことがありますか？
- Q9: 伸びた投稿の要素を意識して、再現を試みていますか？

**【軸4】継続力（仕組みと習慣）**
- Q10: 投稿作成や投稿作業を「決まった流れ」で行えていますか？
- Q11: 忙しい日でも迷わず動ける投稿の仕組み（手順・環境）がありますか？
- Q12: Threadsの投稿を「がんばらなきゃ」ではなく「自然な習慣」として続けられていますか？

**選択肢の仕様**:
- 4択（点数表記なし、UIから削除）
- 共通選択肢: 「はい、できます」「だいたいできます」「あまりできません」「できません」
- カード型デザイン、2×2グリッド配置
- 角丸と淡い背景色、ホバー時と選択時の視覚的フィードバック
- 内部的には8点/6点/3点/0点で採点

---

### 3.2 P-002: 診断結果ページ

#### 目的
診断結果を可視化し、ユーザーの現在地・詰まりポイント・次の一手を提示。自然な流れで商品（自動投稿システム）への導線を作る。

#### UIデザインコンセプト
- **全体トーン**: 「やさしく・あたたかく・安心感のある仕上がり」
- **基本方針**: 「今の自分をそっと理解してあげる画面」「評価する診断」ではなく「ちゃんと見てもらえた」「少し安心した」と感じられるUI
- **色使い**: 淡いブルー・ベージュ系を基調、無機質な白を避ける
- **影**: 強すぎず、ふわっと浮いている程度（`box-shadow: 0 2px 8px rgba(0,0,0,0.05)`）
- **角丸**: やや大きめ（`border-radius: 16px`）で"やさしい箱感"を出す
- **余白**: 広めにして読みやすさを確保
- **ボタン**: ふっくら・丸みを増やし、ホバー時の動きは最小限に

#### レーダーチャートデザイン仕様
- **サイズ**: 450×450px（診断の中心として視線が集まるように）
- **線**: シャープすぎず、丸みのある印象（`stroke-linecap="round"`）
- **ポイント**: 小さめ・柔らかい色（`r="5"`程度）
- **最低軸の強調**: ポイントを少し大きく（`r="6"`）、くすんだオレンジ（`#d9a88a`）で「警告」ではなく「気づきの色」として表現
- **データ塗りつぶし**: 半透明のブルー（`rgba(90, 159, 212, 0.2)`）

#### 各セクションのトーン
1. **タイプ表示エリア**: カード感を減らし、背景に自然に溶け込ませる。安心メッセージ「あなたの頑張り方が悪いわけではありません。」を明確に表示
2. **4軸スコア説明**: 青（安心・強み）とオレンジ（責めない注意ポイント）で色分け、角丸大きめ
3. **「今のあなたを言葉にすると」**: "心のゾーン"として背景をほんのりトーンアップ（`#f8fbfd`）、左側に細い淡いブルーのライン
4. **これからの一歩**: アイコン（🟢🔵🟣）で視覚的に区別、余白広めで読みやすく
5. **LP導線ブロック**: 「選択肢をそっと置いている場所」として押し売り感を出さない、淡いブルー背景（`#f4f9fd`）
6. **無料特典ブロック**: 「やさしいご褒美」として淡いベージュオレンジ背景（`#fff8f4`）

#### 主要機能
- タイプ判定表示（12種類: BEGINNER/T1-T4/BALANCED/MIXタイプ6種 + タイプ名 + 状態説明）
- 100点満点スコア表示
- 4軸レーダーチャート（設計力・量産力・改善力・継続力）
- カスタムメッセージ（1-3文: 主メッセージ + 刺さる指摘最大2つ）
- 次の一手（今日/今週/今月）
- **商品提案CTA（タイプ別12パターン、感情訴求ラベル）**
- **特典登録ボタン（UTAGE遷移、UTMパラメータ付き）**
- スクショ推奨案内
- **結果ページから診断ページへの戻るボタンなし（一方通行）**
- **テキスト改行表示対応（`\n` → `<br>` 変換実装済み）**

#### 必要な操作

| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 結果表示 | 診断結果の可視化 | sessionStorageから取得 | レポート画面 |
| 特典登録 | UTAGE登録フォームへ遷移 | ボタンクリック | UTAGE画面（別タブ） |
| LPリンク | 商品LPへ遷移 | ボタンクリック | LP表示（別タブ） |
| スクショ | 結果を保存 | ユーザー操作 | （ブラウザ機能） |

#### 処理フロー

1. **結果ページ表示**
   - sessionStorageからデータ取得
   - **データが存在しない場合 → 診断トップ（P-001）へリダイレクト**
   - タイプ判定ロジック実行（フロントエンド）
   - スコア表示（100点換算）
   - カスタムメッセージ生成（if-thenルール）
   - GA4イベント: `Result_View` + `Type: T1-T4` + `Score: N`

2. **結果の可視化**
   - タイプ名表示（例: T2「しんどいタイプ」）
   - 状態説明表示（例: 「やる気はあるのに続ける仕組みがない状態」）
   - スコア表示（大きく100点表記）
   - 4軸レーダーチャート描画（Recharts）
   - カスタムメッセージ表示（該当する場合）
   - 次の一手（今日/今週/今月）表示

3. **商品提案CTA（6タイプ別出し分け + デザイン強化）**
   - **タイプ別CTA文言表示**（6パターン: BEGINNER/T1/T2/T3/T4/BALANCED）
   - タイトル（見出し）: タイプごとに最適化
   - 説明文（本文）: タイプごとの心理状態に合わせた訴求
   - ボタンテキスト: 「Threadsがラクになる方法を見てみる」（全タイプ共通）
   - UTMパラメータ付きLPリンク生成
   - **強化デザイン仕様**:
     - 背景: グラデーション（`linear-gradient(135deg, #f8fbff 0%, #f0f6fa 100%)`）
     - ボーダー: 2px solid #b8d4e8
     - 影: `0 4px 16px rgba(90, 159, 212, 0.15)`
     - タイトル: fontSize 21px、fontWeight 600
     - ボタン: variant='contained'、青色（#5a9fd4）
     - ホバー効果: 明るく + 上移動（translateY(-2px)）
   - GA4イベント: `CTA_View`（表示時、インプレッション計測）

4. **CTAクリック**
   - GA4イベント: `CTA_Click` + `Type: BEGINNER/T1-T4/BALANCED` + `Score: N`
   - 別タブでLP表示
   - UTMパラメータ:
     ```
     utm_source=diagnosis
     utm_medium=app
     utm_campaign=threads_manager
     utm_content=BEGINNER/T1/T2/T3/T4/BALANCED (タイプ別)
     utm_term=score_72 (スコア別)
     ```

5. **特典登録（UTAGE遷移）**
   - 「特典を受け取る」ボタン表示
   - GA4イベント: `Benefit_Register` + `Type: T1-T4` + `Score: N`
   - UTAGE登録フォームへ遷移（別タブ）
   - UTMパラメータ付きURL:
     ```
     utm_source=diagnosis
     utm_medium=app
     utm_campaign=threads_manager
     utm_content=T1 (タイプ別)
     utm_term=score_72 (スコア別)
     ```
   - 特典: 「**Threads運用 7日間リセット設計シート**」（PDF + Googleスプレッドシート）

6. **LP遷移**
   - GA4イベント: `LP_Click` + `Type: T1-T4` + `Score: N`
   - LPへ遷移（別タブ）

#### データ構造

```typescript
interface ResultPageData {
  diagnosisResult: DiagnosisSession; // sessionStorageから取得
  customMessages: string[];          // 1-2個
  nextSteps: {
    today: string;
    thisWeek: string;
    thisMonth: string;
  };
  ctaContent: {
    title: string;
    description: string;
    buttonText: string;              // 感情訴求ラベル
    lpUrl: string;                   // UTMパラメータ付き
  };
}
```

#### タイプ判定詳細（6タイプ + MIXタイプ）

| タイプID | タイプ名 | 判定条件 | 状態説明 |
|---------|---------|---------|---------|
| **BEGINNER** | はじまりタイプ | 全軸0点 | まだ何も決めていない「はじまりの状態」 |
| **T1** | 迷子タイプ | 設計力が最低 | 誰に何を届けるかがまだ定まっていない状態 |
| **T2** | 整え途中タイプ | 量産力が最低 | やる気はあるのに続ける仕組みがない状態 |
| **T3** | 伸ばせるタイプ | 改善力が最低 | 頑張っているのに成果に変わらない状態 |
| **T4** | もったいないタイプ | 継続力が最低 | スキルやセンスは十分だが、続ける仕組みがない状態 |
| **BALANCED** | 安定成長タイプ | 全軸85点以上 | 続けるための土台がきれいに整っている状態 |
| **T1T2-MIX** | 設計力×量産力が弱い複合タイプ | 設計力と量産力の差が1〜5点 | まずは方向性を決めて、型を作ることから |
| **T1T3-MIX** | 設計力×改善力が弱い複合タイプ | 設計力と改善力の差が1〜5点 | ターゲット設定と数字の振り返り、両方から |
| **T1T4-MIX** | 設計力×継続力が弱い複合タイプ | 設計力と継続力の差が1〜5点 | ターゲット設定と投稿の流れ、両方から |
| **T2T3-MIX** | 量産力×改善力が弱い複合タイプ | 量産力と改善力の差が1〜5点 | 型作りと振り返り、両方から |
| **T2T4-MIX** | 量産力×継続力が弱い複合タイプ | 量産力と継続力の差が1〜5点 | 型作りと投稿の流れ、両方から |
| **T3T4-MIX** | 改善力×継続力が弱い複合タイプ | 改善力と継続力の差が1〜5点 | 振り返りと投稿の流れ、両方から |

**判定ロジック（2026-01-31確定版 - パターンB実装済み）**:
1. 全軸0点 → BEGINNER
2. 全軸85点以上 → BALANCED
3. **最低軸と2番目に低い軸の差が1〜5点 → MIXタイプ**（確定仕様 - パターンB）
   - 例：量産力30点、継続力33点（差3点）→ T2T4-MIX
   - 例：設計力40点、改善力40点（差0点）→ 優先順位でT1（完全同点はMIX判定しない）
   - 主メッセージ：「量産力と継続力が同時に弱い状態です」
4. それ以外 → 4軸スコアのうち最低スコアの軸でタイプ判定（T1-T4）
   - 同点の場合の優先順位:
     - **低～中スコア帯（80点未満の軸がある）**: 継続力 > 設計力 > 量産力 > 改善力
     - **高得点帯（全軸80点以上）**: 改善力 > 継続力 > 量産力 > 設計力

#### カスタムメッセージ生成ルール（if-then）

**メッセージ構造（3層）**:

1. **主メッセージ（必須1つ）**: タイプ別総論（T1〜T4、MIXタイプ含む）
2. **刺さる指摘（最大2つ）**: 回答に紐づく具体的指摘（if-thenルール）
3. **次の一手**: 今日/今週/今月のアクション

**表示順（鉄板フロー）**:
```
① 主メッセージ（あなたは◯◯タイプです）
② 刺さる指摘1（最優先）
③ 刺さる指摘2（次点）
④ 次の一手（今日/今週/今月）
⑤ CTA（商品提案）
```

---

### 🆕 HIGH帯ガード（2026-01-30追加）

**目的**: 高得点者（総合80点以上）に厳しすぎる指摘を出さない

**総合スコア帯の定義**:
```typescript
const overallBand =
  totalScore >= 80 ? 'HIGH'  // soft/normalのみ許可
  : totalScore >= 60 ? 'MID'  // 全指摘OK
  : 'LOW';                    // 全指摘OK
```

**severity（厳しさレベル）の定義**:
- `hard`: 致命的な指摘（例：「消耗しています」「存在していない」）
- `normal`: 標準的な指摘（例：「時間を半減できます」）
- `soft`: やさしい指摘（例：「さらに改善できます」）

**フィルタリングルール**:
```typescript
// HIGH帯の場合、hard指摘を除外
if (overallBand === 'HIGH') {
  messages = messages.filter(m => m.severity !== 'hard');
}
```

---

### 🆕 動的優先度（2026-01-30追加）

**目的**: 同じ回答でも、軸スコアによって優先度を調整

**計算式**:
```typescript
dynamicPriority = basePriority + (deficit * 3) + (axisDeficit * 0.1)

// deficit: 8 - questionValue（0-8点の不足量）
// axisDeficit: 100 - axisScore（軸スコアの不足量）
```

**効果**:
- 同じQ6=0でも、量産力30点の人（優先度高）と70点の人（優先度低）で差がつく
- より深刻な問題が優先的に表示される

---

### 主メッセージ（タイプ別、必須1つ）

#### 単一タイプ（T1〜T4）のメッセージ

**MID/LOW帯（totalScore < 80）の場合（デフォルト）**:

| タイプ | 主メッセージ |
|--------|------------|
| T1（迷子タイプ） | 「誰に何を届けるかが定まっていない状態です。まずはターゲット設定から始めましょう。」 |
| T2（整え途中タイプ） | 「やる気はあるのに続ける仕組みがない状態です。仕組みと習慣で楽になりましょう。」 |
| T3（伸ばせるタイプ） | 「頑張っているのに成果に変わらない状態です。改善ループを回して成果を出しましょう。」 |
| T4（もったいないタイプ） | 「今は、頑張ればできるのに、「頑張らないと続かない形」になっています。仕組みを整えれば、迷わず・疲れず・自然に回る運用に変わります。」 |

**HIGH帯（totalScore >= 80）の場合（伸びしろ翻訳版）**:

| タイプ | HIGH帯専用メッセージ |
|--------|------------|
| T1（迷子タイプ） | 「発信の土台は、すでにかなり整っています。あとは「誰に・何を届けるか」を少しだけ言語化できると、今ある力が、よりまっすぐ届くようになります。」 |
| T2（整え途中タイプ） | 「投稿を続ける力は、すでに身についています。ここに「型」や「流れ」をひとつ足すだけで、今よりずっと軽く、安定した運用に変わります。」 |
| T3（伸ばせるタイプ） | 「伸びる兆しは、すでにしっかり出ています。あとは「なぜ伸びたのか」を振り返れるようになると、偶然の成果が、再現できる成長に変わります。」 |
| T4（もったいないタイプ） | 「頑張りどころは、もう分かっています。あとは「頑張らなくても回る形」を整えるだけで、今の力を、無理なく長く活かせるようになります。」 |

#### MIXタイプのメッセージ（全スコア帯共通）

| タイプ | 主メッセージ |
|--------|------------|
| T1T2-MIX | 「設計力と量産力が同時に弱い状態です。まずはターゲット設定と型作りから始めましょう。」 |
| T1T3-MIX | 「設計力と改善力が同時に弱い状態です。ターゲット設定と改善ループの確立が必要です。」 |
| T1T4-MIX | 「設計力と継続力が同時に弱い状態です。方向性の設定と続ける仕組み作りから始めましょう。」 |
| T2T3-MIX | 「量産力と改善力が同時に弱い状態です。型作りと改善ループの両方を整えましょう。」 |
| T2T4-MIX | 「量産力と継続力が同時に弱い状態です。続けられる仕組みと型の両方が必要です。」 |
| T3T4-MIX | 「改善力と継続力が同時に弱い状態です。成果の確認と継続の仕組み、両方を整えましょう。」 |

---

### 刺さる指摘（最大2つ、優先度順）

**優先順位ルール**（上から順に評価、該当したものを最大2つ選択）:

**優先度範囲**:
- ① 0点が含まれるもの（致命傷）: priority 90-100
- ② 時間系（行動コスト直撃）: priority 85
- ③ 改善停止系（数字見ない・仮説なし）: priority 75-80
- ④ 継続・習慣化系（仕組みがない）: priority 90-100
- ⑤ その他（特殊・補助指摘）: priority 60-69

#### ① 0点が含まれるもの（致命傷、最優先）
- **Q6 = 0（投稿作成45分以上）**:
  - priority: 100
  - **severity: hard**
  - message: 「投稿作成に45分以上かかっているため、型とストックがなく消耗しています。」

- **Q7 = 0（数字ほとんど見ない）**:
  - priority: 95
  - **severity: hard**
  - message: 「改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。」

- **Q10 = 0（投稿の流れが決まっていない）**:
  - priority: 95
  - **severity: hard**
  - message: 「投稿の流れが決まっていないため、毎回迷いが発生し、継続が不安定になります。」

#### ② 時間系（行動コスト直撃）
- **Q6 = 3（投稿作成30分以上）**:
  - priority: 85
  - **severity: normal**
  - message: 「投稿作成に30分以上かかっている場合、テンプレート化で時間を半減できます。」

#### ③ 改善停止系（数字見ない・仮説なし）
- **Q8 = 0（伸びた/伸びない理由わからない）**:
  - priority: 80
  - **severity: hard**
  - message: 「伸びる理由がわからないため、再現性がなく運頼みの状態です。」

- **Q9 = 0（再現投稿なし）**:
  - priority: 75
  - **severity: normal**
  - message: 「成功を再現できていないため、成果が安定しません。」

#### ④ 継続・習慣化系（仕組みがない）
- **Q11 = 0（投稿の仕組みがない）**:
  - priority: 100
  - **severity: hard**
  - message: 「投稿の流れを支える仕組みがないため、毎回ゼロから考える運用になっています。まずは「同じ流れで回す形」を作りましょう。」

- **Q12 = 0（習慣化できていない）**:
  - priority: 90
  - **severity: hard**
  - message: 「運用が「頑張り」になっており、長く続けるのが難しい状態です。」

#### ⑤ その他（特殊・補助指摘）
- **totalScore = 0（全0点）**:
  - priority: 69（特殊判定、最優先）
  - **severity: hard**
  - message: 「現在のThreads運用には改善の余地が大きくあります。まずは基本的な投稿習慣の確立から始めましょう。」

- **totalScore >= 85（優秀）**:
  - priority: 60
  - **severity: soft**
  - message: 「素晴らしい！Threadsを効果的に活用できています。この調子で継続的な改善を続けましょう。」

---

### 評価ロジック（実装方針）

```typescript
function generateCustomMessages(
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): string[] {
  // 1. 総合スコア帯を判定
  const overallBand =
    diagnosisResult.totalScore >= 80 ? 'HIGH'
    : diagnosisResult.totalScore >= 60 ? 'MID'
    : 'LOW';

  // 2. 主メッセージ（タイプ別、必ず1つ）
  const mainMessage = getMainMessageByType(diagnosisResult.diagnosisType);

  // 3. 刺さる指摘（優先度順に評価、最大2つ）
  const rules = MESSAGE_RULES.rules
    .filter(rule => rule.enabled)
    .filter(rule => evaluateCondition(rule.conditions, diagnosisResult, answers))
    // 🆕 HIGH帯の場合、hard指摘を除外
    .filter(rule => {
      if (overallBand === 'HIGH' && rule.severity === 'hard') {
        return false;
      }
      return true;
    })
    // 🆕 動的優先度を計算
    .map(rule => ({
      ...rule,
      dynamicPriority: calculateDynamicPriority(
        rule.priority,
        answers,
        diagnosisResult.normalizedScores
      )
    }))
    .sort((a, b) => b.dynamicPriority - a.dynamicPriority)
    .slice(0, 2);

  // 4. 結合
  return [mainMessage, ...rules.map(r => r.message)];
}

// 🆕 動的優先度計算
function calculateDynamicPriority(
  basePriority: number,
  answers: Answer[],
  axisScores: AxisScores
): number {
  // 該当質問の回答値と軸スコアから動的に優先度を調整
  // deficit（不足量）が大きいほど優先度が上がる
  const deficit = 8 - questionValue; // 0-8
  const axisDeficit = 100 - axisScore; // 0-100

  return basePriority + (deficit * 3) + (axisDeficit * 0.1);
}
```

---

### 表示例

**T2（しんどいタイプ）+ Q6=0 + Q7=0 の場合**:

```
① 主メッセージ:
「やる気はあるのに続ける仕組みがない状態です。型とストックで楽になりましょう。」

② 刺さる指摘1（priority: 100）:
「投稿作成に45分以上かかっているため、型とストックがなく消耗しています。」

③ 刺さる指摘2（priority: 95）:
「改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。」

④ 次の一手:
- 今日: 「過去の投稿を3つ見返して、反応が良かったテーマをメモする」
- 今週: 「投稿の型を1つ作り、5回使ってみる」
- 今月: 「ネタストックを30個作り、週5投稿を自動化する」

⑤ CTA:
「まずは仕組みを入れるプランを見る」（LPへ）
```

---

### タイプ別CTA文言（12パターン: 基本6 + MIX6）

結果ページの商品提案CTAブロックは、診断タイプごとに最適化された文言を表示します。

#### 基本タイプ（6種類）

##### BEGINNER（はじまりタイプ）
```yaml
タイトル: まっさらな今だからこそ、いちばん楽に始められます

説明文: |
  まだ何も決まっていない状態は、迷っているのではなく「自由な状態」です。
  どんな方向にも進める今だからこそ、最初からしんどい形を選ぶ必要はありません。

  まずは「考えなくても動ける形」を持つだけで、Threadsはぐっと気楽になります。
  方向性は、動きながら自然と見えてきます。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T1（迷子タイプ）
```yaml
タイトル: 決めきれなくても、大丈夫なやり方があります

説明文: |
  方向が定まらないまま止まってしまうのは、あなたの意志が弱いからではありません。
  「続けられる形」がないだけです。

  先に仕組みを持っておけば、迷っても止まらずに進めます。
  決断はあとでいい。まずは動ける状態を作りませんか。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T2（整え途中タイプ）
```yaml
タイトル: 頑張り続けなくても、続く仕組みがあります

説明文: |
  やる気はあるのに、毎回エネルギーを使いすぎていませんか。
  続かない原因は努力不足ではなく、仕組み不足です。

  「頑張らなくても回る形」に変えられたら、
  Threadsはもっと静かに、安定して続けられます。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T3（伸ばせるタイプ）
```yaml
タイトル: 偶然の成果を、安心できる形に変えられます

説明文: |
  反応が出てきた今はチャンスでもあり、不安定な時期でもあります。
  「なぜ伸びたのか」が分からないままだと、また不安になります。

  再現できる形にしておけば、
  頑張りすぎなくても成果を積み上げられます。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T4（もったいないタイプ）
```yaml
タイトル: その頑張り、ちゃんと残せる形にしませんか

説明文: |
  発信も内容も悪くないのに、
  積み上がらず消えてしまっているのが一番もったいない状態です。

  「出して終わり」から「残る形」へ。
  仕組みがあるだけで、努力の価値が変わります。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### BALANCED（安定成長タイプ）
```yaml
タイトル: 今の調子を、守れる形にしておきませんか

説明文: |
  すでに整っている今こそ、仕組みの力が活きます。
  調子がいいときほど、人は無理をして崩れがちです。

  考えなくても回る形を持っておけば、
  今の安定を長く保てます。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

#### MIXタイプ（6種類）

##### T1T2-MIX（設計力×量産力が弱い複合タイプ）
```yaml
タイトル: 方向と仕組み、両方を一緒に整えませんか

説明文: |
  設計力と量産力、両方が同時に弱い状態です。
  まずは「続けられる形」を作ることから始めましょう。

  方向性は動きながら見えてきます。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T1T3-MIX（設計力×改善力が弱い複合タイプ）
```yaml
タイトル: 方向と改善、両方を一緒に整えませんか

説明文: |
  設計力と改善力、両方が同時に弱い状態です。
  まずは方向性を決めて、成果を確認する習慣から始めましょう。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T1T4-MIX（設計力×継続力が弱い複合タイプ）
```yaml
タイトル: 方向と継続、両方を一緒に整えませんか

説明文: |
  設計力と継続力、両方が同時に弱い状態です。
  まずは方向性を決めて、続けられる仕組みから始めましょう。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T2T3-MIX（量産力×改善力が弱い複合タイプ）
```yaml
タイトル: 型と改善、両方を一緒に整えませんか

説明文: |
  量産力と改善力、両方が同時に弱い状態です。
  まずは型を作って、成果を確認する習慣から始めましょう。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T2T4-MIX（量産力×継続力が弱い複合タイプ）
```yaml
タイトル: 型と継続、両方を一緒に整えませんか

説明文: |
  量産力と継続力、両方が同時に弱い状態です。
  まずは型を作って、続けられる仕組みから始めましょう。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

##### T3T4-MIX（改善力×継続力が弱い複合タイプ）
```yaml
タイトル: 改善と継続、両方を一緒に整えませんか

説明文: |
  改善力と継続力、両方が同時に弱い状態です。
  まずは成果を確認する習慣と、続けられる仕組みから始めましょう。

ボタンテキスト: Threadsがラクになる方法を見てみる
```

---

## 4. データ設計概要

### 4.1 主要エンティティ

**MVP フェーズではデータベース不使用**

データはフロントエンド（sessionStorage）で一時保存のみ。
個人情報（メールアドレス）はUTAGE側で管理。

```yaml
DiagnosisSession (sessionStorage):
  概要: 診断セッションデータ（ページ遷移間のみ保持）
  主要属性:
    - answers: Answer[] (12問の回答)
    - computedScores: object (4軸スコア)
    - computedType: string (T1/T2/T3/T4)
    - timestamp: number (作成日時)
  保存場所: sessionStorage
  保持期間: ブラウザタブを閉じるまで
```

### 4.2 将来拡張（Phase 2以降）

履歴保存・再閲覧・比較機能が必要になった段階で、以下を追加：

```yaml
User:
  概要: 診断ユーザー
  主要属性:
    - id (UUID)
    - email (string, unique)
    - name (string, optional)
    - createdAt (datetime)
    - updatedAt (datetime)

DiagnosisResult:
  概要: 診断結果データ（永続化）
  主要属性:
    - id (UUID)
    - userId (UUID)
    - answers (JSON)
    - rawScores (JSON)
    - normalizedScores (JSON)
    - totalScore (integer)
    - diagnosisType (enum: T1/T2/T3/T4)
    - createdAt (datetime)
```

---

## 5. 制約事項

### 技術的制約

- **ブラウザ対応**: モダンブラウザのみ（Chrome、Firefox、Safari、Edge最新版）
- **レスポンシブ**: iPhone SE以上のサイズで動作保証
- **データ保存**: ブラウザ閉じるまで（sessionStorage）、永続保存なし
- **PDF生成**: MVP では実装しない（将来機能）

### 外部サービス制約

- **UTAGE**: タイプ別タグ付け機能が必要
- **Google Analytics 4**:
  - 無料プラン: イベント上限なし
  - データ保持期間14ヶ月（無料）

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

**個人情報管理**:
- ✅ アプリ側では個人情報を保存しない
- ✅ UTAGE側で個人情報を一元管理
- ✅ sessionStorageのデータはタブを閉じると自動削除

### 運用要件：可用性とヘルスチェック

**Vercelデプロイ**:
- 自動ヘルスチェック（Vercel標準機能）
- 99.9%以上の稼働率保証
- グローバルCDN配信

---

## 6. 複合API処理（バックエンド内部処理）

**MVP フェーズでは該当なし**

バックエンドを使用しないため、複合API処理は存在しません。
すべての処理はフロントエンドで完結します。

---

## 7. 技術スタック（MVP最適化版）

### フロントエンド（フルスタック）
- **フレームワーク**: React 18
- **言語**: TypeScript 5
- **UIライブラリ**: MUI v6
- **状態管理**: Zustand（診断状態・回答管理）
- **ルーティング**: React Router v6
- **ビルドツール**: Vite 5
- **チャート**: Recharts（レーダーチャート）

### 診断ロジック
- **実装場所**: フロント側で完結
- **採点**: ルールベース（4軸スコア計算）
- **タイプ判定**: if-thenロジック（最低軸特定）
- **データ保存**: sessionStorage（ページ遷移時のみ）

### 配信・登録
- **メール登録**: UTAGE登録フォームへ遷移
- **タイプ別URL**: UTMパラメータで識別（utm_content=T1-T4）
- **個人情報管理**: アプリ側では持たない（UTAGE側で管理）

### デプロイ・計測
- **ホスティング**: Vercel（静的サイト、無料枠）
- **計測**: Google Analytics 4（6イベント）
- **タグ管理**: Google Tag Manager

### 開発ツール
- **バージョン管理**: Git + GitHub
- **テスト**:
  - Vitest（ユニット）
  - React Testing Library（統合）
  - Playwright（E2E、オプション）
- **Lint/Format**:
  - ESLint（関数100行、ファイル700行、複雑度10制限）
  - Prettier（行長120文字）

### 削除した技術（MVPでは不要）

❌ **バックエンド**: FastAPI（不要）
❌ **データベース**: PostgreSQL/Neon（不要）
❌ **ORM**: SQLAlchemy（不要）
❌ **マイグレーション**: Alembic（不要）
❌ **バックエンドホスティング**: Cloud Run（不要）
❌ **メール配信**: Resend（UTAGE統合のため不要）

### 将来拡張（Phase 2以降）

以下が必要になった段階で追加：
- 履歴保存・再閲覧
- 診断結果比較
- 管理画面（診断データ分析）
- ABテスト
- メール自動配信（UTAGE外）

→ その時点で FastAPI + PostgreSQL を追加

---

## 8. 必要な外部サービス・アカウント

### 必須サービス

| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| **Vercel** | フロントエンドホスティング | https://vercel.com | 無料プラン、自動デプロイ |
| **Google Analytics 4** | アクセス解析・イベント計測 | https://analytics.google.com | 無料、6イベント計測 |
| **Google Tag Manager** | タグ管理 | https://tagmanager.google.com | 無料、GA4統合 |
| **UTAGE** | メール登録・特典配信 | （既存アカウント想定） | タイプ別タグ付け |

### オプションサービス（Phase 2以降）

| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| **Neon** | PostgreSQLホスティング | https://neon.tech | 履歴保存機能追加時 |
| **Resend** | メール配信 | https://resend.com | UTAGE外配信が必要な場合 |
| **Sentry** | エラー監視 | https://sentry.io | 本番運用の安定性向上時 |

---

## 9. Google Analytics（GA4）トラッキング設計（実装済み）

### 実装状況
- Google Tag Manager（GTM）による統合実装済み
- GTMスクリプト初期化完了（2026-02-02）
- 全イベントが本番環境で計測可能

### 主要イベント（7イベント）

| イベント名 | ページ | アクション | 計測内容 | 実装状況 |
|-----------|--------|-----------|---------|---------|
| `Diagnosis_Start` | P-001 | 診断開始 | 診断開始ボタンクリック | ✅ 実装済み |
| `Diagnosis_Complete` | P-001 | 診断完了 | 12問全回答完了 | ✅ 実装済み |
| `Result_View` | P-002 | 結果表示 | 結果ページ表示 + Type + Score | ✅ 実装済み |
| **`CTA_View`** | **P-002** | **CTA表示** | **商品提案CTA表示（インプレッション）** + Type + Score | ✅ 実装済み |
| `CTA_Click` | P-002 | CTAクリック | 商品提案CTAクリック + Type + Score | ✅ 実装済み |
| `Benefit_Register` | P-002 | 特典登録送信 | 特典登録ボタンクリック + Type + Score | ✅ 実装済み |
| `LP_Click` | P-002 | LP遷移 | LPリンククリック + Type + Score | ✅ 実装済み |

**`CTA_View`イベントの目的**:
- CTA表示数（インプレッション）を計測
- タイプ別のCTR（クリック率）を分析可能に
- 計算式: `CTR = CTA_Click / CTA_View × 100%`

### イベントパラメータ

全イベントに以下のパラメータを付与：

```javascript
{
  diagnosis_type:
    'BEGINNER' | 'T1' | 'T2' | 'T3' | 'T4' | 'BALANCED' |              // 基本タイプ（6種類）
    'T1T2-MIX' | 'T1T3-MIX' | 'T1T4-MIX' |                              // MIXタイプ（6種類）
    'T2T3-MIX' | 'T2T4-MIX' | 'T3T4-MIX',
  diagnosis_score: number,                                                // スコア（0-100）
  timestamp: string                                                       // イベント発生時刻
}
```

**タイプ種類**: 計12種類（基本6 + MIX6）

### UTMパラメータ設計

**UTAGE遷移・LP遷移時のURL構造**:

```
https://example.com/register?
  utm_source=diagnosis          # 固定：診断アプリから
  utm_medium=app                # 固定：アプリ経由
  utm_campaign=threads_manager  # 固定：商品名
  utm_content=BEGINNER          # 動的：タイプ別（12種類: BEGINNER/T1-T4/BALANCED/T1T2-MIX〜T3T4-MIX）
  utm_term=score_72             # 動的：スコア（0-100）
```

**タイプ値（utm_content）**: 計12種類
- 基本タイプ: BEGINNER, T1, T2, T3, T4, BALANCED
- MIXタイプ: T1T2-MIX, T1T3-MIX, T1T4-MIX, T2T3-MIX, T2T4-MIX, T3T4-MIX

### コンバージョンファネル

```
診断開始（100人）← Diagnosis_Start
  ↓ 完了率80%
診断完了（80人）← Diagnosis_Complete
  ↓
結果表示（80人）← Result_View
  ↓
CTA表示（80人）← CTA_View（インプレッション計測）
  ↓ CTR 25%（CTA_Click / CTA_View）
CTAクリック（20人）← CTA_Click
  ↓ 特典登録率50%
特典登録（10人）← Benefit_Register
  ↓ LP遷移率80%
LPクリック（8人）← LP_Click
  ↓ CVR 10%（UTAGE LPで計測）
購入（0.8人）
```

**タイプ別CTR分析（GA4で計測可能）**:
```
タイプ     | CTA表示 | CTAクリック | CTR
----------|--------|------------|------
BEGINNER  | 100    | 12         | 12%
T1        | 85     | 28         | 32.9%
T2        | 95     | 31         | 32.6%
T3        | 70     | 21         | 30%
T4        | 60     | 24         | 40%
BALANCED  | 50     | 19         | 38%
```

---

## 10. AI自動化プロンプト集

### プロンプト1: 診断ロジック（フロントエンド実装）

**目的**: 12問の回答から4軸スコアとタイプ判定を実行

**実装**: TypeScript関数

```typescript
function calculateDiagnosis(answers: Answer[]): DiagnosisResult {
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

  // 6. タイプ判定（同点時は優先順位: design > production > improvement > continuation）
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

**実装**: JSON駆動ルールエンジン + 優先度評価

**メッセージ生成フロー**:
1. 主メッセージ（タイプ別）を取得（必須1つ）
2. 刺さる指摘（if-thenルール）を優先度順に評価（最大2つ）
3. 表示順に結合（主メッセージ → 刺さる指摘1 → 刺さる指摘2）

---

**ルール定義（constants/MESSAGE_RULES.ts）**:
```typescript
export const MESSAGE_RULES = {
  version: '1.0.0',
  mainMessages: {
    T1: '誰に何を届けるかが定まっていない状態です。まずはターゲット設定から始めましょう。',
    T2: 'やる気はあるのに続ける仕組みがない状態です。型とストックで楽になりましょう。',
    T3: '頑張っているのに成果に変わらない状態です。改善ループを回して成果を出しましょう。',
    T4: '今は、頑張ればできるのに、「頑張らないと続かない形」になっています。仕組みを整えれば、迷わず・疲れず・自然に回る運用に変わります。',
  },
  rules: [
    // ⑤ その他（特殊・補助指摘）
    {
      id: 'score-zero',
      priority: 69,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'totalScore', operator: 'equals', value: 0 }
        ]
      },
      message: '現在のThreads運用には改善の余地が大きくあります。まずは基本的な投稿習慣の確立から始めましょう。',
      enabled: true
    },
    // ① 0点が含まれるもの（致命傷、最優先）
    {
      id: 'q6-zero',
      priority: 100,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q6', operator: 'equals', value: 0 }
        ]
      },
      message: '投稿作成に45分以上かかっているため、型とストックがなく消耗しています。',
      enabled: true
    },
    {
      id: 'q7-zero',
      priority: 95,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q7', operator: 'equals', value: 0 }
        ]
      },
      message: '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。',
      enabled: true
    },
    {
      id: 'q10-zero',
      priority: 95,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q10', operator: 'equals', value: 0 }
        ]
      },
      message: '投稿の流れが決まっていないため、毎回迷いが発生し、継続が不安定になります。',
      enabled: true
    },
    // ② 時間系（行動コスト直撃）
    {
      id: 'q6-high',
      priority: 85,
      severity: 'normal', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q6', operator: 'equals', value: 3 }
        ]
      },
      message: '投稿作成に30分以上かかっている場合、テンプレート化で時間を半減できます。',
      enabled: true
    },
    // ③ 改善停止系（数字見ない・仮説なし）
    {
      id: 'q8-zero',
      priority: 80,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q8', operator: 'equals', value: 0 }
        ]
      },
      message: '伸びる理由がわからないため、再現性がなく運頼みの状態です。',
      enabled: true
    },
    {
      id: 'q9-zero',
      priority: 75,
      severity: 'normal', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q9', operator: 'equals', value: 0 }
        ]
      },
      message: '成功を再現できていないため、成果が安定しません。',
      enabled: true
    },
    // ④ 継続・習慣化系（仕組みがない）
    {
      id: 'q11-zero',
      priority: 100,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q11', operator: 'equals', value: 0 }
        ]
      },
      message: '投稿の流れを支える仕組みがないため、毎回ゼロから考える運用になっています。まずは「同じ流れで回す形」を作りましょう。',
      enabled: true
    },
    {
      id: 'q12-zero',
      priority: 90,
      severity: 'hard', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'Q12', operator: 'equals', value: 0 }
        ]
      },
      message: '運用が「頑張り」になっており、長く続けるのが難しい状態です。',
      enabled: true
    },
    // ⑤ その他（特殊・補助指摘）
    {
      id: 'score-excellent',
      priority: 60,
      severity: 'soft', // 🆕
      conditions: {
        logic: 'AND',
        conditions: [
          { field: 'totalScore', operator: 'greaterThanOrEqual', value: 85 }
        ]
      },
      message: '素晴らしい！Threadsを効果的に活用できています。この調子で継続的な改善を続けましょう。',
      enabled: true
    }
  ]
};
```

---

**メッセージエンジン実装（logic/messageEngine.ts）**:
```typescript
import { MESSAGE_RULES } from '../constants/MESSAGE_RULES';
import { DiagnosisResult, Answer } from '../types';

export function generateCustomMessages(
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): string[] {
  // 🆕 1. 総合スコア帯を判定
  const overallBand =
    diagnosisResult.totalScore >= 80 ? 'HIGH'
    : diagnosisResult.totalScore >= 60 ? 'MID'
    : 'LOW';

  // 2. 主メッセージ（タイプ別、必ず1つ）
  const mainMessage = MESSAGE_RULES.mainMessages[diagnosisResult.diagnosisType];

  // 3. 刺さる指摘（優先度順に評価、最大2つ）
  const matchedRules = MESSAGE_RULES.rules
    .filter(rule => rule.enabled)
    .filter(rule => evaluateCondition(rule.conditions, diagnosisResult, answers))
    // 🆕 HIGH帯の場合、hard指摘を除外
    .filter(rule => {
      if (overallBand === 'HIGH' && rule.severity === 'hard') {
        return false;
      }
      return true;
    })
    // 🆕 動的優先度を計算
    .map(rule => ({
      ...rule,
      dynamicPriority: calculateDynamicPriority(rule, answers, diagnosisResult)
    }))
    .sort((a, b) => b.dynamicPriority - a.dynamicPriority)
    .slice(0, 2);

  // 4. 結合（主メッセージ + 刺さる指摘1-2）
  return [mainMessage, ...matchedRules.map(r => r.message)];
}

// 🆕 動的優先度計算
function calculateDynamicPriority(
  rule: MessageRule,
  answers: Answer[],
  diagnosisResult: DiagnosisResult
): number {
  // 該当質問の回答値と軸スコアから動的に優先度を調整
  const questionId = extractQuestionId(rule.conditions); // 例：Q6 → 6
  if (!questionId) return rule.priority;

  const answer = answers.find(a => a.questionId === questionId);
  if (!answer) return rule.priority;

  const axisName = getAxisForQuestion(questionId); // 例：Q6 → 'production'
  const axisScore = diagnosisResult.normalizedScores[axisName];

  const deficit = 8 - answer.value; // 0-8
  const axisDeficit = 100 - axisScore; // 0-100

  return rule.priority + (deficit * 3) + (axisDeficit * 0.1);
}

function evaluateCondition(
  conditions: Conditions,
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): boolean {
  // 条件評価ロジック
  // フィールド値を取得し、オペレーターで比較
  // AND/OR論理演算をサポート
  // ...
}
```

---

## 11. 暗黙知Few-shot例集

**形式知化の例**:

| 暗黙知（元） | 形式知化ルール | プロンプト実装 |
|------------|--------------|--------------|
| 「なんとなく続かない人」 | 投稿作成時間45分以上 + ネタストックなし | if (Q6==0 && Q4==0) → 「型とストックがないため消耗している」 |
| 「伸びない理由が分からない人」 | 数字を見ない + 仮説なし | if (Q7==0 && Q8==0) → 「改善ループが止まっている」 |
| 「頑張っても売れない人」 | 商品なし + 導線なし | if (Q10==0 && Q11==0) → 「出口がない」 |

---

## 12. 実装ロードマップ

### MVP（2ページ）: 10日間

| Phase | タスク | 工数 |
|-------|--------|------|
| 1 | 型定義 + 診断ロジック | 1日 |
| 2 | 診断フォームUI | 2日 |
| 3 | 結果表示UI + レーダーチャート | 2日 |
| 4 | カスタムメッセージエンジン | 1日 |
| 5 | UTAGE統合（URL生成） | 1日 |
| 6 | GA4/GTM統合 | 1日 |
| 7 | テスト・調整 | 2日 |

### Phase 2（機能拡張）: +10日

| タスク | 工数 |
|--------|------|
| バックエンド構築（FastAPI + PostgreSQL） | 3日 |
| 履歴保存・再閲覧機能 | 3日 |
| 管理画面（診断データ分析） | 2日 |
| メール自動配信（Resend統合） | 2日 |

---

## 13. 今後の拡張予定

**原則**: 拡張予定があっても、必要最小限の実装のみを行う

- 「あったらいいな」は実装しない
- 拡張可能性のための余分な要素は追加しない
- 将来の「もしかして」のための準備は禁止
- 今、ここで必要な最小限の要素のみを実装

拡張が必要になった時点で、Phase 11: 機能拡張オーケストレーターを使用して追加実装を行います。

### 拡張候補（Phase 2以降）

- 履歴保存・再閲覧機能
- 診断結果比較機能
- 管理画面（診断データ分析、ダッシュボード）
- ABテスト機能
- LINE連携
- PDF生成機能
- メール自動配信（UTAGE外）

---

## 14. 変更履歴

### 2026-02-02: 質問文のトーン統一と実装完了

**変更内容**:
- 質問文を「やさしく寄り添うトーン」に統一（実装済み）
- 共通選択肢に変更: 「はい、できます」「だいたいできます」「あまりできません」「できません」
- ページタイトルを「Threads運用診断」に変更
- ネイティブアラートをMUIダイアログに置き換え
- GA4計測機能の有効化（GTMスクリプト初期化）
- フッター追加（著作権表示）
- 診断結果ページでの改行表示改善

### 2026-01-31: MIX判定仕様確定（パターンB）

**確定仕様**:
- MIX判定閾値: `0 < scoreDiff && scoreDiff <= 5`（1〜5点差のみMIX判定）
- 完全同点（0点差）は優先順位で単一タイプに判定
- 実装箇所: `diagnosisLogic.ts` 144行目

### 2026-01-30: カスタムメッセージエンジン改善（運用データ基づく最適化）

**改善の背景**:
MVP運用開始後、「高得点なのに厳しい指摘が出る」というユーザー体験の矛盾が発覚。
総合80点以上のユーザーに対して「消耗しています」「存在していない」などのhard指摘が表示され、納得感を損なう問題があった。

**実装した改善（最小改修セット）**:

#### 1. HIGH帯ガード（総合スコア帯別フィルタリング）
- **目的**: 高得点者に厳しすぎる指摘を出さない
- **実装**:
  - 総合スコア帯を定義（HIGH: ≥80, MID: 60-79, LOW: <60）
  - メッセージにseverityフィールド追加（hard/normal/soft）
  - HIGH帯ではhard指摘を除外
- **効果**: 80点以上の人には「存在していない」などの致命的表現が出なくなる

#### 2. MIXタイプ判定（僅差検出）
- **目的**: 複数の軸が同時に弱い状態を正確に表現
- **実装**:
  - 最低軸と2番目に低い軸の差が5点以内ならMIXタイプ
  - 例：量産力30点、継続力33点 → T2T4-MIX
- **効果**: 単一軸タイプに無理やり分類せず、実態を正確に伝える

#### 3. 動的優先度（不足量ベース）
- **目的**: 同じ回答でも軸スコアによって優先度を調整
- **実装**:
  - `dynamicPriority = basePriority + (deficit * 3) + (axisDeficit * 0.1)`
  - deficit: 8 - questionValue（0-8点の不足量）
  - axisDeficit: 100 - axisScore（軸スコアの不足量）
- **効果**: 同じQ6=0でも、量産力30点の人と70点の人で優先度が変わる

**パラメータ設定**:
- 総合スコア帯閾値: HIGH ≥80, MID 60-79, LOW <60
- **MIX判定閾値（確定仕様 - パターンB）**: `0 < scoreDiff && scoreDiff <= 5`
  - **1〜5点差のみMIX判定**（完全同点0点差は優先順位で単一タイプ）
  - 実装: `diagnosisLogic.ts` 144行目
- 動的優先度係数: deficit * 3, axisDeficit * 0.1

#### 4. HIGH帯の主メッセージ文言（T1〜T4）

**目的**: 高得点者に対して「状態否定」ではなく「伸びしろ翻訳」を提供

**実装**:
- totalScore >= 80 の場合、T1〜T4の主メッセージをhighScoreMessageに切り替え
- MID/LOW帯は既存のdescriptionを使用

**文言方針**:
- 「〜がない」「〜が弱い」ではなく「すでに〜が整っている」
- 「あとは〜を足すだけ」という加算表現に統一

**実装箇所**:
- `frontend/src/constants/TYPES.ts`: TypeMetadataにhighScoreMessage追加
- `frontend/src/pages/ResultPage.tsx`: 259行目で文言切り替え

**効果**: HIGH帯ユーザーの納得感向上、モチベーション維持

**期待される効果**:
- 高得点者の納得感向上（矛盾解消）
- より正確な状態診断（MIXタイプ）
- 個別最適化されたメッセージ優先度（動的計算）
- **HIGH帯ユーザーの文言最適化（伸びしろ翻訳）**

---

**要件定義書作成日**: 2026-01-14
**プロジェクト開始予定日**: 2026-01-14
**MVP完成予定日**: 2026-01-24（10日後）
**最終更新日**: 2026-02-02（質問文トーン統一・実装完了版）
