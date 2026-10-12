import { Operation, type KeyToken } from "./types";

export class KeyMapper {
  // DOMボタンの dataset から KeyToken を判別する
  public resolve(element: HTMLElement): KeyToken | null {
    const dataset = element.dataset;

    // 数字キー
    if (dataset.num !== undefined) {
      return { kind: "digit", value: Number(dataset.num) };
    }

    // 小数点
    if (dataset.dot !== undefined) {
      return { kind: "decimal" };
    }

    // イコール
    if (dataset.equal !== undefined) {
      return { kind: "equal" };
    }

    // クリア
    if (dataset.clear !== undefined) {
      return { kind: "clear" };
    }

    // 演算子キー
    if (dataset.op !== undefined) {
      const op = this.toOperation(dataset.op);
      if (op) {
        return { kind: "op", value: op };
      }
    }

    // √（平方根）
    if (dataset.sqrt !== undefined) {
      return { kind: "sqrt" };
    }

    // %（パーセント）
    if (dataset.percent !== undefined) {
      return { kind: "percent" };
    }

    // ⌫（バックスペース）
    if (dataset.backspace !== undefined) {
      return { kind: "backspace" };
    }

    return null;
  }

  private toOperation(opStr: string): Operation | null {
    switch (opStr) {
      case "+":
        return Operation.Add;
      case "-":
        return Operation.Subtract;
      case "×":
      case "*":
        return Operation.Multiply;
      case "÷":
      case "/":
        return Operation.Divide;
      default:
        return null;
    }
  }
}