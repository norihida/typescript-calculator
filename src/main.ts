import { DomDisplay } from "./DomDisplay";
import { Calculator } from "./Calculator";
import { KeyMapper } from "./KeyMapper";

const screenElement = (document.getElementById("result") ||
  document.getElementById("screen")) as HTMLElement;
const historyEl = document.getElementById("history") as HTMLElement | null;
const historyPanel = document.getElementById("history-panel") as HTMLElement | null;
const historyList = document.getElementById("history-list") as HTMLElement | null;
const toggleHistoryBtn = document.getElementById("toggle-history") as HTMLElement | null;
const closeHistoryBtn = document.getElementById("close-history") as HTMLElement | null;

if (!screenElement) {
  throw new Error("表示要素が見つかりません。");
}

// DomDisplay にメイン表示と計算式（historyEl）を両方渡す
const display = new DomDisplay(screenElement, historyEl);
const calculator = new Calculator(display);
const mapper = new KeyMapper();

display.render("0");
display.renderFormula("");

// --- 履歴リスト管理 ---
let histories: string[] = JSON.parse(localStorage.getItem("calc_history") || "[]");

function renderHistoryList() {
  if (!historyList) return;
  historyList.innerHTML = histories
    .map((h) => `<div style="padding:12px 0; border-bottom:1px solid #eee; font-size:14px;">${h}</div>`)
    .join("");
}

function updateAndSaveHistory(entry?: string) {
  if (entry) {
    histories.unshift(entry);
    if (histories.length > 20) histories.pop();
    localStorage.setItem("calc_history", JSON.stringify(histories));
  }
  renderHistoryList();
}

renderHistoryList();

calculator.onCalculate = (fullExpression) => {
  updateAndSaveHistory(fullExpression);
};

// 履歴パネル開閉
toggleHistoryBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  historyPanel?.classList.add("active");
});
closeHistoryBtn?.addEventListener("click", () => historyPanel?.classList.remove("active"));
historyPanel?.addEventListener("click", () => historyPanel?.classList.remove("active"));

// --- ボタンクリック処理 (KeyMapper.resolve を使用) ---
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const token = mapper.resolve(e.currentTarget ?? btn);
    if (token) {
      calculator.handle(token);
    }
  });
});

// --- キーボード入力 (KeyMapper.resolveKey を使用) ---
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (["/", "Enter", "="].includes(e.key)) {
    e.preventDefault();
  }
  const token = mapper.resolveKey(e.key);
  if (token) {
    calculator.handle(token);
  }
});