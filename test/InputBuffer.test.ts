import { describe, it, expect, beforeEach } from "vitest";
import { InputBuffer } from "../src/domain/InputBuffer";

describe("InputBuffer（入力バッファ管理クラス）の単体テスト", () => {
  let buffer: InputBuffer;

  beforeEach(() => {
    buffer = new InputBuffer(8);
  });

  describe("文字・数字の追加制御", () => {
    it("数字が順番に追加され、文字列および数値として取得できること", () => {
      buffer.pushDigit(1);
      buffer.pushDigit(2);
      buffer.pushDigit(3);
      expect(buffer.getValue()).toBe("123");
      expect(buffer.toNumber()).toBe(123);
    });

    it("先頭の0の重複入力が無視されること (00 -> 0)", () => {
      buffer.pushDigit(0);
      buffer.pushDigit(0);
      expect(buffer.getValue()).toBe("0");
    });

    it("先頭0の後に別の数字を入力すると置き換わること (05 -> 5)", () => {
      buffer.pushDigit(0);
      buffer.pushDigit(5);
      expect(buffer.getValue()).toBe("5");
    });

    it("「0.」の後に数字を入力すると正しく追加されること (0. -> 0.5)", () => {
      buffer.pushDecimal();
      buffer.pushDigit(5);
      expect(buffer.getValue()).toBe("0.5");
    });

    it("小数の後に0を入力した場合、末尾ゼロが保持されること (0.5 -> 0.50)", () => {
      buffer.pushDecimal();
      buffer.pushDigit(5);
      buffer.pushDigit(0);
      expect(buffer.getValue()).toBe("0.50");
    });
  });

  describe("小数点の入力制御", () => {
    it("空の状態で小数を押すと「0.」になること", () => {
      buffer.pushDecimal();
      expect(buffer.getValue()).toBe("0.");
    });

    it("複数回小数点を押しても重複しないこと", () => {
      buffer.pushDigit(3);
      buffer.pushDecimal();
      buffer.pushDecimal(); // 重複
      buffer.pushDigit(5);
      expect(buffer.getValue()).toBe("3.5");
    });
  });

  describe("桁数制限（8桁）と境界値（小数・符号の除外判定）", () => {
    it("整数の場合、8桁まで入力でき9桁目は無視されること", () => {
      for (let i = 1; i <= 9; i++) {
        buffer.pushDigit(1);
      }
      expect(buffer.digitCount()).toBe(8);
      expect(buffer.getValue()).toBe("11111111");
    });

    it("小数点「.」は桁数カウントから除外され、数字8桁まで入力できること (123.45678)", () => {
      buffer.pushDigit(1);
      buffer.pushDigit(2);
      buffer.pushDigit(3);
      buffer.pushDecimal();
      buffer.pushDigit(4);
      buffer.pushDigit(5);
      buffer.pushDigit(6);
      buffer.pushDigit(7);
      buffer.pushDigit(8); // ここで数字8個

      expect(buffer.digitCount()).toBe(8);
      expect(buffer.getValue()).toBe("123.45678");

      buffer.pushDigit(9); // 9個目は無視
      expect(buffer.getValue()).toBe("123.45678");
    });

    it("負の符号「-」は桁数カウントから除外されること (-12345678)", () => {
      buffer.pushMinus();
      for (let i = 1; i <= 8; i++) {
        buffer.pushDigit(i);
      }
      expect(buffer.digitCount()).toBe(8);
      expect(buffer.getValue()).toBe("-12345678");

      buffer.pushDigit(9); // 9個目は無視
      expect(buffer.getValue()).toBe("-12345678");
    });
  });

  describe("バックスペース（削除）制御", () => {
    it("空の状態でBSを押してもエラーにならず空を維持すること", () => {
      buffer.backspace();
      expect(buffer.getValue()).toBe("");
      expect(buffer.isEmpty()).toBe(true);
    });

    it("数字の末尾1文字が削除されること (123 -> 12)", () => {
      buffer.pushDigit(1);
      buffer.pushDigit(2);
      buffer.pushDigit(3);
      buffer.backspace();
      expect(buffer.getValue()).toBe("12");
    });

    it("小数点が削除されること (12. -> 12)", () => {
      buffer.pushDigit(1);
      buffer.pushDigit(2);
      buffer.pushDecimal();
      buffer.backspace();
      expect(buffer.getValue()).toBe("12");
    });

    it("負の符号が削除されること (- -> 空)", () => {
      buffer.pushMinus();
      buffer.backspace();
      expect(buffer.getValue()).toBe("");
    });

    it("clear でバッファが完全にクリアされ、再入力可能なこと", () => {
      buffer.pushDigit(9);
      buffer.clear();
      expect(buffer.isEmpty()).toBe(true);

      buffer.pushDigit(7);
      expect(buffer.getValue()).toBe("7");
    });
  });
});