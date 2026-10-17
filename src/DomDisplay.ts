/**
 * 【DOM描画クラス】（UI層）
 * IDisplay を実装し、ブラウザのHTML要素に対して計算結果・エラー・数式を実際に反映するクラス
 */

import type { IDisplay } from "./IDisplay";

export class DomDisplay implements IDisplay {
  constructor(
    private readonly el: HTMLElement,
    private readonly formulaEl?: HTMLElement | null
  ) {}

  public render(text: string): void {
    this.el.textContent = text || "0";
    this.el.classList.remove("error");
  }

  public renderError(message: string): void {
    this.el.textContent = message;
    this.el.classList.add("error");
  }

  public renderFormula(formula: string): void {
    if (this.formulaEl) {
      this.formulaEl.textContent = formula;
    }
  }
}