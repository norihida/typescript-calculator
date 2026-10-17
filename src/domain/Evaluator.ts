/**
 * 【四則演算実行クラス】（ドメイン層）
 * 渡された2つの数値と演算子に基づき、Strategy（テーブル駆動）パターンで純粋な四則演算を実施するクラス
 */

import { Operation } from "../Operation";
import { DivisionByZeroError } from "../DivisionByZeroError";

type OperationStrategy = (a: number, b: number) => number;

export class Evaluator {
  // ★ switch文を廃止し、Strategy（テーブル駆動）パターンを採用
  private readonly strategies: Record<Operation, OperationStrategy> = {
    [Operation.Add]: (a, b) => a + b,
    [Operation.Subtract]: (a, b) => a - b,
    [Operation.Multiply]: (a, b) => a * b,
    [Operation.Divide]: (a, b) => {
      if (b === 0) {
        throw new DivisionByZeroError("Divide by zero");
      }
      return a / b;
    },
  };

  public compute(a: number, op: Operation, b: number): number {
    const strategy = this.strategies[op];
    if (!strategy) {
      throw new Error(`未対応の演算子です: ${op}`);
    }

    const result = strategy(a, b);
    return parseFloat(result.toPrecision(12));
  }
}