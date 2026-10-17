/**
 * 【入力バッファ管理クラス】（ドメイン層）
 * 画面上で入力中のオペランド文字列を保持し、桁数制限（8桁）や小数点重複防止、1文字削除を担うクラス
 */

export class InputBuffer {
  private value = "";

  constructor(private readonly maxDigits: number = 8) {}

  public pushDigit(d: number): void {
    if (this.digitCount() >= this.maxDigits) return;

    if (this.value === "0") {
      this.value = String(d);
    } else {
      this.value += String(d);
    }
  }

  public pushDecimal(): void {
    if (this.digitCount() >= this.maxDigits) return;

    if (this.value === "") {
      this.value = "0.";
    } else if (!this.value.includes(".")) {
      this.value += ".";
    }
  }

  public clear(): void {
    this.value = "";
  }

  public set(val: string): void {
    this.value = val;
  }

  public getValue(): string {
    return this.value;
  }

  public toNumber(): number {
    return Number(this.value || 0);
  }

  public isEmpty(): boolean {
    return this.value.length === 0;
  }

  public digitCount(): number {
    return this.value.replace(/[.\-]/g, "").length;
  }

  // 末尾1文字を削除
  public backspace(): void {
    this.value = this.value.slice(0, -1);
  }

  // 特定の文字列（パーセント計算後など）を直接セット
  public setValue(val: string): void {
    this.value = val;
  }
}

