import { describe, it, expect, beforeEach } from "vitest";
import { Evaluator } from "../src/domain/Evaluator";
import { Operation } from "../src/Operation";
import { DivisionByZeroError } from "../src/DivisionByZeroError";

describe("Evaluator（計算実行クラス）", () => {
  let evaluator: Evaluator;

  beforeEach(() => {
    evaluator = new Evaluator();
  });

  it("加算（足し算）が正しく計算されること", () => {
    expect(evaluator.compute(10, Operation.Add, 5)).toBe(15);
  });

  it("減算（引き算）が正しく計算されること", () => {
    expect(evaluator.compute(10, Operation.Subtract, 4)).toBe(6);
  });

  it("乗算（掛け算）が正しく計算されること", () => {
    expect(evaluator.compute(6, Operation.Multiply, 7)).toBe(42);
  });

  it("除算（割り算）が正しく計算されること", () => {
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
