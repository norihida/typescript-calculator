import { describe, it, expect, beforeEach } from "vitest";
import { Evaluator } from "../src/domain/Evaluator";
import { Operation } from "../src/Operation";
import { DivisionByZeroError } from "../src/DivisionByZeroError";

describe("Evaluator（計算実行クラス）の単体テスト", () => {
  let evaluator: Evaluator;

  beforeEach(() => {
    evaluator = new Evaluator();
  });

  describe("四則演算（基本・正の数）", () => {
    it("加算（足し算）が正しく計算されること (10 + 5 = 15)", () => {
      expect(evaluator.compute(10, Operation.Add, 5)).toBe(15);
    });

    it("減算（引き算）が正しく計算されること (10 - 4 = 6)", () => {
      expect(evaluator.compute(10, Operation.Subtract, 4)).toBe(6);
    });

    it("乗算（掛け算）が正しく計算されること (6 × 7 = 42)", () => {
      expect(evaluator.compute(6, Operation.Multiply, 7)).toBe(42);
    });

    it("除算（割り算）が正しく計算されること (20 ÷ 4 = 5)", () => {
      expect(evaluator.compute(20, Operation.Divide, 4)).toBe(5);
    });
  });

  describe("ゼロを含む計算", () => {
    it("0 + 5 = 5", () => {
      expect(evaluator.compute(0, Operation.Add, 5)).toBe(5);
    });

    it("5 - 0 = 5", () => {
      expect(evaluator.compute(5, Operation.Subtract, 0)).toBe(5);
    });

    it("123 × 0 = 0", () => {
      expect(evaluator.compute(123, Operation.Multiply, 0)).toBe(0);
    });

    it("0 ÷ 5 = 0", () => {
      expect(evaluator.compute(0, Operation.Divide, 5)).toBe(0);
    });
  });

  describe("負の数を含む計算", () => {
    it("負数 + 正数 (-5 + 3 = -2)", () => {
      expect(evaluator.compute(-5, Operation.Add, 3)).toBe(-2);
    });

    it("負数 - 正数 (-5 - 3 = -8)", () => {
      expect(evaluator.compute(-5, Operation.Subtract, 3)).toBe(-8);
    });

    it("負数 × 負数 (-5 × -3 = 15)", () => {
      expect(evaluator.compute(-5, Operation.Multiply, -3)).toBe(15);
    });

    it("負数 ÷ 正数 (-10 ÷ 2 = -5)", () => {
      expect(evaluator.compute(-10, Operation.Divide, 2)).toBe(-5);
    });
  });

  describe("小数・浮動小数点誤差の補正", () => {
    it("0.1 + 0.2 の丸め誤差が補正され 0.3 になること", () => {
      expect(evaluator.compute(0.1, Operation.Add, 0.2)).toBe(0.3);
    });

    it("0.7 + 0.1 の丸め誤差が補正され 0.8 になること", () => {
      expect(evaluator.compute(0.7, Operation.Add, 0.1)).toBe(0.8);
    });

    it("小数同士の掛け算が正しく計算されること (1.5 × 0.2 = 0.3)", () => {
      expect(evaluator.compute(1.5, Operation.Multiply, 0.2)).toBe(0.3);
    });

    it("小数同士の割り算が正しく計算されること (0.5 ÷ 0.2 = 2.5)", () => {
      expect(evaluator.compute(0.5, Operation.Divide, 0.2)).toBe(2.5);
    });

    it("割り切れない計算 (1 ÷ 3) が適切な精度で計算されること", () => {
      expect(evaluator.compute(1, Operation.Divide, 3)).toBeCloseTo(0.3333333, 6);
    });
  });

  describe("異常系（0除算）", () => {
    it("0で除算した際に DivisionByZeroError がスローされること", () => {
      expect(() => {
        evaluator.compute(10, Operation.Divide, 0);
      }).toThrow(DivisionByZeroError);
    });

    it("-0で除算した場合も DivisionByZeroError がスローされること", () => {
      expect(() => {
        evaluator.compute(10, Operation.Divide, -0);
      }).toThrow(DivisionByZeroError);
    });
  });
});