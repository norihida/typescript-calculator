import { describe, it, expect, beforeEach } from "vitest";
import { Evaluator } from "../src/domain/Evaluator";
import { NumberFormatter } from "../src/domain/NumberFormatter";
import { InputBuffer } from "../src/domain/InputBuffer";
import { Operation } from "../src/Operation";
import { DivisionByZeroError } from "../src/DivisionByZeroError";

describe("【単体テスト】ドメイン層の検証", () => {
  // ----------------------------------------------------------------
  // 1. Evaluator（計算ロジック）のテスト
  // ----------------------------------------------------------------
  describe("Evaluator（計算実行）", () => {
    let evaluator: Evaluator;

    beforeEach(() => {
      evaluator = new Evaluator();
    });

    it("四則演算（加減乗除）が正しく計算されること", () => {
      expect(evaluator.compute(10, Operation.Add, 5)).toBe(15);
      expect(evaluator.compute(10, Operation.Subtract, 4)).toBe(6);
      expect(evaluator.compute(6, Operation.Multiply, 7)).toBe(42);
      expect(evaluator.compute(20, Operation.Divide, 4)).toBe(5);
    });

    it("浮動小数点の計算誤差が補正されること（0.1 + 0.2 = 0.3）", () => {
      expect(evaluator.compute(0.1, Operation.Add, 0.2)).toBe(0.3);
    });

    it("0で除算した際に DivisionByZeroError がスローされること", () => {
      expect(() => {
        evaluator.compute(10, Operation.Divide, 0);
      }).toThrow(DivisionByZeroError);
    });
  });

  // ----------------------------------------------------------------
  // 2. NumberFormatter（表示フォーマット）のテスト
  // ----------------------------------------------------------------
  describe("NumberFormatter（表示整形）", () => {
    let formatter: NumberFormatter;

    beforeEach(() => {
      formatter = new NumberFormatter(8);
    });

    it("8桁以内の通常数値はそのまま文字列化されること", () => {
      expect(formatter.formatForDisplay(12345678)).toBe("12345678");
      expect(formatter.formatForDisplay(0)).toBe("0");
    });

    it("末尾の不要なゼロや小数点が付かないこと", () => {
      expect(formatter.formatForDisplay(1.5)).toBe("1.5");
      expect(formatter.formatForDisplay(2.0)).toBe("2");
    });

    it("8桁を超える大きな数値は指数表記に変換されること", () => {
      const result = formatter.formatForDisplay(100000000); // 1億（9桁）
      expect(result).toMatch(/e\+/); // "1e+8" などの指数表現を含むこと
    });

    it("fits() が桁数範囲内かどうかを正しく真偽値で判定できること", () => {
      expect(formatter.fits(99999999)).toBe(true);  // 8桁: true
      expect(formatter.fits(100000000)).toBe(false); // 9桁: false
    });
  });

  // ----------------------------------------------------------------
  // 3. InputBuffer（入力文字列管理）のテスト
  // ----------------------------------------------------------------
  describe("InputBuffer（入力バッファ）", () => {
    let buffer: InputBuffer;

    beforeEach(() => {
      buffer = new InputBuffer(8);
    });

    it("数字が順番に追加され、数値化できること", () => {
      buffer.pushDigit(1);
      buffer.pushDigit(2);
      buffer.pushDigit(3);
      expect(buffer.getValue()).toBe("123");
      expect(buffer.toNumber()).toBe(123);
    });

    it("先頭の0の重複入力が防がれること（0を2回押しても0のまま）", () => {
      buffer.pushDigit(0);
      buffer.pushDigit(0);
      expect(buffer.getValue()).toBe("0");
    });

    it("小数点が正しく追加され、複数回押しても重複しないこと", () => {
      buffer.pushDecimal();
      expect(buffer.getValue()).toBe("0.");
      buffer.pushDigit(5);
      buffer.pushDecimal(); // 2回目のドットは無視
      expect(buffer.getValue()).toBe("0.5");
    });

    it("8桁を超える入力は無視されること", () => {
      for (let i = 1; i <= 9; i++) {
        buffer.pushDigit(1);
      }
      expect(buffer.digitCount()).toBe(8);
      expect(buffer.getValue()).toBe("11111111");
    });

    it("backspace で末尾の文字が1文字消去されること", () => {
      buffer.pushDigit(1);
      buffer.pushDigit(2);
      buffer.backspace();
      expect(buffer.getValue()).toBe("1");
    });
  });
});

// ----------------------------------------------------------------
  // 4. 追加機能・エッジケースのテスト
  // ----------------------------------------------------------------
  describe("追加機能・エッジケースの検証", () => {
    it("Evaluator: 連続した四則演算が計算できること（左から順評価の検証）", () => {
      const evaluator = new Evaluator();
      // 2 + 3 = 5
      const step1 = evaluator.compute(2, Operation.Add, 3);
      expect(step1).toBe(5);
      // 5 * 4 = 20
      const step2 = evaluator.compute(step1, Operation.Multiply, 4);
      expect(step2).toBe(20);
    });

    it("NumberFormatter: 負の数や小数の指数表記判定が正しく行われること", () => {
      const formatter = new NumberFormatter(8);
      expect(formatter.fits(-9999999)).toBe(true);  // 負の数でも8桁以内ならtrue
      expect(formatter.fits(-100000000)).toBe(false); // 桁あふれはfalse
    });
  });