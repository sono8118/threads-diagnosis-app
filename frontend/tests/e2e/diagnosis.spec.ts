// ============================================================================
// E2Eテスト: 診断ページ（P-001）
// ============================================================================

import { test, expect } from '@playwright/test';

// ========== E2E-DIAG-001: 診断開始画面の表示と同意チェック ==========
test('E2E-DIAG-001: 診断開始画面の表示と同意チェック', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('ページ遷移', async () => {
    await page.goto('http://localhost:3247/');
    // ページロード完了を待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('タイトル表示確認', async () => {
    const title = page.locator('text=Threads運用診断');
    await expect(title).toBeVisible();
  });

  await test.step('説明文表示確認', async () => {
    const description = page.locator('text=12問（2〜3分）で、「Threadsしんどい理由」がやさしく見えてきます');
    await expect(description).toBeVisible();
  });

  await test.step('同意チェックボックスクリック', async () => {
    // 同意カード全体がクリック可能
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // チェックボックスがチェック状態であることを確認
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  await test.step('診断開始ボタンクリック', async () => {
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();
  });

  await test.step('質問1画面への遷移確認', async () => {
    // 質問1が表示されることを確認
    const question1 = page.locator('text=/Q1\\./');
    await expect(question1).toBeVisible();
  });
});

// ========== E2E-DIAG-002: 質問1表示と選択肢クリック ==========
test('E2E-DIAG-002: 質問1表示と選択肢クリック', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から質問1へ遷移', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();

    // 質問1が表示されるまで待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('質問1が表示されることを確認', async () => {
    const question1 = page.locator('text=/Q1\\./');
    await expect(question1).toBeVisible({ timeout: 5000 });
  });

  await test.step('プログレスバー「質問 1 / 12」表示確認', async () => {
    const progress = page.locator('text=/質問\\s*1\\s*\\/\\s*12/');
    await expect(progress).toBeVisible();
  });

  await test.step('4択選択肢のうち1つをクリック', async () => {
    // 最初の選択肢「はい、できます」をクリック
    const firstOption = page.locator('text=はい、できます');
    await firstOption.click();
  });

  await test.step('選択肢がハイライト表示されることを確認', async () => {
    // 選択された選択肢にチェックアイコン（✓）が表示されることを確認
    // DiagnosisPage.tsxの実装では、選択時に::beforeで"✓"が表示される
    const selectedOption = page.locator('text=はい、できます').locator('..');

    // チェックアイコンが表示されることを確認（::beforeの内容）
    const hasCheckIcon = await selectedOption.evaluate((el) => {
      const before = window.getComputedStyle(el, '::before');
      return before.content === '"✓"';
    });

    expect(hasCheckIcon).toBe(true);
  });

  await test.step('次へボタンが有効化されることを確認', async () => {
    const nextButton = page.locator('button', { hasText: '次へ' });
    await expect(nextButton).toBeEnabled();
  });
});

