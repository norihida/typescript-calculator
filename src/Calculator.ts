/**
 * 【電卓アプリケーション制御クラス】（アプリケーション層）
 * 電卓の頭脳として状態遷移（ステートマシン）を司り、入力解釈・計算指示・画面更新の連携を統括する中核クラス
 */

import type { IDisplay } from "./IDisplay";
import { CalcState } from "./CalcState";
import { Operation } from "./Operation";
import type { KeyToken } from "./KeyToken";
import { InputBuffer } from "./domain/InputBuffer";
import { Evaluator } from "./domain/Evaluator";
import { NumberFormatter } from "./domain/NumberFormatter";
import { Config } from "./Config";

export class Calculator {
  private state: CalcState = CalcState.Ready;
  private left: number | null = null;
  private operator: Operation | null = null;
  private formula: string = "";
  private lastOperator: Operation | null = null;
  private lastOperand: number | null = null;

  public onCalculate?: (expression: string, formulaOnly: string) => void;

  constructor(
    private readonly display: IDisplay,
    private readonly formatter = new NumberFormatter(Config.MAX_DIGITS),
    private readonly evaluator = new Evaluator(),
    private readonly buffer = new InputBuffer(Config.MAX_DIGITS)
  ) {}

  public handle(token: KeyToken): void {
    try {
      const actionMap: Record<KeyToken["kind"], () => void> = {
        digit: () => this.handleDigit((token as { value: number }).value),
        decimal: () => this.handleDecimalPoint(),
        op: () => this.handleOperator((token as { value: Operation }).value),
        equal: () => this.handleEqual(),
        clear: () => this.handleClear(),
        backspace: () => this.handleBackspace(),
        sqrt: () => this.handleSqrt(),
        percent: () => this.handlePercent(),
      };

      actionMap[token.kind]?.();
    } catch {
      this.toError(Config.ERROR_MESSAGE);
    }
  }

  // --- クラス図準拠の公開操作メソッド群 ---

  public handleDigit(d: number): void {
    if (this.state === CalcState.Error || this.state === CalcState.ResultShown) {
      this.resetState();
      this.updateFormula("");
    }

    if (this.state === CalcState.Ready || this.state === CalcState.OperatorEntered) {
      this.buffer.clear();
      this.state =
        this.state === CalcState.OperatorEntered
          ? CalcState.InputtingSecond
          : CalcState.InputtingFirst;
    }

    this.buffer.pushDigit(d);
    this.display.render(this.buffer.getValue());
  }

  public handleDecimalPoint(): void {
    if (this.state === CalcState.Error || this.state === CalcState.ResultShown) {
      this.resetState();
      this.updateFormula("");
    }

    if (this.state === CalcState.Ready || this.state === CalcState.OperatorEntered) {
      this.buffer.clear();
      this.state =
        this.state === CalcState.OperatorEntered
          ? CalcState.InputtingSecond
          : CalcState.InputtingFirst;
    }

    this.buffer.pushDecimal();
    this.display.render(this.buffer.getValue());
  }

  public handleOperator(nextOp: Operation): void {
    if (this.state === CalcState.Error) return;

    // 1. 演算子の押し替え
    if (this.state === CalcState.OperatorEntered) {
      this.operator = nextOp;
      this.updateFormula(`${this.left} ${nextOp}`);
      return;
    }

    // 2. 連続計算（左から順評価：2 + 3 の後に × を押した等）
    if (this.state === CalcState.InputtingSecond && this.left !== null && this.operator !== null) {
      const right = this.buffer.toNumber();
      try {
        const result = this.evaluator.compute(this.left, this.operator, right);
        this.left = result;
        this.operator = nextOp;
        this.buffer.clear();

        const resStr = this.formatter.formatForDisplay(result);
        this.display.render(resStr);
        this.updateFormula(`${resStr} ${nextOp}`);
        this.state = CalcState.OperatorEntered;
      } catch {
        this.toError(Config.ERROR_MESSAGE);
      }
      return;
    }

    // 3. 最初の演算子入力
    if (this.state === CalcState.InputtingFirst || this.state === CalcState.Ready) {
      this.left = this.buffer.isEmpty() ? 0 : this.buffer.toNumber();
      this.operator = nextOp;
      this.updateFormula(`${this.left} ${nextOp}`);
      this.state = CalcState.OperatorEntered;
      return;
    }

    // 4. 計算結果表示後の演算子入力
    if (this.state === CalcState.ResultShown) {
      this.operator = nextOp;
      this.updateFormula(`${this.left} ${nextOp}`);
      this.state = CalcState.OperatorEntered;
      return;
    }
  }

