/**
 * 【キー入力トークン定義】（ドメインモデル / 抽象型）
 * ボタンやキーボードから入力された操作種別（数字、小数、演算子、等号、クリア等）を型安全に表現するUnion型
 */

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