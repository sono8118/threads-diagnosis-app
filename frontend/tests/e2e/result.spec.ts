import { test, expect, Page } from '@playwright/test';

/**
 * 診断フローを完了してsessionStorageを準備するヘルパー関数
 * @param page Playwrightページ
 * @param answers 12問の回答配列（各値は0, 3, 6, 8のいずれか）
 */
async function completeDiagnosisFlow(page: Page, answers: number[]) {
  // 診断トップへ遷移
  await page.goto('http://localhost:3247/');
  await page.waitForLoadState('networkidle');

  // 同意チェックボックスをクリック
  const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
  await consentCard.click();

  // 診断開始ボタンをクリック
  const startButton = page.locator('button', { hasText: '診断を始める' });
  await startButton.click();

  // 選択肢の値とラベルのマッピング（COMMON_OPTIONS）
  const optionLabelMap: { [key: number]: string } = {
    8: 'はい、できます',
    6: 'だいたいできます',
    3: 'あまりできません',
    0: 'できません',
  };

  // 12問の質問に回答
  for (let i = 0; i < 12; i++) {
    await page.waitForLoadState('networkidle');

    // answers[i]の値に対応する選択肢のラベルを取得
    const optionLabel = optionLabelMap[answers[i]];

    // 選択肢のテキストで検索してクリック（完全一致）
    const option = page.getByText(optionLabel, { exact: true });
    await option.click();

    // 次へボタンをクリック（12問すべて「次へ」ボタン）
    const nextButton = page.locator('button', { hasText: '次へ' });
    await nextButton.click();
  }

  // 結果ページへの遷移を待機
  await page.waitForURL('http://localhost:3247/result', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

// E2E-RESULT-001: sessionStorageにデータがない場合のリダイレクト
test('E2E-RESULT-001: sessionStorageにデータがない場合のリダイレクト', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('sessionStorageをクリア', async () => {
    await page.goto('http://localhost:3247/');
    await page.evaluate(() => {
      sessionStorage.clear();
    });
  });

  await test.step('/result に直接アクセス', async () => {
    await page.goto('http://localhost:3247/result');
    await page.waitForLoadState('networkidle');
  });

  await test.step('診断トップ（/）へリダイレクトされることを確認', async () => {
    await page.waitForURL('http://localhost:3247/', { timeout: 5000 });
    expect(page.url()).toBe('http://localhost:3247/');
  });
});

// E2E-RESULT-002: 結果ページの表示確認（タイプ別6パターン）
test('E2E-RESULT-002: 結果ページの表示確認（タイプ別6パターン）', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  // 6タイプのテストデータを定義
  const testPatterns = [
    {
      type: 'BEGINNER',
      typeName: '🌱 はじまりタイプ',
      description: 'まだ何も決めていない「はじまりの状態」です',
      scoreText: '現在地：スタート地点',
      testData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 0 })),
        computedScores: { design: 0, production: 0, improvement: 0, business: 0 },
        computedType: 'BEGINNER',
        timestamp: Date.now(),
      },
    },
    {
      type: 'T1',
      typeName: '迷子タイプ',
      description: '方向性がまだ見えていない状態です',
      scoreText: '総合スコア：',
      testData: {
        answers: [
          { questionId: 1, value: 0 },
          { questionId: 2, value: 0 },
          { questionId: 3, value: 0 },
          { questionId: 4, value: 6 },
          { questionId: 5, value: 6 },
          { questionId: 6, value: 6 },
          { questionId: 7, value: 6 },
          { questionId: 8, value: 6 },
          { questionId: 9, value: 6 },
          { questionId: 10, value: 6 },
          { questionId: 11, value: 6 },
          { questionId: 12, value: 6 },
        ],
        computedScores: { design: 0, production: 75, improvement: 75, business: 75 },
        computedType: 'T1',
        timestamp: Date.now(),
      },
    },
    {
      type: 'T2',
      typeName: '整え途中タイプ',
      description: '頑張りたい気持ちはあるのに、続ける仕組みがまだ整っていない状態です',
      scoreText: '総合スコア：',
      testData: {
        answers: [
          { questionId: 1, value: 6 },
          { questionId: 2, value: 6 },
          { questionId: 3, value: 6 },
          { questionId: 4, value: 0 },
          { questionId: 5, value: 0 },
          { questionId: 6, value: 0 },
          { questionId: 7, value: 6 },
          { questionId: 8, value: 6 },
          { questionId: 9, value: 6 },
          { questionId: 10, value: 6 },
          { questionId: 11, value: 6 },
          { questionId: 12, value: 6 },
        ],
        computedScores: { design: 75, production: 0, improvement: 75, business: 75 },
        computedType: 'T2',
        timestamp: Date.now(),
      },
    },
    {
      type: 'T3',
      typeName: '伸ばせるタイプ',
      description: '伸びしろを感じつつ、まだ十分に活かせていない状態です',
      scoreText: '総合スコア：',
      testData: {
        answers: [
          { questionId: 1, value: 6 },
          { questionId: 2, value: 6 },
          { questionId: 3, value: 6 },
          { questionId: 4, value: 6 },
          { questionId: 5, value: 6 },
          { questionId: 6, value: 6 },
          { questionId: 7, value: 0 },
          { questionId: 8, value: 0 },
          { questionId: 9, value: 0 },
          { questionId: 10, value: 6 },
          { questionId: 11, value: 6 },
          { questionId: 12, value: 6 },
        ],
        computedScores: { design: 75, production: 75, improvement: 0, business: 75 },
        computedType: 'T3',
        timestamp: Date.now(),
      },
    },
    {
      type: 'T4',
      typeName: 'もったいないタイプ',
      description: 'もう少しで大きく前進できる状態です',
      scoreText: '総合スコア：',
      testData: {
        answers: [
          { questionId: 1, value: 6 },
          { questionId: 2, value: 6 },
          { questionId: 3, value: 6 },
          { questionId: 4, value: 6 },
          { questionId: 5, value: 6 },
          { questionId: 6, value: 6 },
          { questionId: 7, value: 6 },
          { questionId: 8, value: 6 },
          { questionId: 9, value: 6 },
          { questionId: 10, value: 0 },
          { questionId: 11, value: 0 },
          { questionId: 12, value: 0 },
        ],
        computedScores: { design: 75, production: 75, improvement: 75, business: 0 },
        computedType: 'T4',
        timestamp: Date.now(),
      },
    },
    {
      type: 'BALANCED',
      typeName: '🌿 安定成長タイプ',
      description: '今のあなたは、続けるための土台がとてもきれいに整っています',
      scoreText: '総合スコア：',
      testData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 8 })),
        computedScores: { design: 100, production: 100, improvement: 100, business: 100 },
        computedType: 'BALANCED',
        timestamp: Date.now(),
      },
    },
  ];

  // 各タイプパターンをテスト
  for (const pattern of testPatterns) {
    await test.step(`${pattern.type}: ${pattern.typeName}の表示確認`, async () => {
      // 回答配列を生成
      const answers = pattern.testData.answers.map((a: { questionId: number; value: number }) => a.value);

      // 診断フローを完了してsessionStorageを準備
      await completeDiagnosisFlow(page, answers);

      // タイプ名が表示されることを確認
      const typeName = page.locator(`text=${pattern.typeName}`);
      await expect(typeName).toBeVisible();

      // 状態説明が表示されることを確認（部分一致）
      const description = page.locator(`text=${pattern.description}`);
      await expect(description).toBeVisible();

      // スコアが表示されることを確認（部分一致）
      const scoreText = page.locator(`text=${pattern.scoreText}`);
      await expect(scoreText).toBeVisible();
    });
  }
});

