export enum Operation {
  Add = "+",
  Subtract = "-",
  Multiply = "×",
  Divide = "÷",
}

export enum CalcState {
  Ready,
  InputtingFirst,
  OperatorEntered,
  InputtingSecond,
  ResultShown,
  Error,
}

export type KeyToken =
  | { kind: "digit"; value: number }
  | { kind: "decimal" }
  | { kind: "op"; value: Operation }
  | { kind: "equal" }
  | { kind: "clear" }
  | { kind: "backspace" }
  | { kind: "sqrt" }
  | { kind: "percent" };