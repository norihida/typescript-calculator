export interface IDisplay {
  render(text: string): void;
  renderError(message: string): void;
  renderFormula(formula: string): void; // ★ 計算式の表示・クリア用
}