// E2E-RESULT-003: レーダーチャート表示確認
test('E2E-RESULT-003: レーダーチャート表示確認', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断フローを完了', async () => {
    // T1タイプのテストデータ（設計力が最低）
    const answers = [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    await completeDiagnosisFlow(page, answers);
  });

  await test.step('レーダーチャートが表示されることを確認', async () => {
    // Rechartsのレーダーチャート（SVG要素）が存在することを確認
    const radarChart = page.locator('.recharts-radar');
    await expect(radarChart).toBeVisible();
  });

  await test.step('4軸のラベルが表示されることを確認', async () => {
    // 4軸のラベル確認（レーダーチャート内のラベルを確認）
    const radarChartArea = page.locator('.recharts-polar-angle-axis');
    await expect(radarChartArea.locator('text=設計力')).toBeVisible();
    await expect(radarChartArea.locator('text=量産力')).toBeVisible();
    await expect(radarChartArea.locator('text=改善力')).toBeVisible();
    await expect(radarChartArea.locator('text=事業力')).toBeVisible();
  });
});

// E2E-RESULT-004: カスタムメッセージ表示確認
test('E2E-RESULT-004: カスタムメッセージ表示確認', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断フローを完了', async () => {
    // T1タイプのテストデータ（設計力が最低）
    const answers = [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    await completeDiagnosisFlow(page, answers);
  });

  await test.step('「今のあなたの状態を、言葉にすると」セクションが表示されることを確認', async () => {
    const sectionTitle = page.locator('text=今のあなたの状態を、言葉にすると');
    await expect(sectionTitle).toBeVisible();
  });

  await test.step('カスタムメッセージが1-2個表示されることを確認', async () => {
    // カスタムメッセージブロックが存在することを確認
    // 実装: Box要素で borderLeft が設定されている
    // 「今のあなたの状態を、言葉にすると」セクション内のメッセージブロックを確認
    const messageSection = page.locator('text=今のあなたの状態を、言葉にすると').locator('..');
    const messageBlocks = messageSection.locator('div[class*="MuiBox-root"]').filter({
      has: page.locator('p'),
    });
    const count = await messageBlocks.count();

    // カスタムメッセージの存在を確認（少なくとも1つは表示される）
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(2);
  });
});

