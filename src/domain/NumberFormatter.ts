/**
 * 【数値表示整形クラス】（ドメイン層）
 * 計算結果の数値を画面表示用文字列に整形し、桁数超過時の指数表記変換や末尾ゼロ削除を担うクラス
 */

export class NumberFormatter {
  private readonly maxDigits: number;

  constructor(maxDigits: number = 8) {
    this.maxDigits = maxDigits;
  }

  public fits(n: number): boolean {
    if (!Number.isFinite(n)) return false;
    // 指数表記にするのは「1億以上」または「極小値（0を除く1e-7未満）」のとき
    return Math.abs(n) < 1e8 && (n === 0 || Math.abs(n) >= 1e-7);
  }

  public formatForDisplay(n: number): string {
    if (!Number.isFinite(n)) return "Error";

    // 1. 指数表記が必要な場合（1億以上、または極小値）
    if (!this.fits(n)) {
      const sign = n < 0 ? "-" : "";
      const absN = Math.abs(n);
      const expStr = absN.toExponential();
      const [mantissaStr, expPart] = expStr.split("e");
      const integerPart = mantissaStr.split(".")[0];
      return `${sign}${integerPart}e${expPart}`;
    }

    // 2. 通常表示の場合（1 ÷ 3 などの割り切れない小数は全体で8桁に丸める）
    let s = parseFloat(n.toPrecision(this.maxDigits)).toString();

    // 末尾の不要なゼロと小数点を削除
    if (s.includes(".")) {
      s = s.replace(/\.?0+$/, "");
    }

    return s;
  }
}