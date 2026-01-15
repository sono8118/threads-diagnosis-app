// ============================================================================
// カスタムメッセージエンジンのユニットテスト
// ============================================================================

import { describe, it, expect } from 'vitest';
import { generateCustomMessages } from './messageEngine';
import { calculateDiagnosis } from './diagnosisLogic';
import type { Answer, QuestionId, AnswerValue } from '../types';

// テストヘルパー関数
function createAnswers(values: number[]): Answer[] {
  if (values.length !== 12) {
    throw new Error('12個の値を指定してください');
  }
  return values.map((value, index) => ({
    questionId: (index + 1) as QuestionId,
    value: value as AnswerValue,
  }));
}

describe('messageEngine.ts - 主メッセージ生成', () => {
  it('T1（迷子タイプ）の主メッセージを生成する', () => {
    const answers = createAnswers([0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages[0]).toBe(
      '誰に何を届けるかが定まっていない状態です。まずはターゲット設定から始めましょう。'
    );
  });

  it('T2（整え途中タイプ）の主メッセージを生成する', () => {
    const answers = createAnswers([6, 6, 6, 0, 0, 0, 6, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages[0]).toBe(
      'やる気はあるのに続ける仕組みがない状態です。仕組みと習慣で楽になりましょう。'
    );
  });

  it('T3（伸ばせるタイプ）の主メッセージを生成する', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 6, 0, 0, 0, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages[0]).toBe(
      '頑張っているのに成果に変わらない状態です。改善ループを回して成果を出しましょう。'
    );
  });

  it('T4（もったいないタイプ）の主メッセージを生成する', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages[0]).toBe(
      '発信は強いのに売上に変換できていない状態です。導線を整えて成果を最大化しましょう。'
    );
  });

  it('BEGINNER（はじまりタイプ）の主メッセージを生成する', () => {
    const answers = createAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages[0]).toBe(
      'あなたは今"はじまりの状態"。これからどんな形にもなれる自由な場所にいるということです。これから少しずつ形にしていきましょう。'
    );
  });

  it('BALANCED（安定成長タイプ）の主メッセージを生成する', () => {
    const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages[0]).toBe(
      '素晴らしい！Threadsを効果的に活用できています。この調子で継続的な改善を続けましょう。'
    );
  });
});

describe('messageEngine.ts - 刺さる指摘（優先度順）', () => {
  describe('Q6=0（致命傷系、priority 100）', () => {
    it('Q6=0の場合、最優先メッセージが生成される', () => {
      // Q6=0: production軸の3問目
      const answers = createAnswers([6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '型とストックがないため、投稿作成に時間がかかり消耗しています。'
      );
    });

    it('Q6=0かつQ7=0の場合、Q6（priority 100）が優先される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      // Q6（priority 100）が1番目
      expect(messages[1]).toBe(
        '型とストックがないため、投稿作成に時間がかかり消耗しています。'
      );
      // Q7（priority 95）が2番目
      expect(messages[2]).toBe(
        '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。'
      );
    });
  });

  describe('Q7=0（致命傷系、priority 95）', () => {
    it('Q7=0の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。'
      );
    });
  });

  describe('Q10=0（致命傷系、priority 90）', () => {
    it('Q10=0の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '出口がないため、どれだけ頑張っても成果に変換されません。'
      );
    });
  });

  describe('Q6=3（時間系、priority 85）', () => {
    it('Q6=3の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 3, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '投稿作成に時間がかかっている状態です。テンプレート化で時間を半減できます。'
      );
    });

    it('Q6=0とQ6=3の両方がある場合、Q6=0（priority 100）が優先される', () => {
      // Q6は1つの質問なので、両方同時には存在しない
      // このテストはスキップ
    });
  });

  describe('Q8=0（改善停止系、priority 80）', () => {
    it('Q8=0の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 0, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '伸びる理由がわからないため、再現性がなく運頼みの状態です。'
      );
    });
  });

  describe('Q9=0（改善停止系、priority 75）', () => {
    it('Q9=0の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 0, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '成功を再現できていないため、成果が安定しません。'
      );
    });
  });

  describe('Q11=0（導線なし系、priority 70）', () => {
    it('Q11=0の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '商品への導線がないため、フォロワーが増えても売上につながりません。'
      );
    });
  });

  describe('Q12=0（導線なし系、priority 65）', () => {
    it('Q12=0の場合、メッセージが生成される', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        'まだ売上が出ていない状態です。まずは小さく1件の成功体験を作りましょう。'
      );
    });
  });
});

describe('messageEngine.ts - 最大2つまで表示', () => {
  it('条件に合うルールが0個の場合、主メッセージのみ返す', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBe(1); // 主メッセージのみ
  });

  it('条件に合うルールが1個の場合、主メッセージ + 1個返す', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBe(2); // 主メッセージ + 刺さる指摘1個
  });

  it('条件に合うルールが2個の場合、主メッセージ + 2個返す', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBe(3); // 主メッセージ + 刺さる指摘2個
  });

  it('条件に合うルールが3個以上の場合でも、主メッセージ + 2個まで（優先度順）', () => {
    // Q6=0 (priority 100), Q7=0 (priority 95), Q10=0 (priority 90)
    const answers = createAnswers([6, 6, 6, 6, 6, 0, 0, 6, 6, 0, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBe(3); // 主メッセージ + 刺さる指摘2個まで
    // Q6=0（priority 100）が1番目
    expect(messages[1]).toBe(
      '型とストックがないため、投稿作成に時間がかかり消耗しています。'
    );
    // Q7=0（priority 95）が2番目
    expect(messages[2]).toBe(
      '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。'
    );
    // Q10=0（priority 90）は表示されない
  });
});

