# GA4計測検証ガイド

## 概要

このドキュメントでは、GA4計測が正常に機能しているか確認するための手順を説明します。

## 環境変数確認

```bash
# .env.local を確認
echo "VITE_GA4_MEASUREMENT_ID and VITE_GTM_ID:"
grep "VITE_GA4_MEASUREMENT_ID\|VITE_GTM_ID" .env.local
```

**期待される出力:**
```
VITE_GA4_MEASUREMENT_ID=G-QCY3LS1JDY
VITE_GTM_ID=GTM-NWHK3T3B
```

## ローカル開発環境での確認手順

### 1. アプリケーション起動

```bash
cd frontend
npm run dev
```

ブラウザで http://localhost:3247 を開く

### 2. ブラウザ開発者ツール（Chrome DevTools）での確認

#### Step 1: コンソールで dataLayer を確認

```javascript
// ブラウザコンソールで実行
window.dataLayer
```

**期待される出力:**
```javascript
[
  { 'gtm.start': 1705406400000, event: 'gtm.js' }
]
```

GTM初期化イベントが存在することを確認

#### Step 2: 診断を開始してイベント送信を確認

1. アプリケーションで「診断を始める」ボタンをクリック
2. コンソールで再度確認：

```javascript
window.dataLayer
```

**期待される追加イベント:**
```javascript
{
  event: 'Diagnosis_Start',
  diagnosis_type: 'T1',
  diagnosis_score: 0,
  timestamp: '2026-01-16T13:58:00.000Z'
}
```

#### Step 3: Network タブでのGTMスクリプト確認

1. DevTools の「Network」タブを開く
2. 「Name」フィルターで「gtm.js」を検索
3. 以下が表示されることを確認：

| 項目 | 期待値 |
|------|--------|
| URL | https://www.googletagmanager.com/gtm.js?id=GTM-NWHK3T3B |
| Status | 200 |
| Type | script |

### 3. 全イベントテスト

以下の操作で各イベントが送信されることを確認：

#### Event 1: Diagnosis_Start
```
操作: 「診断を始める」ボタンをクリック
確認: console で window.dataLayer の最新要素を確認
期待: { event: 'Diagnosis_Start', diagnosis_type: '...', diagnosis_score: 0, timestamp: '...' }
```

#### Event 2: Diagnosis_Complete
```
操作: 全12問に回答して「診断結果を見る」ボタンをクリック
確認: console で window.dataLayer の最新要素を確認
期待: { event: 'Diagnosis_Complete', diagnosis_type: 'T1-T4', diagnosis_score: 0-100, timestamp: '...' }
```

#### Event 3: Result_View
```
操作: 結果ページが表示される
確認: console で window.dataLayer の最新要素を確認
期待: { event: 'Result_View', diagnosis_type: 'T1-T4', diagnosis_score: 0-100, timestamp: '...' }
```

#### Event 4: CTA_View
```
操作: 結果ページが表示される（Result_Viewの直後）
確認: console で window.dataLayer の最新要素を確認
期待: { event: 'CTA_View', diagnosis_type: 'T1-T4', diagnosis_score: 0-100, timestamp: '...' }
```

#### Event 5: CTA_Click
```
操作: 「商品提案を見る」ボタンをクリック
確認: console で window.dataLayer の最新要素を確認
期待: { event: 'CTA_Click', diagnosis_type: 'T1-T4', diagnosis_score: 0-100, timestamp: '...' }
```

## GA4ダッシュボード確認手順

### 本番環境デプロイ後（48時間以内）

1. Google Analytics 4 にアクセス
   - URL: https://analytics.google.com/

2. プロパティ「Threads診断アプリ」を選択

3. 左メニューから「リアルタイム」を選択

4. アプリケーションで診断を実行

5. 「リアルタイム」画面に以下が表示されることを確認：
   - 新しいセッション
   - Diagnosis_Start イベント
   - その他のイベント

### 24時間後以上の確認

1. 左メニューから「イベント」を選択

2. 以下のイベント一覧が表示されることを確認：
   - Diagnosis_Start (イベント数)
   - Diagnosis_Complete (イベント数)
   - Result_View (イベント数)
   - CTA_View (イベント数)
   - CTA_Click (イベント数)

### トラブルシューティング

#### GA4でイベントが表示されない場合

**確認事項:**

1. **GTM コンテナが正しく設定されているか確認**
   - Google Tag Manager にアクセス: https://tagmanager.google.com/
   - コンテナ「GTM-NWHK3T3B」を開く
   - タグ設定を確認：GA4 の配信タグが存在するか
   - トリガー設定を確認：All Pages または適切なカスタムイベント

2. **GTMがGA4に正しく接続されているか確認**
   - GTM > タグ > GA4タグの設定
   - 測定ID が「G-QCY3LS1JDY」で設定されているか確認

3. **ブラウザで GTM プレビューモード を有効化**
   ```
   GTM UI > 「プレビュー」をクリック
   アプリケーションを開き、イベントが dataLayer に送信されているか確認
   ```

4. **環境変数が正しく設定されているか確認**
   ```bash
   # ブラウザコンソールで実行
   import.meta.env.VITE_GTM_ID
   ```

   **期待される出力:** `GTM-NWHK3T3B`

5. **dataLayer の型定義がリセットされていないか確認**
   ```javascript
   // ブラウザコンソールで実行
   typeof window.dataLayer
   ```

   **期待される出力:** `object`（配列）

#### GTMスクリプトが読み込まれない場合

**確認事項:**

1. **コンソールでエラーメッセージを確認**
   - DevTools > Console タブ
   - エラーメッセージが表示されているか

2. **ネットワークリクエストを確認**
   - DevTools > Network タブ
   - GTM スクリプト URL がリクエストされているか
   - CSP（Content Security Policy）に違反していないか

3. **環境変数の値を確認**
   ```bash
   grep VITE_GTM_ID .env.local
   ```

## インテグレーションテストコード例

```typescript
// src/hooks/useGA4.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGA4 } from './useGA4';

describe('useGA4', () => {
  beforeEach(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.length = 0;
  });

  test('sendEvent がデータレイヤーにイベントを送信する', () => {
    const { result } = renderHook(() => useGA4());

    act(() => {
      result.current.sendEvent('Diagnosis_Start', {
        diagnosis_type: 'T1',
        diagnosis_score: 0,
        timestamp: new Date().toISOString(),
      });
    });

    expect(window.dataLayer.length).toBeGreaterThan(0);
    const lastEvent = window.dataLayer[window.dataLayer.length - 1];
    expect(lastEvent.event).toBe('Diagnosis_Start');
    expect(lastEvent.diagnosis_type).toBe('T1');
  });
});
```

## まとめ

GA4計測が機能しているかの確認フロー：

```
1. ローカルで起動 → 2. dataLayer をコンソール確認 → 3. イベント送信確認
                    ↓
          4. GTMスクリプト読み込み確認 → 5. Network タブ確認
                    ↓
          6. デプロイ → 7. GA4ダッシュボード確認（48時間後）
```

---

**最終確認日**: 2026-01-16
**ステータス**: ✅ GTM スクリプト実装完了 - 検証待機中
