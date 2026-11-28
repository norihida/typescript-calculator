import { describe, it, expect, beforeEach } from "vitest";
import { NumberFormatter } from "../src/domain/NumberFormatter";

describe("NumberFormatter（数値表示整形クラス）の単体テスト", () => {
  let formatter: NumberFormatter;

  beforeEach(() => {
    formatter = new NumberFormatter(8);
  });

  describe("通常表示と末尾ゼロのトリム", () => {
    it("8桁以内の通常整数はそのまま文字列化されること (12345678)", () => {
      expect(formatter.formatForDisplay(12345678)).toBe("12345678");
      expect(formatter.formatForDisplay(0)).toBe("0");
    });

    it("負の整数も8桁以内なら通常表示されること (-12345678)", () => {
      expect(formatter.formatForDisplay(-12345678)).toBe("-12345678");
    });

    it("末尾の不要なゼロや小数点が付かないこと (1.50 -> 1.5, 2.0 -> 2)", () => {
      expect(formatter.formatForDisplay(1.5)).toBe("1.5");
      expect(formatter.formatForDisplay(2.0)).toBe("2");
    });

    it("割り切れない小数 (1 ÷ 3) は8桁枠内で丸められて通常表示されること (0.33333333)", () => {
      expect(formatter.formatForDisplay(1 / 3)).toBe("0.33333333");
    });
  }); 

  describe("指数表記の切り替えと切り捨て（境界値）", () => {
    it("8桁の上限値 (99999999) は通常表示されること", () => {
      expect(formatter.formatForDisplay(99999999)).toBe("99999999");
    });

    it("ちょうど1億 (100000000) は指数表記「1e+8」に切り替わること", () => {
      expect(formatter.formatForDisplay(100000000)).toBe("1e+8");
    });

    it("9桁の数値 (123456789) は仮数部が整数に切り捨てられて「1e+8」になること", () => {
      expect(formatter.formatForDisplay(123456789)).toBe("1e+8");
    });

    it("負の1億 (-100000000) は「-1e+8」になること", () => {
      expect(formatter.formatForDisplay(-100000000)).toBe("-1e+8");
    });

    it("0.000001 (1e-6) は通常表示で収まること", () => {
      expect(formatter.formatForDisplay(0.000001)).toBe("0.000001");
    });

    it("計算結果が0.0000001の場合、数値の文字列化により「1e-7」と表示されること", () => {
      expect(formatter.formatForDisplay(0.0000001)).toBe("1e-7");
    });
  });

  describe("fits() メソッドの判定テスト", () => {
    it("8桁以内なら true、1億以上なら false を返すこと", () => {
      expect(formatter.fits(12345678)).toBe(true);
      expect(formatter.fits(99999999)).toBe(true);
      expect(formatter.fits(100000000)).toBe(false);
    });

    it("極小値の境界 (1e-7 は true, 1e-8 は false)", () => {
      expect(formatter.fits(0.0000001)).toBe(true);
      expect(formatter.fits(0.00000001)).toBe(false);
    });
  });
});