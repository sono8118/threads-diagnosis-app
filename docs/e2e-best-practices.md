# E2Eテスト ベストプラクティス集

**プロジェクト**: Threads運用診断アプリ
**作成日時**: 2026-01-15
**目的**: 成功パターンを蓄積し、後続テストの試行錯誤を削減

このファイルは各テストで成功した方法を自動保存し、後続テストが前のテストの知見を自動活用するためのものです。

---

## 1. サーバー起動

### フロントエンドサーバー（Vite）
```bash
# ポート: 3247（CLAUDE.mdに記載）
cd "/Users/yamaneko02/Desktop/ブルーランプ/Threads運用診断/frontend"
npm run dev -- --port 3247
```

**重要**:
- E2Eテスト実行前に必ずサーバーを起動
- .env.localに `VITE_E2E_MODE=true` を設定してSentryを無効化
- サーバー起動後、http://localhost:3247 で正常にアクセスできることを確認

---

## 2. ページアクセス

### 診断ページ（/）
```typescript
await page.goto('/');
await page.waitForLoadState('networkidle');
```

### 結果ページ（/result）
```typescript
// sessionStorageに診断データが必要
await page.goto('/result');
await page.waitForLoadState('networkidle');
```

**重要**:
- 結果ページはsessionStorageにデータがないとリダイレクトされる
- テスト前に診断フローを完了してsessionStorageを準備する

---

## 3. 認証処理

このプロジェクトは認証不要（匿名診断）のため、認証処理は実装しません。

---

## 4. UI操作

### ボタンクリック
```typescript
await page.click('text=診断開始');
```

### フォーム入力（ラジオボタン選択）
```typescript
// 12問の質問で4択ラジオボタンを選択
await page.click('input[value="0"]'); // 0点選択
await page.click('input[value="3"]'); // 3点選択
await page.click('input[value="6"]'); // 6点選択
await page.click('input[value="8"]'); // 8点選択
```

### sessionStorage操作
```typescript
// 診断データを直接注入（テスト用）
await page.evaluate(() => {
  sessionStorage.setItem('threads_diagnosis_session', JSON.stringify({
    answers: [
      { questionId: 1, score: 0 },
      { questionId: 2, score: 0 },
      // ... 12問分
    ],
    computedScores: {
      design: 0,
      production: 20,
      improvement: 20,
      business: 20
    },
    computedType: 'T1',
    timestamp: Date.now()
  }));
});
```

---

## 5. アサーション

### テキスト確認
```typescript
await expect(page.locator('text=T1：迷子タイプ')).toBeVisible();
```

### レーダーチャート確認
```typescript
// Rechartsのレーダーチャートが描画されているか確認
await expect(page.locator('.recharts-radar')).toBeVisible();
```

### GA4イベント確認
```typescript
// dataLayerにイベントがpushされているか確認
const dataLayer = await page.evaluate(() => window.dataLayer);
expect(dataLayer).toContainEqual(
  expect.objectContaining({
    event: 'Diagnosis_Start'
  })
);
```

---

## 6. 成功パターン（自動蓄積）

このセクションは各テストの成功時に自動で追記されます。

---
