/**
 * 【入力マッパークラス】（UI層）
 * 画面上のボタン要素やキーボード入力を解析し、アプリが解釈できる KeyToken に変換するクラス
 */

import { Operation } from "./Operation";
import type { KeyToken } from "./KeyToken";

export class KeyMapper {
  private readonly keyMap: Map<string, KeyToken> = new Map();

  constructor() {
    this.initKeyMap();
  }

  private initKeyMap(): void {
    // 数字キー (0-9)
    for (let i = 0; i <= 9; i++) {
      this.keyMap.set(String(i), { kind: "digit", value: i });
    }
    // 小数点・等号・クリア・特殊操作
    this.keyMap.set(".", { kind: "decimal" });
    this.keyMap.set("=", { kind: "equal" });
    this.keyMap.set("C", { kind: "clear" });
    this.keyMap.set("backspace", { kind: "backspace" });
    this.keyMap.set("sqrt", { kind: "sqrt" });
    this.keyMap.set("percent", { kind: "percent" });

    // 演算子
    this.keyMap.set("+", { kind: "op", value: Operation.Add });
    this.keyMap.set("-", { kind: "op", value: Operation.Subtract });
    this.keyMap.set("×", { kind: "op", value: Operation.Multiply });
    this.keyMap.set("*", { kind: "op", value: Operation.Multiply });
    this.keyMap.set("÷", { kind: "op", value: Operation.Divide });
    this.keyMap.set("/", { kind: "op", value: Operation.Divide });
  }

  /**
   * DOMイベントのターゲットから KeyToken を解決する
   */
  public resolve(target: EventTarget): KeyToken | null {
    if (!(target instanceof HTMLElement)) return null;

    const dataset = target.dataset;
    const key =
      dataset.num ??
      dataset.op ??
      (dataset.dot !== undefined ? "." : undefined) ??
      (dataset.equal !== undefined ? "=" : undefined) ??
      (dataset.clear !== undefined ? "C" : undefined) ??
      (dataset.backspace !== undefined ? "backspace" : undefined) ??
      (dataset.sqrt !== undefined ? "sqrt" : undefined) ??
      (dataset.percent !== undefined ? "percent" : undefined);

    if (!key) return null;
    return this.keyMap.get(key) ?? null;
  }

  /**
   * キーボードのキー文字列から KeyToken を解決する
   */
  public resolveKey(key: string): KeyToken | null {
    if (key === "Enter") return this.keyMap.get("=") ?? null;
    if (key === "Escape") return this.keyMap.get("C") ?? null;
    if (key === "Backspace") return this.keyMap.get("backspace") ?? null;
    return this.keyMap.get(key) ?? null;
  }
}