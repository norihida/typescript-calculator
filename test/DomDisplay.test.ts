import { describe, it, expect, beforeEach } from "vitest";
import { DomDisplay } from "../src/DomDisplay";

describe("DomDisplay（DOM描画クラス）の単体テスト", () => {
  let screenEl: HTMLElement;
  let formulaEl: HTMLElement;
  let display: DomDisplay;

  beforeEach(() => {
    screenEl = document.createElement("div");
    formulaEl = document.createElement("div");
    display = new DomDisplay(screenEl, formulaEl);
  });

  describe("メイン画面描画 (render)", () => {
    it("通常数値を正しく描画できること", () => {
      display.render("123");
      expect(screenEl.textContent).toBe("123");
    });

    it("空文字が渡された場合は「0」が描画されること", () => {
      display.render("");
      expect(screenEl.textContent).toBe("0");
    });

    it("負数や指数表記も正しく描画されること", () => {
      display.render("-5");
      expect(screenEl.textContent).toBe("-5");

      display.render("1e+8");
      expect(screenEl.textContent).toBe("1e+8");
    });
  });

  describe("エラー表示とスタイルの切り替え (renderError)", () => {
    it("renderError でメッセージが表示され、error クラスが付与されること", () => {
      display.renderError("エラー");
      expect(screenEl.textContent).toBe("エラー");
      expect(screenEl.classList.contains("error")).toBe(true);
    });

    it("エラー表示の後に render が呼ばれると、error クラスが正しく解除されること", () => {
      display.renderError("エラー");
      expect(screenEl.classList.contains("error")).toBe(true);

      // 通常描画へ復帰
      display.render("0");
      expect(screenEl.textContent).toBe("0");
      expect(screenEl.classList.contains("error")).toBe(false);
    });
  });

  describe("計算式エリア描画 (renderFormula)", () => {
    it("計算式テキストが正しく反映されること", () => {
      display.renderFormula("1 + 2 =");
      expect(formulaEl.textContent).toBe("1 + 2 =");
    });

    it("空文字を渡すと計算式がクリアされること", () => {
      display.renderFormula("1 + 2 =");
      display.renderFormula("");
      expect(formulaEl.textContent).toBe("");
    });
  });
});