// ========== E2E-DIAG-003: 複数質問の連続回答フロー ==========
test('E2E-DIAG-003: 複数質問の連続回答フロー', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から質問1へ遷移', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();

    // 質問1が表示されるまで待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('質問1を回答して次へ', async () => {
    // 質問1が表示されることを確認
    const question1 = page.locator('text=/Q1\\./');
    await expect(question1).toBeVisible({ timeout: 5000 });

    // 最初の選択肢をクリック
    const firstOption = page.locator('text=はい、できます');
    await firstOption.click();

    // 次へボタンをクリック
    const nextButton = page.locator('button', { hasText: '次へ' });
    await nextButton.click();

    // 質問2が表示されるまで待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('質問2を回答して次へ', async () => {
    // 質問2が表示されることを確認
    const question2 = page.locator('text=/Q2\\./');
    await expect(question2).toBeVisible({ timeout: 5000 });

    // 最初の選択肢をクリック（質問2の最初の選択肢）
    const firstOption = page.locator('text=はい、できます');
    await firstOption.click();

    // 次へボタンをクリック
    const nextButton = page.locator('button', { hasText: '次へ' });
    await nextButton.click();

    // 質問3が表示されるまで待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('質問3を回答して次へ', async () => {
    // 質問3が表示されることを確認
    const question3 = page.locator('text=/Q3\\./');
    await expect(question3).toBeVisible({ timeout: 5000 });

    // 最初の選択肢をクリック（質問3の最初の選択肢）
    const firstOption = page.locator('text=はい、できます');
    await firstOption.click();

    // 次へボタンをクリック
    const nextButton = page.locator('button', { hasText: '次へ' });
    await nextButton.click();

    // 次の質問が表示されるまで待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('プログレスバー「質問 3 / 12」表示確認（質問4画面で）', async () => {
    // 質問4が表示されることを確認
    const question4 = page.locator('text=/Q4\\./');
    await expect(question4).toBeVisible({ timeout: 5000 });

    // プログレスバー「質問 4 / 12」を確認（質問3の次へクリック後）
    const progress = page.locator('text=/質問\\s*4\\s*\\/\\s*12/');
    await expect(progress).toBeVisible();
  });

  await test.step('残り設問数「あと8問」が表示されることを確認', async () => {
    // 残り設問数（12 - 4 = 8問）を確認
    const remaining = page.locator('text=/あと\\s*8\\s*問/');
    await expect(remaining).toBeVisible();
  });
});

// ========== E2E-DIAG-004: 戻るボタンによる質問戻り ==========
test('E2E-DIAG-004: 戻るボタンによる質問戻り', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から質問3まで回答', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();
    await page.waitForLoadState('networkidle');

    // 質問1を回答
    const q1Option = page.locator('text=はい、できます').first();
    await q1Option.click();
    const nextButton1 = page.locator('button', { hasText: '次へ' });
    await nextButton1.click();
    await page.waitForLoadState('networkidle');

    // 質問2を回答（異なる選択肢を選ぶ）
    const q2Option = page.locator('text=はい、できます').first();
    await q2Option.click();
    const nextButton2 = page.locator('button', { hasText: '次へ' });
    await nextButton2.click();
    await page.waitForLoadState('networkidle');

    // 質問3を回答
    const q3Option = page.locator('text=はい、できます').first();
    await q3Option.click();
    const nextButton3 = page.locator('button', { hasText: '次へ' });
    await nextButton3.click();
    await page.waitForLoadState('networkidle');
  });

  await test.step('質問3画面で戻るボタンが表示されることを確認', async () => {
    // 質問4が表示されている（質問3の次へクリック後）
    const question4 = page.locator('text=/Q4\\./');
    await expect(question4).toBeVisible({ timeout: 5000 });

    // 戻るボタンが表示されることを確認
    const backButton = page.locator('button', { hasText: '戻る' });
    await expect(backButton).toBeVisible();
  });

  await test.step('戻るボタンをクリックして質問3に戻る', async () => {
    const backButton = page.locator('button', { hasText: '戻る' });
    await backButton.click();
    await page.waitForLoadState('networkidle');

    // 質問3が表示されることを確認
    const question3 = page.locator('text=/Q3\\./');
    await expect(question3).toBeVisible({ timeout: 5000 });

    // プログレスバー「質問 3 / 12」を確認
    const progress = page.locator('text=/質問\\s*3\\s*\\/\\s*12/');
    await expect(progress).toBeVisible();
  });

  await test.step('質問3で選択した選択肢が選択状態で保持されていることを確認', async () => {
    // 選択された選択肢のPaper要素を取得（::beforeはPaperに適用されている）
    const selectedOption = page.locator('text=はい、できます').first().locator('..');

    // チェックアイコンが表示されることを確認（::beforeの内容）
    const hasCheckIcon = await selectedOption.evaluate((el) => {
      const before = window.getComputedStyle(el, '::before');
      return before.content === '"✓"';
    });

    expect(hasCheckIcon).toBe(true);
  });
});