// E2E-RESULT-005: 次の一手表示確認
test('E2E-RESULT-005: 次の一手表示確認', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断フローを完了', async () => {
    // T1タイプのテストデータ（設計力が最低）
    const answers = [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    await completeDiagnosisFlow(page, answers);
  });

  await test.step('「これからの一歩」セクションが表示されることを確認', async () => {
    const sectionTitle = page.locator('text=これからの一歩');
    await expect(sectionTitle).toBeVisible();
  });

  await test.step('3つのステップが表示されることを確認', async () => {
    // 「まずできそうなこと」が表示される（🟢）
    await expect(page.locator('text=まずできそうなこと')).toBeVisible();

    // 「少し慣れたら」が表示される（🔵）
    await expect(page.locator('text=少し慣れたら')).toBeVisible();

    // 「余裕が出てきたら」が表示される（🟣）
    await expect(page.locator('text=余裕が出てきたら')).toBeVisible();
  });
});

// E2E-RESULT-006: 商品提案CTA表示・クリック
test('E2E-RESULT-006: 商品提案CTA表示・クリック', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断フローを完了', async () => {
    // T1タイプのテストデータ（設計力が最低）
    const answers = [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    await completeDiagnosisFlow(page, answers);
  });

  await test.step('商品提案CTAセクションが表示されることを確認', async () => {
    // T1タイプのCTAタイトル
    const ctaTitle = page.locator('text=決めきれなくても、大丈夫なやり方があります');
    await expect(ctaTitle).toBeVisible();
  });

  await test.step('CTAボタンが表示されることを確認', async () => {
    const ctaButton = page.locator('button', { hasText: 'Threadsがラクになる方法を見てみる' });
    await expect(ctaButton).toBeVisible();
  });

  await test.step('CTAボタンをクリックすると別タブが開くことを確認', async () => {
    // CTAボタンを取得
    const ctaButton = page.locator('button', { hasText: 'Threadsがラクになる方法を見てみる' });

    // 新しいページが開くのを監視（タイムアウト10秒）
    const popupPromise = page.waitForEvent('popup', { timeout: 10000 });

    // ボタンをクリック
    await ctaButton.click();

    // 新しいページを待機
    const newPage = await popupPromise;

    // 新しいページのURLにUTMパラメータが含まれることを確認
    const url = newPage.url();
    expect(url).toContain('utm_source=diagnosis');
    expect(url).toContain('utm_medium=app');
    expect(url).toContain('utm_campaign=threads_manager');
    expect(url).toContain('utm_content=T1');

    // 新しいページを閉じる
    await newPage.close();
  });
});

// E2E-RESULT-007: スクショ推奨案内表示確認
test('E2E-RESULT-007: スクショ推奨案内表示確認', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断フローを完了', async () => {
    // T1タイプのテストデータ（設計力が最低）
    const answers = [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    await completeDiagnosisFlow(page, answers);
  });

  await test.step('スクショ推奨案内が表示されることを確認', async () => {
    const screenshotNotice = page.locator('text=📸 診断結果はこのページだけで表示されます');
    await expect(screenshotNotice).toBeVisible();
  });
});

