import { describe, it, expect, beforeEach } from "vitest";
import { NumberFormatter } from "../src/domain/NumberFormatter";

describe("NumberFormatter（数値表示整形クラス）", () => {
  let formatter: NumberFormatter;

  beforeEach(() => {
    formatter = new NumberFormatter(8);
  });

  it("8桁以内の通常数値はそのまま文字列化されること", () => {
    // 桁数がひと目でわかる数字を使用 (8桁)
    expect(formatter.formatForDisplay(12345678)).toBe("12345678");
    expect(formatter.formatForDisplay(0)).toBe("0");
  });

  it("末尾の不要なゼロや小数点が付かないこと（2.0 -> 2, 1.50 -> 1.5）", () => {
    expect(formatter.formatForDisplay(1.5)).toBe("1.5");
    expect(formatter.formatForDisplay(2.0)).toBe("2");
  });

  it("8桁を超える大きな数値は「切り捨て」の指数表記に変換されること", () => {
    // 9桁の数値 (小数点以下が切り捨てられるため 1e+8 になる)
    const result = formatter.formatForDisplay(123456789);
    expect(result).toBe("1e+8"); // ★ "1.234e+8" から "1e+8" に更新
  });

  it("fits() が桁数範囲内かどうかを正しく判定できること（12345678=8桁, 123456789=9桁）", () => {
    expect(formatter.fits(12345678)).toBe(true);  // 8桁: true
    expect(formatter.fits(123456789)).toBe(false); // 9桁: false
  });
});