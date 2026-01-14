# 診断結果ページ API仕様書

**生成日**: 2026-01-14
**収集元**: `frontend/src/pages/ResultPage.tsx`
**@MOCK_TO_APIマーク数**: 2

---

## ⚠️ 重要: MVPフェーズではバックエンドAPI不要

本プロジェクトは**究極のMVP（2ページ）**として設計されており、バックエンドAPIを使用しません。

- **診断ロジック**: フロントエンド完結（JavaScript/TypeScript）
- **データ保存**: sessionStorage（一時保存のみ）
- **外部連携**: 直接遷移（UTAGE登録フォーム、商品LP）

したがって、以下の@MOCK_TO_APIマークは**バックエンドAPI実装が不要**です。

---

## 外部サービス連携一覧

### 1. LP遷移（商品ページ）

**@MOCK_TO_APIマーク**: `LP遷移（UTMパラメータ付き）`

**処理内容**:
- 商品LP（外部URL）への遷移
- UTMパラメータを自動付与

**実装方法**:
```typescript
// フロントエンドで完結
const handleCTAClick = () => {
  const lpUrl = generateLPUrl(diagnosisType, totalScore);
  window.open(lpUrl, '_blank');

  // GA4イベント送信
  sendGA4Event('CTA_Click', {
    diagnosis_type: diagnosisType,
    diagnosis_score: totalScore,
  });
};
```

**UTMパラメータ**:
```
utm_source=diagnosis
utm_medium=app
utm_campaign=threads_manager
utm_content={diagnosisType}  // T1/T2/T3/T4
utm_term=score_{totalScore}  // 0-100
```

**バックエンドAPI**: 不要（直接遷移）

---

### 2. UTAGE登録フォーム遷移（特典受け取り）

**@MOCK_TO_APIマーク**: `UTAGE登録フォーム遷移（UTMパラメータ付き）`

**処理内容**:
- UTAGE登録フォーム（外部URL）への遷移
- UTMパラメータを自動付与
- タイプ別タグ付け（UTAGE側で管理）

**実装方法**:
```typescript
// フロントエンドで完結
const handleBenefitClick = () => {
  const utageUrl = generateUTAGEUrl(diagnosisType, totalScore);
  window.open(utageUrl, '_blank');

  // GA4イベント送信
  sendGA4Event('Benefit_Register', {
    diagnosis_type: diagnosisType,
    diagnosis_score: totalScore,
  });
};
```

**UTMパラメータ**:
```
utm_source=diagnosis
utm_medium=app
utm_campaign=threads_manager
utm_content={diagnosisType}  // T1/T2/T3/T4
utm_term=score_{totalScore}  // 0-100
```

**バックエンドAPI**: 不要（直接遷移）

**特典内容**:
- タイトル: 「Threads運用 7日間リセット設計シート」
- 形式: PDF + Googleスプレッドシート
- 配信: UTAGE側で自動配信

---

## GA4イベント計測

診断結果ページで計測するイベント（全てフロントエンドで完結）:

| イベント名 | タイミング | パラメータ |
|-----------|----------|-----------|
| `Result_View` | 結果ページ表示時 | `diagnosis_type`, `diagnosis_score`, `timestamp` |
| `CTA_Click` | 商品提案CTAクリック時 | `diagnosis_type`, `diagnosis_score`, `timestamp` |
| `Benefit_Register` | 特典登録ボタンクリック時 | `diagnosis_type`, `diagnosis_score`, `timestamp` |
| `LP_Click` | LPリンククリック時 | `diagnosis_type`, `diagnosis_score`, `timestamp` |

---

## 将来拡張（Phase 2以降）

以下の機能を追加する場合は、バックエンドAPIが必要になります：

### 必要になるAPI

1. **診断結果の永続化**
   - `POST /api/diagnosis/results` - 診断結果を保存
   - `GET /api/diagnosis/results/:id` - 過去の診断結果を取得
   - `GET /api/diagnosis/results` - 診断履歴一覧取得

2. **診断結果の比較機能**
   - `GET /api/diagnosis/compare?ids={id1},{id2}` - 複数の診断結果を比較

3. **管理画面用API**
   - `GET /api/admin/diagnosis/stats` - 診断データの統計情報取得
   - `GET /api/admin/diagnosis/export` - 診断データのCSVエクスポート

4. **メール自動配信（UTAGE外）**
   - `POST /api/email/send-result` - 診断結果をメール送信

### データベーススキーマ（Phase 2以降）

```sql
-- 診断結果テーブル
CREATE TABLE diagnosis_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  answers JSONB NOT NULL,
  computed_scores JSONB NOT NULL,
  computed_type VARCHAR(10) NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## まとめ

**MVPフェーズ（現在）**:
- ✅ バックエンドAPI不要
- ✅ フロントエンドで完結
- ✅ 外部サービス（UTAGE、LP）への直接遷移
- ✅ sessionStorageで一時保存

**Phase 2以降（拡張時）**:
- ❌ バックエンドAPI必要
- ❌ データベース永続化
- ❌ 診断履歴・比較機能
- ❌ 管理画面

現時点では、@MOCK_TO_APIマークに対応するバックエンドAPIの実装は不要です。
