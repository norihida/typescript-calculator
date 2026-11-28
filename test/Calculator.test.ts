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
  // 1. 状態遷移（CalcState）の網羅テスト
  // -------------------------------------------------------------
  describe("状態遷移（CalcState）の網羅テスト", () => {
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

    it("★ 2つ目の数値を入力すると InputtingSecond に遷移すること", () => {
      calculator.handleDigit(1);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(2);
      expect(calculator.getState()).toBe(CalcState.InputtingSecond);
    });

    it("★ 通常計算：等号（=）を押して計算完了すると ResultShown に遷移すること", () => {
      calculator.handleDigit(1);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(2);
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.ResultShown);
    });

    it("★ 平方根（√）を計算した直後も ResultShown に遷移すること", () => {
      calculator.handleDigit(9);
      calculator.handleSqrt();
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
  // 2. 基本計算と入力順序の制御
  // -------------------------------------------------------------
  describe("基本計算と入力制御", () => {
    it("数字と演算子を入力して等号を押すと計算結果が描画されること", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("8");
    });

    it("初期状態で等号（=）を押しても状態・表示が変わらないこと（現表示維持）", () => {
      calculator.handleEqual();
      expect(calculator.getState()).toBe(CalcState.Ready);
      expect(mockDisplay.render).not.toHaveBeenCalled();
    });

    it("演算子の直後に等号（=）を押しても計算されず状態を維持すること (5 + =)", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleEqual(); // 2項目目がないので何もしない
      expect(calculator.getState()).toBe(CalcState.OperatorEntered);
    });

    it("計算完了後に等号（=）を連打しても再計算されず現表示を維持すること (5 + 3 = 8 の後)", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);
      calculator.handleEqual(); // 結果: 8
      expect(mockDisplay.render).toHaveBeenLastCalledWith("8");

      calculator.handleEqual(); // 連打：何もしない
      expect(calculator.getState()).toBe(CalcState.ResultShown);
      expect(mockDisplay.render).toHaveBeenLastCalledWith("8");
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
      calculator.handleOperator(Operation.Multiply);
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
      calculator.handleEqual();

      calculator.handleDigit(9);
      expect(calculator.getState()).toBe(CalcState.InputtingFirst);
      expect(mockDisplay.render).toHaveBeenLastCalledWith("9");
    });

    it("計算完了後に演算子を入力すると前回の結果を引き継ぐこと", () => {
      calculator.handleDigit(2);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);
      calculator.handleEqual();

      calculator.handleOperator(Operation.Multiply);
      calculator.handleDigit(4);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("20");
    });
  });

  // -------------------------------------------------------------
  // 3. 特殊演算（√・%）
  // -------------------------------------------------------------
  describe("特殊演算（√・%）", () => {
    it("計算後に√を押すと結果の平方根が計算されること", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(4);
      calculator.handleEqual();

      calculator.handleSqrt();
      expect(mockDisplay.render).toHaveBeenLastCalledWith("3");
    });

    it("計算後に%を押すと結果が百分率変換されること", () => {
      calculator.handleDigit(10);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(10);
      calculator.handleEqual();

      calculator.handlePercent();
      expect(mockDisplay.render).toHaveBeenLastCalledWith("0.2");
    });

    it("計算結果に対して%を押した後、続けて四則演算ができること (20 % -> 0.2 + 4 = 4.2)", () => {
      calculator.handleDigit(1);
      calculator.handleDigit(0);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(1);
      calculator.handleDigit(0);
      calculator.handleEqual(); // 結果: 20

      calculator.handlePercent(); // 0.2
      expect(mockDisplay.render).toHaveBeenLastCalledWith("0.2");

      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(4);
      calculator.handleEqual(); // 0.2 + 4 = 4.2
      expect(mockDisplay.render).toHaveBeenLastCalledWith("4.2");
    });
  });

  // -------------------------------------------------------------
  // 4. エラー状態での入力拒否と復帰
  // -------------------------------------------------------------
  describe("エラー状態での操作拒否と復帰", () => {
    beforeEach(() => {
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
  // 5. クリアと状態初期化
  // -------------------------------------------------------------
  describe("クリア・リセット", () => {
    it("途中計算でCを押すとすべての内部状態が初期化され、その後の計算に影響しないこと", () => {
      calculator.handleDigit(5);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(3);

      calculator.handleClear();
      expect(calculator.getState()).toBe(CalcState.Ready);

      calculator.handleDigit(2);
      calculator.handleOperator(Operation.Add);
      calculator.handleDigit(1);
      calculator.handleEqual();

      expect(mockDisplay.render).toHaveBeenLastCalledWith("3");
    });
  });
});