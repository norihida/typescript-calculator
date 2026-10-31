import { describe, it, expect, beforeEach } from "vitest";
import { KeyMapper } from "../src/KeyMapper";
import { Operation } from "../src/Operation";

describe("KeyMapper（入力マッパークラス）", () => {
  let mapper: KeyMapper;

  beforeEach(() => {
    mapper = new KeyMapper();
  });

  it("dataset の情報から数字トークン（digit）を解決できること", () => {
    const btn = document.createElement("button");
    btn.dataset.num = "7";
    expect(mapper.resolve(btn)).toEqual({ kind: "digit", value: 7 });
  });

  it("dataset の情報から演算子トークン（op）を解決できること", () => {
    const btn = document.createElement("button");
    btn.dataset.op = "+";
    expect(mapper.resolve(btn)).toEqual({ kind: "op", value: Operation.Add });
  });

  it("キーボードの文字列からトークンを解決できること", () => {
    expect(mapper.resolveKey("5")).toEqual({ kind: "digit", value: 5 });
    expect(mapper.resolveKey("+")).toEqual({ kind: "op", value: Operation.Add });
    expect(mapper.resolveKey("Enter")).toEqual({ kind: "equal" });
    expect(mapper.resolveKey("Escape")).toEqual({ kind: "clear" });
    expect(mapper.resolveKey("Backspace")).toEqual({ kind: "backspace" });
  });

  it("未定義の入力に対しては null を返すこと", () => {
    expect(mapper.resolveKey("a")).toBeNull();
  });
});