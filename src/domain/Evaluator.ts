import { Operation } from "../types";
import { DivisionByZeroError } from "../errors";

export class Evaluator {
  public compute(a: number, op: Operation, b: number): number {
    switch (op) {
      case Operation.Add:
        return parseFloat((a + b).toPrecision(12));
      case Operation.Subtract:
        return parseFloat((a - b).toPrecision(12));
      case Operation.Multiply:
        return parseFloat((a * b).toPrecision(12));
      case Operation.Divide:
        if (b === 0) {
          throw new DivisionByZeroError("Divide by zero");
        }
        return parseFloat((a / b).toPrecision(12));
      default:
        throw new Error("不明な演算子です");
    }
  }
}