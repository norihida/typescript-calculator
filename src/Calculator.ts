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

  public onCalculate?: (expression: string, formulaOnly: string) => void;

  constructor(
    private readonly display: IDisplay,
    private readonly formatter = new NumberFormatter(Config.MAX_DIGITS),
    private readonly evaluator = new Evaluator(),
    private readonly buffer = new InputBuffer(Config.MAX_DIGITS)
  ) {}

  public getState(): CalcState {
    return this.state;
  }

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

  public handleDigit(d: number): void {
    if (this.state === CalcState.Error) return;

    if (this.state === CalcState.ResultShown) {
      this.resetState();
      this.updateFormula("");
    }

    if (this.state === CalcState.Ready || this.state === CalcState.OperatorEntered) {
      if (this.buffer.getValue() !== "-") {
        this.buffer.clear();
      }
      this.state =
        this.state === CalcState.OperatorEntered
          ? CalcState.InputtingSecond
          : CalcState.InputtingFirst;
    }

    this.buffer.pushDigit(d);
    this.display.render(this.buffer.getValue());
  }

  public handleDecimalPoint(): void {
    if (this.state === CalcState.Error) return;

    if (this.state === CalcState.ResultShown) {
      this.resetState();
      this.updateFormula("");
    }

    if (this.state === CalcState.Ready || this.state === CalcState.OperatorEntered) {
      if (this.buffer.getValue() !== "-") {
        this.buffer.clear();
      }
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

    // 負数入力モード
    if (nextOp === Operation.Subtract) {
      if (this.state === CalcState.Ready && this.buffer.isEmpty()) {
        this.buffer.pushMinus();
        this.display.render("-");
        this.updateFormula("0-");
        return;
      }
      if (this.buffer.getValue() === "-") {
        return;
      }
    }

    // 「-」入力中に別の演算子が押されたらキャンセルして「0」に戻す
    if (this.buffer.getValue() === "-") {
      this.buffer.clear();
      this.display.render("0");
    }

    // 1. 演算子の押し替え
    if (this.state === CalcState.OperatorEntered) {
      this.operator = nextOp;
      this.updateFormula(`${this.left} ${nextOp}`);
      return;
    }

    // 2. 連続計算（左から順評価）
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

    // ★ 設計書通り：left, operator, buffer（2項目目）が揃っている場合のみ評価
    if (this.state === CalcState.InputtingSecond && this.left !== null && this.operator !== null) {
      try {
        const a = this.left;
        const op = this.operator;
        const b = this.buffer.toNumber();

        const result = this.evaluator.compute(a, op, b);
        const resStr = this.formatter.formatForDisplay(result);

        this.left = result;
        this.operator = null;
        this.buffer.clear();
        this.display.render(resStr);
        this.state = CalcState.ResultShown;

        const formulaOnly = `${a} ${op} ${b} =`;
        const fullExpression = `${formulaOnly} ${resStr}`;
        this.updateFormula(formulaOnly);
        this.onCalculate?.(fullExpression, formulaOnly);
      } catch {
        this.toError(Config.ERROR_MESSAGE);
      }
      return;
    }

    // ★ 揃っていない場合（初期状態、演算子直後、計算結果表示後）は現表示維持（何もしない）
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

    if (this.buffer.isEmpty() || this.buffer.getValue() === "") {
      this.buffer.clear();
      this.display.render("0");
      this.updateFormula("");
      return;
    }

    this.display.render(this.buffer.getValue());
  }

  public handleSqrt(): void {
    if (this.state === CalcState.Error) return;
    if (this.state === CalcState.OperatorEntered) return;

    const currentVal = !this.buffer.isEmpty() ? this.buffer.toNumber() : this.left ?? 0;
    if (currentVal < 0) return;

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
    if (this.state === CalcState.OperatorEntered) return;

    const currentVal = !this.buffer.isEmpty() ? this.buffer.toNumber() : this.left ?? 0;
    const result = currentVal / 100;
    const resStr = this.formatter.formatForDisplay(result);

    // ★ 追加：計算結果表示中（ResultShown）の場合は、内部の left も更新して次の計算に備える
    if (this.state === CalcState.ResultShown) {
      this.left = result;
    } else {
      this.buffer.setValue(resStr);
    }

    this.display.render(resStr);
  }

  private updateFormula(formula: string): void {
    this.formula = formula;
    this.display.renderFormula(this.formula);
  }

  private resetState(): void {
    this.left = null;
    this.operator = null;
    this.buffer.clear();
    this.state = CalcState.Ready;
  }

  private toError(message: string): void {
    this.left = null;
    this.operator = null;
    this.buffer.clear();
    this.state = CalcState.Error;
    this.updateFormula("");
    this.display.renderError(message);
  }
}