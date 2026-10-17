import { Evaluator } from "./domain/Evaluator";
import { NumberFormatter } from "./domain/NumberFormatter";
import { Operation } from "./Operation";
import { DivisionByZeroError } from "./DivisionByZeroError";

export type Operator = "+" | "-" | "×" | "÷";

const evaluator = new Evaluator();
const formatter = new NumberFormatter(8);

export function formatValue(num: number, _maxDigits: number = 8): string {
  return formatter.formatForDisplay(num);
}

export function performCalculation(a: number, b: number, operator: Operator): number {
  let op: Operation;
  switch (operator) {
    case "+": op = Operation.Add; break;
    case "-": op = Operation.Subtract; break;
    case "×": op = Operation.Multiply; break;
    case "÷": op = Operation.Divide; break;
    default: throw new Error(`不明な演算子: ${operator}`);
  }

  try {
    return evaluator.compute(a, op, b);
  } catch (e) {
    if (e instanceof DivisionByZeroError) {
      throw new Error("0除算");
    }
    throw e;
  }
}