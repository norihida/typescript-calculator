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
    const s = n.toString();
    const count = s.replace(/[.\-]/g, "").length;
    return count <= this.maxDigits && Math.abs(n) < 1e8 && (n === 0 || Math.abs(n) >= 1e-7);
  }

  public formatForDisplay(n: number): string {
    if (!Number.isFinite(n)) return "Error";

    // 8桁以内で通常表記できる場合
    if (this.fits(n)) {
      const s = n.toString();
      if (s.includes(".")) {
        return s.replace(/\.?0+$/, "");
      }
      return s;
    }

    // ★ 小数点以下をすべて切り捨てて整数部のみにする（例: 333333330 -> 3e+8）
    const sign = n < 0 ? "-" : "";
    const absN = Math.abs(n);
    const expStr = absN.toExponential(); // 例: "3.3333333e+8"
    const [mantissaStr, expPart] = expStr.split("e");

    // 小数点より前の「整数部分だけ」を取り出す（例: "3.3333" -> "3"）
    const integerPart = mantissaStr.split(".")[0];

    return `${sign}${integerPart}e${expPart}`;
  }
}