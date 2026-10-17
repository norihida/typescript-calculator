export class NumberFormatter {
  private readonly maxDigits: number;

  constructor(maxDigits: number = 8) {
    this.maxDigits = maxDigits;
  }

  /**
   * 数値が通常の桁数制限（8桁）に収まるかどうかを判定する
   */
  public fits(n: number): boolean {
    if (!Number.isFinite(n)) return false;
    const s = n.toString();
    const count = s.replace(/[.\-]/g, "").length;
    return count <= this.maxDigits && Math.abs(n) < 1e8 && (n === 0 || Math.abs(n) >= 1e-7);
  }

  public formatForDisplay(n: number): string {
    if (!Number.isFinite(n)) return "Error";

    // fits で収まらない場合は指数表記
    if (!this.fits(n)) {
      return n.toExponential(3).replace(/\.0+e/, "e");
    }

    const s = n.toString();
    if (s.includes(".")) {
      return s.replace(/\.?0+$/, "");
    }

    return s;
  }
}