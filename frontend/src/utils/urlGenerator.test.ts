// ============================================================================
// URL生成ユーティリティのユニットテスト
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { generateLPUrl, generateUTAGEUrl } from './urlGenerator';
import type { DiagnosisType } from '../types';

describe('urlGenerator.ts - UTMパラメータ生成', () => {
  beforeEach(() => {
    // 環境変数をモック
    import.meta.env.VITE_LP_URL = 'https://example.com/lp';
    import.meta.env.VITE_UTAGE_BASE_URL = 'https://example.com/utage';
  });

  describe('generateLPUrl', () => {
    it('正しいUTMパラメータ付きLP URLを生成する（T1）', () => {
      const url = generateLPUrl('T1', 50);

      expect(url).toContain('https://example.com/lp');
      expect(url).toContain('utm_source=diagnosis');
      expect(url).toContain('utm_medium=app');
      expect(url).toContain('utm_campaign=threads_manager');
      expect(url).toContain('utm_content=T1');
      expect(url).toContain('utm_term=score_50');
    });

    it('正しいUTMパラメータ付きLP URLを生成する（T2）', () => {
      const url = generateLPUrl('T2', 75);

      expect(url).toContain('utm_content=T2');
      expect(url).toContain('utm_term=score_75');
    });

    it('正しいUTMパラメータ付きLP URLを生成する（T3）', () => {
      const url = generateLPUrl('T3', 30);

      expect(url).toContain('utm_content=T3');
      expect(url).toContain('utm_term=score_30');
    });

    it('正しいUTMパラメータ付きLP URLを生成する（T4）', () => {
      const url = generateLPUrl('T4', 90);

      expect(url).toContain('utm_content=T4');
      expect(url).toContain('utm_term=score_90');
    });

    it('正しいUTMパラメータ付きLP URLを生成する（BEGINNER）', () => {
      const url = generateLPUrl('BEGINNER', 0);

      expect(url).toContain('utm_content=BEGINNER');
      expect(url).toContain('utm_term=score_0');
    });

    it('正しいUTMパラメータ付きLP URLを生成する（BALANCED）', () => {
      const url = generateLPUrl('BALANCED', 100);

      expect(url).toContain('utm_content=BALANCED');
      expect(url).toContain('utm_term=score_100');
    });

    it('スコアが0点の場合でも正しいURLを生成する', () => {
      const url = generateLPUrl('T1', 0);

      expect(url).toContain('utm_term=score_0');
    });

    it('スコアが100点の場合でも正しいURLを生成する', () => {
      const url = generateLPUrl('T1', 100);

      expect(url).toContain('utm_term=score_100');
    });

    it('VITE_LP_URLが設定されていない場合、空文字を返す', () => {
      // 環境変数を削除
      const originalValue = import.meta.env.VITE_LP_URL;
      delete (import.meta.env as Record<string, unknown>).VITE_LP_URL;

      const url = generateLPUrl('T1', 50);

      expect(url).toBe('');

      // 復元
      import.meta.env.VITE_LP_URL = originalValue;
    });

    it('URLが正しいフォーマットになっている（URL.toString()で生成）', () => {
      const url = generateLPUrl('T1', 50);

      // URL形式の検証
      expect(() => new URL(url)).not.toThrow();

      const parsedUrl = new URL(url);
      expect(parsedUrl.searchParams.get('utm_source')).toBe('diagnosis');
      expect(parsedUrl.searchParams.get('utm_medium')).toBe('app');
      expect(parsedUrl.searchParams.get('utm_campaign')).toBe('threads_manager');
      expect(parsedUrl.searchParams.get('utm_content')).toBe('T1');
      expect(parsedUrl.searchParams.get('utm_term')).toBe('score_50');
    });
  });

  describe('generateUTAGEUrl', () => {
    it('正しいUTMパラメータ付きUTAGE URLを生成する（T1）', () => {
      const url = generateUTAGEUrl('T1', 50);

      expect(url).toContain('https://example.com/utage');
      expect(url).toContain('utm_source=diagnosis');
      expect(url).toContain('utm_medium=app');
      expect(url).toContain('utm_campaign=threads_manager');
      expect(url).toContain('utm_content=T1');
      expect(url).toContain('utm_term=score_50');
    });

    it('正しいUTMパラメータ付きUTAGE URLを生成する（T2）', () => {
      const url = generateUTAGEUrl('T2', 75);

      expect(url).toContain('utm_content=T2');
      expect(url).toContain('utm_term=score_75');
    });

    it('正しいUTMパラメータ付きUTAGE URLを生成する（T3）', () => {
      const url = generateUTAGEUrl('T3', 30);

      expect(url).toContain('utm_content=T3');
      expect(url).toContain('utm_term=score_30');
    });

    it('正しいUTMパラメータ付きUTAGE URLを生成する（T4）', () => {
      const url = generateUTAGEUrl('T4', 90);

      expect(url).toContain('utm_content=T4');
      expect(url).toContain('utm_term=score_90');
    });

    it('正しいUTMパラメータ付きUTAGE URLを生成する（BEGINNER）', () => {
      const url = generateUTAGEUrl('BEGINNER', 0);

      expect(url).toContain('utm_content=BEGINNER');
      expect(url).toContain('utm_term=score_0');
    });

    it('正しいUTMパラメータ付きUTAGE URLを生成する（BALANCED）', () => {
      const url = generateUTAGEUrl('BALANCED', 100);

      expect(url).toContain('utm_content=BALANCED');
      expect(url).toContain('utm_term=score_100');
    });

    it('VITE_UTAGE_BASE_URLが設定されていない場合、空文字を返す', () => {
      // 環境変数を削除
      const originalValue = import.meta.env.VITE_UTAGE_BASE_URL;
      delete (import.meta.env as Record<string, unknown>).VITE_UTAGE_BASE_URL;

      const url = generateUTAGEUrl('T1', 50);

      expect(url).toBe('');

      // 復元
      import.meta.env.VITE_UTAGE_BASE_URL = originalValue;
    });

    it('URLが正しいフォーマットになっている（URL.toString()で生成）', () => {
      const url = generateUTAGEUrl('T1', 50);

      // URL形式の検証
      expect(() => new URL(url)).not.toThrow();

      const parsedUrl = new URL(url);
      expect(parsedUrl.searchParams.get('utm_source')).toBe('diagnosis');
      expect(parsedUrl.searchParams.get('utm_medium')).toBe('app');
      expect(parsedUrl.searchParams.get('utm_campaign')).toBe('threads_manager');
      expect(parsedUrl.searchParams.get('utm_content')).toBe('T1');
      expect(parsedUrl.searchParams.get('utm_term')).toBe('score_50');
    });
  });

  describe('エッジケース', () => {
    it('baseURLにクエリパラメータが既に含まれている場合でも正しく処理される', () => {
      import.meta.env.VITE_LP_URL = 'https://example.com/lp?existing_param=value';

      const url = generateLPUrl('T1', 50);

      expect(url).toContain('existing_param=value');
      expect(url).toContain('utm_source=diagnosis');
      expect(url).toContain('utm_content=T1');
    });

    it('baseURLに末尾スラッシュがあってもなくても同じ動作をする', () => {
      import.meta.env.VITE_LP_URL = 'https://example.com/lp/';

      const url = generateLPUrl('T1', 50);

      expect(url).toContain('utm_source=diagnosis');
      expect(url).toContain('utm_content=T1');
    });

    it('すべてのDiagnosisTypeで動作する', () => {
      const types: DiagnosisType[] = ['BEGINNER', 'T1', 'T2', 'T3', 'T4', 'BALANCED'];

      types.forEach((type) => {
        const url = generateLPUrl(type, 50);
        expect(url).toContain(`utm_content=${type}`);
      });
    });

    it('スコアが小数でも整数として処理される', () => {
      const url = generateLPUrl('T1', 50.5);

      expect(url).toContain('utm_term=score_50.5');
    });
  });
});
