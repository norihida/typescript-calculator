import { describe, it, expect, beforeEach, vi } from "vitest";
import { Calculator } from "../src/Calculator";
import { Operation } from "../src/Operation";
import { CalcState } from "../src/CalcState";
import type { IDisplay } from "../src/IDisplay";

describe("Calculator（アプリケーション制御クラス）の単体テスト", () => {
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
  // 1. 基本計算と入力順序の制御
  // -------------------------------------------------------------
  describe("基本計算と入力制御", () => {
    it("数字と演算子を入力して等号を押すと計算結果が描画されること", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("8");
    });

    it("初期状態で等号（=）を押しても状態・表示が変わらないこと", () => {
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.Ready);
      expect(mockDisplay.render).not.toHaveBeenCalled();
    });

    it("初期状態で演算子（+）を押すと「0 +」として処理されること", () => {
      calculator.handleOperator(Operation.Add);
      expect(calculator.getState()).toBe(CalcState.OperatorEntered);
      expect(mockDisplay.renderFormula).toHaveBeenLastCalledWith("0 +");
    });

    it("演算子を連続で変更した場合、最後に入力した演算子が採用されること", () => {
      calculator.handleDigit(8);
      calculator.handleOperator(Operation.Add);
      calculator.handleOperator(Operation.Subtract);
      calculator.handleOperator(Operation.Multiply); // 最終的に「×」を採用
      calculator.handleDigit(2);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("16");
    });

    it("演算子入力直後に小数点を押すと「0.」から開始されること", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDecimalPoint();
      calculator.handleDigit(5);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("5.5");
    });

    it("計算完了後に数字を入力すると新しい計算として開始されること", () => {
      calculator.handleDigit(2);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);
      calculator.handleEqual(); // 結果: 5

      calculator.handleDigit(9); // 新規開始
      expect(calculator.getState()).toBe(CalcState.InputtingFirst);
      expect(mockDisplay.render).toHaveBeenLastCalledWith("9");
    });

    it("計算完了後に演算子を入力すると前回の結果を引き継ぐこと", () => {
      calculator.handleDigit(2);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);
      calculator.handleEqual(); // 結果: 5

      calculator.handleOperator(Operation.Multiply);
      calculator.handleDigit(4);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("20");
    });

    it("同じ演算子で連続イコールを押すとリピート計算されること (5 + = 10, = 15)", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleEqual(); // 10
      expect(mockDisplay.render).toHaveBeenLastCalledWith("10");

      calculator.handleEqual(); // 15
      expect(mockDisplay.render).toHaveBeenLastCalledWith("15");
    });
  });

  // -------------------------------------------------------------
  // 2. 特殊演算（√・%）
  // -------------------------------------------------------------
  describe("特殊演算（√・%）", () => {
    it("計算後に√を押すと結果の平方根が計算されること", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(4);
      calculator.handleEqual(); // 結果: 9

      calculator.handleSqrt(); // √9 = 3
      expect(mockDisplay.render).toHaveBeenLastCalledWith("3");
    });

    it("計算後に%を押すと結果が百分率変換されること", () => {
      calculator.handleDigit(10);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(10);
      calculator.handleEqual(); // 結果: 20

      calculator.handlePercent(); // 20% = 0.2
      expect(mockDisplay.render).toHaveBeenLastCalledWith("0.2");
    });
  });

  // -------------------------------------------------------------
  // 3. エラー状態での入力拒否と復帰（最重要）
  // -------------------------------------------------------------
  describe("エラー状態での操作拒否と復帰", () => {
    beforeEach(() => {
      // 0除算でエラー状態にする
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Divide);
      calculator.handleDigit(0);
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.Error);
    });

    it("エラー中に数字を押してもエラー状態が維持されること", () => {
      calculator.handleDigit(5);
      expect(calculator.getState()).toBe(CalcState.Error);
    });

    it("エラー中に演算子を押してもエラー状態が維持されること", () => {
      calculator.handleOperator(Operation.Add);
      expect(calculator.getState()).toBe(CalcState.Error);
    });

    it("エラー中に等号を押してもエラー状態が維持されること", () => {
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.Error);
    });

    it("エラー中にバックスペースを押してもエラー状態が維持されること", () => {
      calculator.handleBackspace();
      expect(calculator.getState()).toBe(CalcState.Error);
    });

    it("エラー中にClearを押すとReady状態へ安全に復帰すること", () => {
      calculator.handleClear();
      expect(calculator.getState()).toBe(CalcState.Ready);
      expect(mockDisplay.render).toHaveBeenLastCalledWith("0");
      expect(mockDisplay.renderFormula).toHaveBeenLastCalledWith("");
    });
  });

  // -------------------------------------------------------------
  // 4. クリアと状態初期化
  // -------------------------------------------------------------
  describe("クリア・リセット", () => {
    it("途中計算でCを押すとすべての内部状態が初期化され、その後の計算に影響しないこと", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);

      calculator.handleClear(); // リセット
      expect(calculator.getState()).toBe(CalcState.Ready);

      calculator.handleDigit(2);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(1);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("3");
    });
  });
});