  public handleEqual(): void {
    if (this.state === CalcState.Error) return;

    // 1. 通常の計算: 5 + 3 =
    if (this.state === CalcState.InputtingSecond && this.left !== null && this.operator !== null) {
      this.executeCalculation(this.left, this.operator, this.buffer.toNumber());
      return;
    }

    // 2. 同値計算: 5 + =
    if (this.state === CalcState.OperatorEntered && this.left !== null && this.operator !== null) {
      this.executeCalculation(this.left, this.operator, this.left);
      return;
    }

    // 3. リピート計算: 結果表示後に = を連打
    if (this.state === CalcState.ResultShown && this.left !== null && this.lastOperator !== null && this.lastOperand !== null) {
      this.executeCalculation(this.left, this.lastOperator, this.lastOperand);
      return;
    }
  }

  private executeCalculation(a: number, op: Operation, b: number): void {
    try {
      const result = this.evaluator.compute(a, op, b);
      const resStr = this.formatter.formatForDisplay(result);

      this.left = result;
      this.lastOperator = op;
      this.lastOperand = b;
      this.operator = null;
      this.buffer.clear();
      this.display.render(resStr);
      this.state = CalcState.ResultShown;

      const formulaOnly = `${a} ${op} ${b} =`;
      const fullExpression = `${formulaOnly} ${resStr}`;
      this.updateFormula(formulaOnly);
      this.onCalculate?.(fullExpression, formulaOnly);
    } catch {
      // ★ 0除算例外をここで確実にキャッチして Error 状態へ遷移
      this.toError(Config.ERROR_MESSAGE);
    }
  }

  public handleClear(): void {
    this.resetState();
    this.display.render("0");
    this.updateFormula("");
  }

  public handleAllClear(): void {
    this.handleClear();
  }

  public handleBackspace(): void {
    if (this.state === CalcState.ResultShown || this.state === CalcState.Error) {
      return;
    }
    this.buffer.backspace();
    this.display.render(this.buffer.getValue() || "0");
  }

  public handleSqrt(): void {
    if (this.state === CalcState.Error) return;
    const currentVal = !this.buffer.isEmpty() ? this.buffer.toNumber() : this.left ?? 0;

    if (currentVal < 0) {
      this.toError(Config.ERROR_MESSAGE);
      return;
    }

    const result = Math.sqrt(currentVal);
    const resStr = this.formatter.formatForDisplay(result);
    const formulaStr = `√(${currentVal}) =`;

    this.updateFormula(formulaStr);
    this.onCalculate?.(`${formulaStr} ${resStr}`, formulaStr);

    this.left = result;
    this.buffer.clear();
    this.state = CalcState.ResultShown;
    this.display.render(resStr);
  }

  public handlePercent(): void {
    if (this.state === CalcState.Error) return;
    const currentVal = !this.buffer.isEmpty() ? this.buffer.toNumber() : this.left ?? 0;
    const result = currentVal / 100;
    const resStr = this.formatter.formatForDisplay(result);

    this.buffer.setValue(resStr);
    this.display.render(resStr);
  }

  // --- ヘルパーメソッド ---

  private updateFormula(formula: string): void {
    this.formula = formula;
    this.display.renderFormula(this.formula);
  }

  private resetState(): void {
    this.left = null;
    this.operator = null;
    this.lastOperator = null;
    this.lastOperand = null;
    this.buffer.clear();
    this.state = CalcState.Ready;
  }

  private toError(message: string): void {
    this.state = CalcState.Error;
    this.resetState();
    this.updateFormula("");
    this.display.renderError(message);
  }
}