// 🆕 E2E-RESULT-008: MIXタイプの表示確認（6パターン）
test('E2E-RESULT-008: MIXタイプの表示確認（6パターン）', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  // 6つのMIXタイプのテストデータを定義
  // sessionStorageに直接注入するため、正確なスコアを設定
  const mixPatterns = [
    {
      type: 'T1T2-MIX',
      typeName: '設計力×量産力が弱い複合タイプ',
      description: '設計力と量産力が、今いちばん伸びしろが近い領域です',
      sessionData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 3 })),
        computedScores: { design: 38, production: 42, improvement: 92, continuation: 92 },
        computedType: 'T1T2-MIX',
        lowestAxis: 'design',
        customMessages: [],
        timestamp: Date.now(),
      },
    },
    {
      type: 'T1T3-MIX',
      typeName: '設計力×改善力が弱い複合タイプ',
      description: '設計力と改善力が、今いちばん伸びしろが近い領域です',
      sessionData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 3 })),
        computedScores: { design: 33, production: 92, improvement: 38, continuation: 92 },
        computedType: 'T1T3-MIX',
        lowestAxis: 'design',
        customMessages: [],
        timestamp: Date.now(),
      },
    },
    {
      type: 'T1T4-MIX',
      typeName: '設計力×継続力が弱い複合タイプ',
      description: '設計力と継続力が、今いちばん伸びしろが近い領域です',
      sessionData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 3 })),
        computedScores: { design: 29, production: 92, improvement: 92, continuation: 33 },
        computedType: 'T1T4-MIX',
        lowestAxis: 'design',
        customMessages: [],
        timestamp: Date.now(),
      },
    },
    {
      type: 'T2T3-MIX',
      typeName: '量産力×改善力が弱い複合タイプ',
      description: '量産力と改善力が、今いちばん伸びしろが近い領域です',
      sessionData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 3 })),
        computedScores: { design: 92, production: 42, improvement: 46, continuation: 92 },
        computedType: 'T2T3-MIX',
        lowestAxis: 'production',
        customMessages: [],
        timestamp: Date.now(),
      },
    },
    {
      type: 'T2T4-MIX',
      typeName: '量産力×継続力が弱い複合タイプ',
      description: '量産力と継続力が、今いちばん伸びしろが近い領域です',
      sessionData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 3 })),
        computedScores: { design: 92, production: 38, improvement: 92, continuation: 42 },
        computedType: 'T2T4-MIX',
        lowestAxis: 'production',
        customMessages: [],
        timestamp: Date.now(),
      },
    },
    {
      type: 'T3T4-MIX',
      typeName: '改善力×継続力が弱い複合タイプ',
      description: '改善力と継続力が、今いちばん伸びしろが近い領域です',
      sessionData: {
        answers: Array.from({ length: 12 }, (_, i) => ({ questionId: i + 1, value: 3 })),
        computedScores: { design: 92, production: 92, improvement: 50, continuation: 54 },
        computedType: 'T3T4-MIX',
        lowestAxis: 'improvement',
        customMessages: [],
        timestamp: Date.now(),
      },
    },
  ];

  // 各MIXタイプパターンをテスト
  for (const pattern of mixPatterns) {
    await test.step(`${pattern.type}: ${pattern.typeName}の表示確認`, async () => {
      // sessionStorageに直接データを注入
      await page.goto('http://localhost:3247/');
      await page.evaluate((data) => {
        sessionStorage.setItem('threads_diagnosis_session', JSON.stringify(data));
      }, pattern.sessionData);

      // 結果ページへ遷移
      await page.goto('http://localhost:3247/result');
      await page.waitForLoadState('networkidle');

      // タイプ名が表示されることを確認
      const typeName = page.locator(`text=${pattern.typeName}`);
      await expect(typeName).toBeVisible();

      // 説明文が表示されることを確認
      const description = page.locator(`text=${pattern.description}`);
      await expect(description).toBeVisible();

      // レーダーチャートが表示されることを確認
      const radarChart = page.locator('.recharts-surface');
      await expect(radarChart).toBeVisible();

      // CTA（商品提案）ボタンが表示されることを確認
      const ctaButton = page.locator('button:has-text("Threadsがラクになる方法を見てみる")');
      await expect(ctaButton).toBeVisible();
    });
  }
});
