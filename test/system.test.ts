import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('電卓アプリのシステムテスト（試験書網羅版・修正版）', () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();

    document.body.innerHTML = `
      <div id="result">0</div>
      <div id="history"></div>
      <!-- 数字ボタン -->
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-num="${n}">${n}</button>`).join('')}
      <!-- 演算子ボタン -->
      <button data-op="+">+</button>
      <button data-op="-">-</button>
      <button data-op="×">×</button>
      <button data-op="÷">÷</button>
      <button data-dot=".">.</button>
      <button data-equal="=">=</button>
      <button data-clear="C">C</button>
      <button data-backspace="BS">BS</button>
      <button data-sqrt="√">√</button>
      <button data-percent="%">%</button>
      <!-- 履歴パネル -->
      <div id="history-panel">
        <div id="history-list"></div>
        <button id="close-history">×</button>
      </div>
      <button id="toggle-history">履歴</button>
    `;

    await import('../src/main');
  });

  // 改良版 press 関数：属性（data-xx）を使ってピンポイントでボタンを探す
  const press = (keys: string[]) => {
    keys.forEach(key => {
      let btn: HTMLElement | null = null;

      if (/[0-9]/.test(key)) {
        btn = document.querySelector(`[data-num="${key}"]`);
      } else if (['+', '-', '×', '÷'].includes(key)) {
        btn = document.querySelector(`[data-op="${key}"]`);
      } else if (key === '.') {
        btn = document.querySelector('[data-dot]');
      } else if (key === '=') {
        btn = document.querySelector('[data-equal]');
      } else if (key === 'C') {
        btn = document.querySelector('[data-clear]');
      } else if (key === 'BS') {
        btn = document.querySelector('[data-backspace]');
      } else if (key === '√') {
        btn = document.querySelector('[data-sqrt]');
      } else if (key === '%') {
        btn = document.querySelector('[data-percent]');
      }

      if (btn) {
        fireEvent.click(btn);
      } else {
        throw new Error(`ボタンが見つかりません: ${key}`);
      }
    });
  };

  const getResult = () => document.getElementById('result')?.textContent;

  it('No.24: 四則演算の基本計算ができる (10 + 2 = 12)', () => {
    press(['1', '0', '+', '2', '=']);
    expect(getResult()).toBe('12');
  });

  it('No.22: 8桁制限が機能し、9文字目は無視される', () => {
    press(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    expect(getResult()).toBe('12345678');
  });

  it('No.51: 浮動小数点誤差が補正される (0.1 + 0.2 = 0.3)', () => {
    press(['0', '.', '1', '+', '0', '.', '2', '=']);
    expect(getResult()).toBe('0.3');
  });

  it('No.34: 0除算をした場合に「エラー」と表示される', () => {
    press(['5', '÷', '0', '=']);
    expect(getResult()).toBe('エラー');
  });

  it('No.37/40: 計算後に履歴が保存され、パネルに表示される', () => {
    press(['1', '+', '2', '=']);
    const historyList = document.getElementById('history-list');
    expect(historyList?.textContent).toContain('1 + 2 = 3');
  });

  it('No.55 (バグ修正確認): 指数表記の時にバックスペースを押しても壊れない', () => {
    // 10,000,000 * 10 = 100,000,000 (9桁なので指数表記になる)
    press(['1', '0', '0', '0', '0', '0', '0', '0', '×', '1', '0', '=']);
    const resultBeforeBS = getResult();
    expect(resultBeforeBS).toContain('e+');

    press(['BS']);
    expect(getResult()).toBe(resultBeforeBS);
  });

  it('No.56 (バグ修正確認): 計算完了直後に「.」を押すと「0.」から開始される', () => {
    press(['5', '+', '5', '=', '.']);
    expect(getResult()).toBe('0.');
    press(['5']);
    expect(getResult()).toBe('0.5');
  });

  it('No.41: 演算子の打ち替えができる (5 + - 3 = 2)', () => {
    press(['5', '+', '-', '3', '=']);
    expect(getResult()).toBe('2');
  });

  it('No.36: Cボタンですべてリセットされる', () => {
    press(['1', '2', '3', 'C']);
    expect(getResult()).toBe('0');
  });
});