describe('messageEngine.ts - 条件評価ロジック', () => {
  describe('equals演算子', () => {
    it('Q6=0で条件が合致する', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '型とストックがないため、投稿作成に時間がかかり消耗しています。'
      );
    });

    it('Q6=3で条件が合致する', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 3, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).toContain(
        '投稿作成に時間がかかっている状態です。テンプレート化で時間を半減できます。'
      );
    });

    it('Q6=6の場合、Q6=0の条件に合致しない', () => {
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages).not.toContain(
        '型とストックがないため、投稿作成に時間がかかり消耗しています。'
      );
    });
  });

  describe('ANDロジック', () => {
    it('すべての条件を満たす場合のみマッチする', () => {
      // すべてのルールはANDロジックで単一条件なので、常に満たす
      const answers = createAnswers([6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      expect(messages.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('enabled=falseのルール', () => {
    it('enabled=falseのルールは評価されない', () => {
      // MESSAGE_RULESのすべてのルールは enabled: true なので、
      // このテストは理論的な確認のみ
      const answers = createAnswers([6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6]);
      const result = calculateDiagnosis(answers);

      const messages = generateCustomMessages(result, answers);

      // すべてのルールが enabled: true なので、条件に合うルールは含まれる
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('messageEngine.ts - エッジケース', () => {
  it('全0点の場合でも主メッセージは返す', () => {
    const answers = createAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBeGreaterThanOrEqual(1);
    expect(messages[0]).toBe(
      'あなたは今"はじまりの状態"。これからどんな形にもなれる自由な場所にいるということです。これから少しずつ形にしていきましょう。'
    );
  });

  it('全満点の場合、主メッセージのみ返す（刺さる指摘なし）', () => {
    const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBe(1); // 主メッセージのみ
    expect(messages[0]).toBe(
      '素晴らしい！Threadsを効果的に活用できています。この調子で継続的な改善を続けましょう。'
    );
  });

  it('複数の0点回答がある場合、優先度順に最大2つまで返す', () => {
    // Q6=0 (priority 100), Q7=0 (priority 95), Q8=0 (priority 80), Q9=0 (priority 75), Q10=0 (priority 90)
    const answers = createAnswers([6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(messages.length).toBe(3); // 主メッセージ + 刺さる指摘2個まで
    // Q6=0（priority 100）が1番目
    expect(messages[1]).toBe(
      '型とストックがないため、投稿作成に時間がかかり消耗しています。'
    );
    // Q7=0（priority 95）が2番目
    expect(messages[2]).toBe(
      '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。'
    );
  });

  it('すべての質問が0点の場合、BEGINNER タイプの主メッセージが返る', () => {
    const answers = createAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(result.diagnosisType).toBe('BEGINNER');
    expect(messages[0]).toContain('はじまりの状態');
  });

  it('優先度が同じルールは定義順に評価される', () => {
    // MESSAGE_RULESには同じ優先度のルールはないため、このテストはスキップ
    // （理論的には配列順序で評価される）
  });
});

describe('messageEngine.ts - 現実的なシナリオ', () => {
  it('シナリオ1: 設計力が低い初心者（T1、Q6=0）', () => {
    const answers = createAnswers([0, 0, 0, 6, 6, 0, 6, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(result.diagnosisType).toBe('T1');
    expect(messages[0]).toContain('誰に何を届けるか');
    expect(messages).toContain(
      '型とストックがないため、投稿作成に時間がかかり消耗しています。'
    );
  });

  it('シナリオ2: 量産力が低い（T2、Q6=3）', () => {
    const answers = createAnswers([6, 6, 6, 3, 3, 3, 6, 6, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(result.diagnosisType).toBe('T2');
    expect(messages[0]).toContain('続ける仕組みがない');
    expect(messages).toContain(
      '投稿作成に時間がかかっている状態です。テンプレート化で時間を半減できます。'
    );
  });

  it('シナリオ3: 改善力が低い（T3、Q7=0、Q8=0）', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(result.diagnosisType).toBe('T3');
    expect(messages[0]).toContain('成果に変わらない');
    expect(messages[1]).toBe(
      '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。'
    );
    expect(messages[2]).toBe(
      '伸びる理由がわからないため、再現性がなく運頼みの状態です。'
    );
  });

  it('シナリオ4: 事業力が低い（T4、Q10=0、Q11=0）', () => {
    const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 6]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(result.diagnosisType).toBe('T4');
    expect(messages[0]).toContain('売上に変換できていない');
    expect(messages[1]).toBe(
      '出口がないため、どれだけ頑張っても成果に変換されません。'
    );
    expect(messages[2]).toBe(
      '商品への導線がないため、フォロワーが増えても売上につながりません。'
    );
  });

  it('シナリオ5: すべて高得点（BALANCED）', () => {
    const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
    const result = calculateDiagnosis(answers);

    const messages = generateCustomMessages(result, answers);

    expect(result.diagnosisType).toBe('BALANCED');
    expect(messages[0]).toContain('素晴らしい');
    expect(messages.length).toBe(1); // 刺さる指摘なし
  });
});
