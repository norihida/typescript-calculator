import { describe, it, expect, beforeEach } from "vitest";
import { InputBuffer } from "../src/domain/InputBuffer";

describe("InputBuffer（入力バッファ管理クラス）", () => {
  let buffer: InputBuffer;

  beforeEach(() => {
    buffer = new InputBuffer(8);
  });

  it("数字が順番に追加され、文字列および数値として取得できること", () => {
    buffer.pushDigit(1);
    buffer.pushDigit(2);
    buffer.pushDigit(3);
    expect(buffer.getValue()).toBe("123");
    expect(buffer.toNumber()).toBe(123);
  });

  it("先頭の0の重複入力が無視されること", () => {
    buffer.pushDigit(0);
    buffer.pushDigit(0);
    expect(buffer.getValue()).toBe("0");
  });

  it("小数点が正しく追加され、複数回押しても重複しないこと", () => {
    buffer.pushDecimal();
    expect(buffer.getValue()).toBe("0.");
    buffer.pushDigit(5);
    buffer.pushDecimal(); // 2回目のドットは無視
    expect(buffer.getValue()).toBe("0.5");
  });

  it("最大桁数（8桁）を超える数字は追加されないこと", () => {
    for (let i = 1; i <= 9; i++) {
      buffer.pushDigit(1);
    }
    expect(buffer.digitCount()).toBe(8);
    expect(buffer.getValue()).toBe("11111111");
  });

  it("backspace で末尾の文字が1文字削除されること", () => {
    buffer.pushDigit(1);
    buffer.pushDigit(2);
    buffer.backspace();
    expect(buffer.getValue()).toBe("1");
  });

  it("clear でバッファが空になること", () => {
    buffer.pushDigit(5);
    buffer.clear();
    expect(buffer.isEmpty()).toBe(true);
    expect(buffer.getValue()).toBe("");
  });
});