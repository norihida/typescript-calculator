/**
 * 【表示インターフェース】（UI層 / アプリケーション境界）
 * 電卓の出力先（メイン画面、エラー、計算式）を抽象化し、ロジックと画面表示を疎結合に保つための規約
 */

export interface IDisplay {
  render(text: string): void;
  renderError(message: string): void;
  renderFormula(formula: string): void; // ★ 計算式の表示・クリア用
}