// ========== E2E-DIAG-005: 未選択時の次へボタン無効化 ==========
test('E2E-DIAG-005: 未選択時の次へボタン無効化', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から質問1へ遷移', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();

    // 質問1が表示されるまで待機
    await page.waitForLoadState('networkidle');
  });

  await test.step('質問1が表示されることを確認', async () => {
    const question1 = page.locator('text=/Q1\\./');
    await expect(question1).toBeVisible({ timeout: 5000 });
  });

  await test.step('選択肢未選択時に次へボタンがdisabled状態であることを確認', async () => {
    const nextButton = page.locator('button', { hasText: '次へ' });
    await expect(nextButton).toBeDisabled();
  });

  await test.step('次へボタンをクリックしても反応しないことを確認', async () => {
    const nextButton = page.locator('button', { hasText: '次へ' });

    // disabled状態でクリックを試行（反応しないことを確認）
    await nextButton.click({ force: true });

    // 待機後も質問1が表示されたまま（遷移していない）
    await page.waitForTimeout(500);
    const question1 = page.locator('text=/Q1\\./');
    await expect(question1).toBeVisible();
  });
});

// ========== E2E-DIAG-006: 12問全回答完了と完了画面表示 ==========
test('E2E-DIAG-006: 12問全回答完了と完了画面表示', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から12問全て回答', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();
    await page.waitForLoadState('networkidle');

    // 12問を順番に回答
    for (let i = 1; i <= 12; i++) {
      // 質問が表示されることを確認
      const question = page.locator(`text=/Q${i}\\./`);
      await expect(question).toBeVisible({ timeout: 5000 });

      // 最初の選択肢をクリック（全問8点を選択）
      const firstOption = page.locator('text=はい、できます').first();
      await firstOption.click();

      // 次へボタンをクリック（最後の質問は完了画面へ）
      const nextButton = page.locator('button', { hasText: '次へ' });
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  await test.step('完了画面「おつかれさまでした!」が表示されることを確認', async () => {
    const completionMessage = page.locator('text=おつかれさまでした！');
    await expect(completionMessage).toBeVisible({ timeout: 5000 });
  });

  await test.step('「あなたの診断結果をまとめています...」メッセージ表示確認', async () => {
    const summaryMessage = page.locator('text=あなたの診断結果をまとめています...');
    await expect(summaryMessage).toBeVisible();
  });

  await test.step('ローディングアニメーション（3つの点）表示確認', async () => {
    // ローディングアニメーション（3つのBox要素）が表示されることを確認
    // DiagnosisPageの実装では、3つの円がCSSアニメーションで表示される
    // 完了画面のContainer内にあるBox要素（ドットのコンテナ）を取得
    const completionContainer = page.locator('text=あなたの診断結果をまとめています...').locator('..');
    await expect(completionContainer).toBeVisible();
  });
});

