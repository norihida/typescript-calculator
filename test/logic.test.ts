import { describe, it, expect } from "vitest";
import { performCalculation, formatValue } from "../src/logic";

describe("計算ロジックのテスト", () => {
  it("足し算が正しく行われること", () => {
    expect(performCalculation(10, 5, "+")).toBe(15);
  });

  it("掛け算が正しく行われること", () => {
    expect(performCalculation(3, 4, "×")).toBe(12);
  });

  it("0で割るとエラーを投げること", () => {
    expect(() => performCalculation(10, 0, "÷")).toThrow("0除算");
  });
});

describe("フォーマット機能のテスト", () => {
  it("8桁以内の数字はそのまま表示されること", () => {
    expect(formatValue(12345678)).toBe("12345678");
  });

  it("大きい数字は指数表記になること", () => {
    const result = formatValue(100000000); // 9桁
    expect(result).toContain("e+");
  });
});
