import type { IDisplay } from "./IDisplay";
import { CalcState, Operation, type KeyToken } from "./types";
import { InputBuffer } from "./domain/InputBuffer";
import { Evaluator } from "./domain/Evaluator";
import { NumberFormatter } from "./domain/NumberFormatter";
import { DivisionByZeroError } from "./errors";

export class Calculator {
  private state: CalcState = CalcState.Ready;
  private left: number | null = null;
  private operator: Operation | null = null;

  // ★ 追加：計算完了時のコールバック関数
  public onCalculate?: (expression: string, formulaOnly: string) => void;

  constructor(
    private readonly display: IDisplay,
    private readonly formatter = new NumberFormatter(8),
    private readonly evaluator = new Evaluator(),
    private readonly buffer = new InputBuffer(8)
  ) {}

  /**
   * 入力トークンを受け取り、状態に応じた処理へ振り分ける
   */
  public handle(token: KeyToken): void {
    try {
      switch (token.kind) {
        case "digit":
          this.handleDigit(token.value);
          break;
        case "decimal":
          this.handleDecimal();
          break;
        case "op":
          this.handleOperator(token.value);
          break;
        case "equal":
          this.handleEqual();
          break;
        case "clear":
          this.handleClear();
          break;
          case "clear":
          this.handleClear();
          break;
        // ★ 追加
        case "backspace":
          this.handleBackspace();
          break;
        case "sqrt":
          this.handleSqrt();
          break;
        case "percent":
          this.handlePercent();
          break;
      }
    } catch (e) {
      if (e instanceof DivisionByZeroError) {
        this.toError("エラー");
      } else {
        this.toError("エラー");
      }
    }
  }

  // --- 各入力のハンドラ ---

  private handleDigit(d: number): void {
    // エラー後、または計算結果表示直後の場合は初期化して新規入力開始
    if (this.state === CalcState.Error || this.state === CalcState.ResultShown) {
      this.resetState();
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

  private handleDecimal(): void {
    if (this.state === CalcState.Error || this.state === CalcState.ResultShown) {
      this.resetState();
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

  private handleOperator(nextOp: Operation): void {
    if (this.state === CalcState.Error) return;

    // 1. 演算子入力直後に別の演算子が押された場合：演算子の置換
    if (this.state === CalcState.OperatorEntered) {
      this.operator = nextOp;
      return;
    }

    // 2. 2番目の数値を入力中に演算子が押された場合：左から順評価（即時計算）
    if (this.state === CalcState.InputtingSecond && this.left !== null && this.operator !== null) {
      const right = this.buffer.toNumber();
      const result = this.evaluator.compute(this.left, this.operator, right);

      this.left = result;
      this.operator = nextOp;
      this.buffer.clear();
      this.display.render(this.formatter.formatForDisplay(result));
      this.state = CalcState.OperatorEntered;
      return;
    }

    // 3. 1番目の数値を入力中、またはReady状態からの演算子入力
    if (this.state === CalcState.InputtingFirst || this.state === CalcState.Ready) {
      this.left = this.buffer.isEmpty() ? 0 : this.buffer.toNumber();
      this.operator = nextOp;
      this.state = CalcState.OperatorEntered;
      return;
    }

    // 4. 計算結果表示後（ResultShown）に演算子が押された場合：結果を引き継いで継続計算
    if (this.state === CalcState.ResultShown) {
      this.operator = nextOp;
      this.state = CalcState.OperatorEntered;
      return;
    }
  }

private handleEqual(): void {
    if (this.state === CalcState.Error) return;

    if (this.state === CalcState.InputtingSecond && this.left !== null && this.operator !== null) {
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

      // ★ 追加：履歴通知（例: "1 + 2 = 3", "1 + 2 ="）
      if (this.onCalculate) {
        this.onCalculate(`${a} ${op} ${b} = ${resStr}`, `${a} ${op} ${b} =`);
      }
    }
  }

  private handleClear(): void {
    this.resetState();
    this.display.render("0");
  }

  // --- ヘルパーメソッド ---

  private resetState(): void {
    this.left = null;
    this.operator = null;
    this.buffer.clear();
    this.state = CalcState.Ready;
  }

  private toError(message: string): void {
    this.state = CalcState.Error;
    this.left = null;
    this.operator = null;
    this.buffer.clear();
    this.display.renderError(message);
  }

  private handleBackspace(): void {
    // 以前の仕様: 計算結果表示時やエラー時はバックスペース無効
    if (this.state === CalcState.ResultShown || this.state === CalcState.Error) {
      return;
    }

    this.buffer.backspace();
    this.display.render(this.buffer.getValue() || "0");
  }

  private handleSqrt(): void {
    if (this.state === CalcState.Error) return;

    // 現在の対象数値を取得
    const currentVal = !this.buffer.isEmpty()
      ? this.buffer.toNumber()
      : this.left ?? 0;

    if (currentVal < 0) {
      this.toError("エラー");
      return;
    }

    const result = Math.sqrt(currentVal);
    const resStr = this.formatter.formatForDisplay(result);

    // 履歴に通知
    if (this.onCalculate) {
      this.onCalculate(`√(${currentVal}) = ${resStr}`, `√(${currentVal}) =`);
    }

    this.left = result;
    this.buffer.clear();
    this.state = CalcState.ResultShown;
    this.display.render(resStr);
  }

  private handlePercent(): void {
    if (this.state === CalcState.Error) return;

    const currentVal = !this.buffer.isEmpty()
      ? this.buffer.toNumber()
      : this.left ?? 0;

    const result = currentVal / 100;
    const resStr = this.formatter.formatForDisplay(result);

    this.buffer.setValue(resStr);
    this.display.render(resStr);
  }
}