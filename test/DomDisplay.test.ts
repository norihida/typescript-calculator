import { describe, it, expect, beforeEach } from "vitest";
import { DomDisplay } from "../src/DomDisplay";

describe("DomDisplay（DOM描画クラス）", () => {
  let screenEl: HTMLElement;
  let formulaEl: HTMLElement;
  let display: DomDisplay;

  beforeEach(() => {
    screenEl = document.createElement("div");
    formulaEl = document.createElement("div");
    display = new DomDisplay(screenEl, formulaEl);
  });

  it("render でメイン画面にテキストが反映されること", () => {
    display.render("123");
    expect(screenEl.textContent).toBe("123");
  });

  it("renderError でエラーメッセージとエラースタイルが適用されること", () => {
    display.renderError("エラー");
    expect(screenEl.textContent).toBe("エラー");
    expect(screenEl.classList.contains("error")).toBe(true);
  });

  it("renderFormula で計算式要素にテキストが反映されること", () => {
    display.renderFormula("1 + 2 =");
    expect(formulaEl.textContent).toBe("1 + 2 =");
  });
});