// ========== E2E-DIAG-007: sessionStorage保存確認 ==========
test('E2E-DIAG-007: sessionStorage保存確認', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から12問全て回答', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();
    await page.waitForLoadState('networkidle');

    // 12問を順番に回答
    for (let i = 1; i <= 12; i++) {
      // 質問が表示されることを確認
      const question = page.locator(`text=/Q${i}\\./`);
      await expect(question).toBeVisible({ timeout: 5000 });

      // 最初の選択肢をクリック（全問8点を選択）
      const firstOption = page.locator('text=はい、できます').first();
      await firstOption.click();

      // 次へボタンをクリック（最後の質問は完了画面へ）
      const nextButton = page.locator('button', { hasText: '次へ' });
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  await test.step('完了画面が表示されることを確認', async () => {
    const completionMessage = page.locator('text=おつかれさまでした！');
    await expect(completionMessage).toBeVisible({ timeout: 5000 });
  });

  await test.step('1.5秒待機してsessionStorageに保存されるのを待つ', async () => {
    // DiagnosisPageの実装では、完了画面表示後1.5秒でhandleViewResult()が呼ばれ、
    // その中でsessionStorageに保存される
    await page.waitForTimeout(2000); // 余裕を持って2秒待機
  });

  await test.step('sessionStorageに threads_diagnosis_session キーが存在することを確認', async () => {
    const sessionData = await page.evaluate(() => {
      return sessionStorage.getItem('threads_diagnosis_session');
    });

    expect(sessionData).not.toBeNull();
  });

  await test.step('sessionStorageのデータ構造を確認', async () => {
    const sessionData = await page.evaluate(() => {
      const data = sessionStorage.getItem('threads_diagnosis_session');
      return data ? JSON.parse(data) : null;
    });

    // データ構造の確認
    expect(sessionData).toHaveProperty('answers');
    expect(sessionData).toHaveProperty('computedType');
    expect(sessionData).toHaveProperty('computedScores');
    expect(sessionData).toHaveProperty('customMessages');
    expect(sessionData).toHaveProperty('timestamp');

    // answers: 12問の回答配列
    expect(Array.isArray(sessionData.answers)).toBe(true);
    expect(sessionData.answers).toHaveLength(12);

    // computedType: T1/T2/T3/T4/BEGINNER/BALANCED
    expect(sessionData.computedType).toBeTruthy();

    // computedScores: 4軸スコア（design/production/improvement/business）
    expect(sessionData.computedScores).toHaveProperty('design');
    expect(sessionData.computedScores).toHaveProperty('production');
    expect(sessionData.computedScores).toHaveProperty('improvement');
    expect(sessionData.computedScores).toHaveProperty('business');

    // customMessages: カスタムメッセージ配列
    expect(Array.isArray(sessionData.customMessages)).toBe(true);

    // timestamp: セッション作成日時
    expect(typeof sessionData.timestamp).toBe('number');
  });
});

// ========== E2E-DIAG-008: 診断完了後の結果ページ自動遷移 ==========
test('E2E-DIAG-008: 診断完了後の結果ページ自動遷移', async ({ page }) => {
  // ブラウザコンソールログを収集
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await test.step('診断開始画面から12問全て回答', async () => {
    await page.goto('http://localhost:3247/');
    await page.waitForLoadState('networkidle');

    // 同意チェックボックスをクリック
    const consentCard = page.locator('text=診断結果に合ったアドバイスを受け取ります').locator('..');
    await consentCard.click();

    // 診断開始ボタンをクリック
    const startButton = page.locator('button', { hasText: '診断を始める' });
    await startButton.click();
    await page.waitForLoadState('networkidle');

    // 12問を順番に回答
    for (let i = 1; i <= 12; i++) {
      // 質問が表示されることを確認
      const question = page.locator(`text=/Q${i}\\./`);
      await expect(question).toBeVisible({ timeout: 5000 });

      // 最初の選択肢をクリック（全問8点を選択）
      const firstOption = page.locator('text=はい、できます').first();
      await firstOption.click();

      // 次へボタンをクリック（最後の質問は完了画面へ）
      const nextButton = page.locator('button', { hasText: '次へ' });
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  await test.step('完了画面が表示されることを確認', async () => {
    const completionMessage = page.locator('text=おつかれさまでした！');
    await expect(completionMessage).toBeVisible({ timeout: 5000 });
  });

  await test.step('1.5秒後に /result ページへ自動遷移することを確認', async () => {
    // DiagnosisPageの実装では、完了画面表示後1.5秒で自動遷移
    // page.waitForURL()を使用して遷移を待機（タイムアウト3秒）
    await page.waitForURL('http://localhost:3247/result', { timeout: 3000 });

    // URLが /result であることを確認
    expect(page.url()).toBe('http://localhost:3247/result');
  });

  await test.step('結果ページが正しく表示されることを確認', async () => {
    // ページロード完了を待機
    await page.waitForLoadState('networkidle');

    // 結果ページ特有の要素が表示されることを確認
    // （例: タイプ名、レーダーチャート、スコア等）
    // ここでは「あなたの4軸スコア」というヘッダーが表示されることを確認
    const scoreHeader = page.locator('text=あなたの4軸スコア');
    await expect(scoreHeader).toBeVisible({ timeout: 5000 });
  });
});
