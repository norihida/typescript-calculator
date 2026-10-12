export class NumberFormatter {
  constructor(private readonly maxDigits: number = 8) {}

  public formatForDisplay(n: number): string {
    if (!Number.isFinite(n)) return "Error";

    const s = n.toString();
    // 符号と小数点を除いた桁数カウント
    const count = s.replace(/[.\-]/g, "").length;

    // 8桁を超える、または極端に大きい/小さい場合は指数表記
    if (count > this.maxDigits || Math.abs(n) >= 1e8 || (n !== 0 && Math.abs(n) < 1e-7)) {
      // 8文字程度に収まるように指数部の精度を調整（例: 1.23e+9）
      return n.toExponential(3).replace(/\.0+e/, "e");
    }

    // 不要な末尾ゼロのトリム（例: 1.500 -> 1.5, 2.0 -> 2）
    if (s.includes(".")) {
      return s.replace(/\.?0+$/, "");
    }

    return s;
  }
}