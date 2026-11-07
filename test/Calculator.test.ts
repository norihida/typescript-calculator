import { describe, it, expect, beforeEach, vi } from "vitest";
import { Calculator } from "../src/Calculator";
import { Operation } from "../src/Operation";
import { CalcState } from "../src/CalcState";
import type { IDisplay } from "../src/IDisplay";

describe("Calculator（アプリケーション制御クラス）", () => {
  let mockDisplay: IDisplay;
  let calculator: Calculator;

  beforeEach(() => {
    mockDisplay = {
      render: vi.fn(),
      renderError: vi.fn(),
      renderFormula: vi.fn(),
    };
    calculator = new Calculator(mockDisplay);
  });

  // -------------------------------------------------------------
  // 1. 基本計算と機能のテスト
  // -------------------------------------------------------------
  it("数字と演算子を入力して等号を押すと計算結果が描画されること", () => {
    calculator.handleDigit(5);
    calculator.handleOperator(Operation.Add);
    calculator.handleDigit(3);
    calculator.handleEqual();

    expect(mockDisplay.render).toHaveBeenLastCalledWith("8");
  });

  it("左から順評価：連続して演算子を押した際に即時計算されること (2 + 3 ×)", () => {
    calculator.handleDigit(2);
    calculator.handleOperator(Operation.Add);
    calculator.handleDigit(3);
    calculator.handleOperator(Operation.Multiply);

    expect(mockDisplay.render).toHaveBeenLastCalledWith("5");
    expect(mockDisplay.renderFormula).toHaveBeenLastCalledWith("5 ×");
  });

  it("0除算が発生した場合にエラー表示へ遷移すること", () => {
    calculator.handleDigit(5);
    calculator.handleOperator(Operation.Divide);
    calculator.handleDigit(0);
    calculator.handleEqual();

    expect(mockDisplay.renderError).toHaveBeenCalledWith("エラー");
  });

  it("Clear で画面と計算式が初期化されること", () => {
    calculator.handleDigit(9);
    calculator.handleClear();

    expect(mockDisplay.render).toHaveBeenLastCalledWith("0");
    expect(mockDisplay.renderFormula).toHaveBeenLastCalledWith("");
  });

  it("同値計算：5 + = で 10 が計算されること", () => {
    calculator.handleDigit(5);
    calculator.handleOperator(Operation.Add);
    calculator.handleEqual();

    expect(mockDisplay.render).toHaveBeenLastCalledWith("10");
  });

  // -------------------------------------------------------------
  // 2. ★ 状態遷移（State）の検証テスト（講師からの指摘対応）
  // -------------------------------------------------------------
  describe("状態遷移（CalcState）のテスト", () => {
    it("初期状態は Ready であること", () => {
      expect(calculator.getState()).toBe(CalcState.Ready);
    });

    it("1つ目の数値を入力すると InputtingFirst に遷移すること", () => {
      calculator.handleDigit(1);
      expect(calculator.getState()).toBe(CalcState.InputtingFirst);
    });

    it("演算子を押すと OperatorEntered に遷移すること", () => {
      calculator.handleDigit(1);
      calculator.handleOperator(Operation.Add);
      expect(calculator.getState()).toBe(CalcState.OperatorEntered);
    });

    it("2つ目の数値を入力すると InputtingSecond に遷移すること", () => {
      calculator.handleDigit(1);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(2);
      expect(calculator.getState()).toBe(CalcState.InputtingSecond);
    });

    it("等号（=）を押して計算完了すると ResultShown に遷移すること", () => {
      calculator.handleDigit(1);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(2);
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.ResultShown);
    });

    it("0除算を行うと Error に遷移し、Clear で Ready に戻ること", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Divide);
      calculator.handleDigit(0);
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.Error);

      calculator.handleClear();
      expect(calculator.getState()).toBe(CalcState.Ready);
    });
  });

  // -------------------------------------------------------------
  // 3. ★ 小数点・負数の計算テスト
  // -------------------------------------------------------------
  describe("小数点および負数の計算テスト", () => {
    it("小数の足し算が正しく計算されること (0.1 + 0.2 = 0.3)", () => {
      calculator.handleDigit(0);
      calculator.handleDecimalPoint();
      calculator.handleDigit(1);

      calculator.handleOperator(Operation.Add);

      calculator.handleDigit(0);
      calculator.handleDecimalPoint();
      calculator.handleDigit(2);

      calculator.handleEqual();
      expect(mockDisplay.render).toHaveBeenLastCalledWith("0.3");
    });

    it("小数のかけ算が正しく計算されること (1.5 × 2 = 3)", () => {
      calculator.handleDigit(1);
      calculator.handleDecimalPoint();
      calculator.handleDigit(5);

      calculator.handleOperator(Operation.Multiply);
      calculator.handleDigit(2);

      calculator.handleEqual();
      expect(mockDisplay.render).toHaveBeenLastCalledWith("3");
    });

    it("起動直後のマイナス入力で負数の計算ができること (-5 + 3 = -2)", () => {
      // 起動直後に「-」を押す（負の符号入力）
      calculator.handleOperator(Operation.Subtract);
      calculator.handleDigit(5);

      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);

      calculator.handleEqual();
      expect(mockDisplay.render).toHaveBeenLastCalledWith("-2");
    });

    it("引き算で結果が負の数になる場合も正しく表示されること (5 - 8 = -3)", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Subtract);
      calculator.handleDigit(8);

      calculator.handleEqual();
      expect(mockDisplay.render).toHaveBeenLastCalledWith("-3");
    });
  });
});