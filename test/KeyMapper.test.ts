import { describe, it, expect, beforeEach } from "vitest";
import { KeyMapper } from "../src/KeyMapper";
import { Operation } from "../src/Operation";

describe("KeyMapper（入力マッパークラス）の単体テスト", () => {
  let mapper: KeyMapper;

  beforeEach(() => {
    mapper = new KeyMapper();
  });

  describe("DOMの dataset からのトークン解決 (resolve)", () => {
    it("数字ボタン (0, 9) を正しく解決できること", () => {
      const btn0 = document.createElement("button");
      btn0.dataset.num = "0";
      expect(mapper.resolve(btn0)).toEqual({ kind: "digit", value: 0 });

      const btn9 = document.createElement("button");
      btn9.dataset.num = "9";
      expect(mapper.resolve(btn9)).toEqual({ kind: "digit", value: 9 });
    });

    it("四則演算ボタン (+, -, ×, ÷) を正しく解決できること", () => {
      const btnAdd = document.createElement("button");
      btnAdd.dataset.op = "+";
      expect(mapper.resolve(btnAdd)).toEqual({ kind: "op", value: Operation.Add });

      const btnSub = document.createElement("button");
      btnSub.dataset.op = "-";
      expect(mapper.resolve(btnSub)).toEqual({ kind: "op", value: Operation.Subtract });

      const btnMul = document.createElement("button");
      btnMul.dataset.op = "×";
      expect(mapper.resolve(btnMul)).toEqual({ kind: "op", value: Operation.Multiply });

      const btnDiv = document.createElement("button");
      btnDiv.dataset.op = "÷";
      expect(mapper.resolve(btnDiv)).toEqual({ kind: "op", value: Operation.Divide });
    });

    it("機能キー (., =, C, BS, √, %) を正しく解決できること", () => {
      const btnDot = document.createElement("button");
      btnDot.dataset.dot = "";
      expect(mapper.resolve(btnDot)).toEqual({ kind: "decimal" });

      const btnEq = document.createElement("button");
      btnEq.dataset.equal = "";
      expect(mapper.resolve(btnEq)).toEqual({ kind: "equal" });

      const btnClear = document.createElement("button");
      btnClear.dataset.clear = "";
      expect(mapper.resolve(btnClear)).toEqual({ kind: "clear" });

      const btnBS = document.createElement("button");
      btnBS.dataset.backspace = "";
      expect(mapper.resolve(btnBS)).toEqual({ kind: "backspace" });

      const btnSqrt = document.createElement("button");
      btnSqrt.dataset.sqrt = "";
      expect(mapper.resolve(btnSqrt)).toEqual({ kind: "sqrt" });

      const btnPercent = document.createElement("button");
      btnPercent.dataset.percent = "";
      expect(mapper.resolve(btnPercent)).toEqual({ kind: "percent" });
    });

    it("無効なボタン要素に対しては null を返すこと", () => {
      const emptyBtn = document.createElement("button");
      expect(mapper.resolve(emptyBtn)).toBeNull();
    });
  });

  describe("キーボード入力からのトークン解決 (resolveKey)", () => {
    it("主要キーを正しく解決できること", () => {
      expect(mapper.resolveKey("5")).toEqual({ kind: "digit", value: 5 });
      expect(mapper.resolveKey("+")).toEqual({ kind: "op", value: Operation.Add });
      expect(mapper.resolveKey("-")).toEqual({ kind: "op", value: Operation.Subtract });
      expect(mapper.resolveKey("*")).toEqual({ kind: "op", value: Operation.Multiply });
      expect(mapper.resolveKey("/")).toEqual({ kind: "op", value: Operation.Divide });
      expect(mapper.resolveKey(".")).toEqual({ kind: "decimal" });
      expect(mapper.resolveKey("Enter")).toEqual({ kind: "equal" });
      expect(mapper.resolveKey("=")).toEqual({ kind: "equal" });
      expect(mapper.resolveKey("Escape")).toEqual({ kind: "clear" });
      expect(mapper.resolveKey("Backspace")).toEqual({ kind: "backspace" });
    });

    it("アルファベット等の無効キーに対しては null を返すこと", () => {
      expect(mapper.resolveKey("a")).toBeNull();
      expect(mapper.resolveKey("Z")).toBeNull();
      expect(mapper.resolveKey("Shift")).toBeNull();
    });
  });
});