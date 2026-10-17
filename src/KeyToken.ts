import { Operation } from "./Operation";

export type KeyToken =
  | { kind: "digit"; value: number }
  | { kind: "decimal" }
  | { kind: "op"; value: Operation }
  | { kind: "equal" }
  | { kind: "clear" }
  | { kind: "backspace" }
  | { kind: "sqrt" }
  | { kind: "percent" };