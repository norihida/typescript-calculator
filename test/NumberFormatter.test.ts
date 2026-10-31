import { describe, it, expect, beforeEach } from "vitest";
import { NumberFormatter } from "../src/domain/NumberFormatter";

describe("NumberFormatter（数値表示整形クラス）", () => {
  let formatter: NumberFormatter;

  beforeEach(() => {
    formatter = new NumberFormatter(8);
  });

  it("8桁以内の通常数値はそのまま文字列化されること", () => {
    expect(formatter.formatForDisplay(12345678)).toBe("12345678");
    expect(formatter.formatForDisplay(0)).toBe("0");
  });

  it("末尾の不要なゼロや小数点が付かないこと（2.0 -> 2, 1.50 -> 1.5）", () => {
    expect(formatter.formatForDisplay(1.5)).toBe("1.5");
    expect(formatter.formatForDisplay(2.0)).toBe("2");
  });

  it("8桁を超える大きな数値は指数表記に変換されること", () => {
    const result = formatter.formatForDisplay(100000000); // 1億（9桁）
    expect(result).toMatch(/e\+/);
  });

  it("fits() が桁数範囲内かどうかを正しく真偽値で判定できること", () => {
    expect(formatter.fits(99999999)).toBe(true);
    expect(formatter.fits(100000000)).toBe(false);
  });
});