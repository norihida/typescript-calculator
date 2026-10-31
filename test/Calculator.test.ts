import { describe, it, expect, beforeEach, vi } from "vitest";
import { Calculator } from "../src/Calculator";
import { Operation } from "../src/Operation";
import type { IDisplay } from "../src/IDisplay";

describe("Calculator（アプリケーション制御クラス）", () => {
  let mockDisplay: IDisplay;
  let calculator: Calculator;

  beforeEach(() => {
    // 画面の代わりにモック（テスト用ダミー）を作成
    mockDisplay = {
      render: vi.fn(),
      renderError: vi.fn(),
      renderFormula: vi.fn(),
    };
    calculator = new Calculator(mockDisplay);
  });

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
    calculator.handleOperator(Operation.Multiply); // この瞬間に 2 + 3 = 5 が計算される

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
});