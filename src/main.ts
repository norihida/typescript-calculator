import { DomDisplay } from "./DomDisplay";
import { Calculator } from "./Calculator";
import { KeyMapper } from "./KeyMapper";
import { Operation, type KeyToken } from "./types";

// 画面表示要素の取得
const screenElement = (document.getElementById("result") ||
  document.getElementById("screen")) as HTMLElement;
const historyEl = document.getElementById("history") as HTMLElement | null;
const historyPanel = document.getElementById("history-panel") as HTMLElement | null;
const historyList = document.getElementById("history-list") as HTMLElement | null;
const toggleHistoryBtn = document.getElementById("toggle-history") as HTMLElement | null;
const closeHistoryBtn = document.getElementById("close-history") as HTMLElement | null;

if (!screenElement) {
  throw new Error("表示用の画面要素が見つかりません。");
}

const display = new DomDisplay(screenElement);
const calculator = new Calculator(display);
const mapper = new KeyMapper();

display.render("0");

// --- 履歴機能 ---
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

// ★ Calculator から計算完了の通知を受け取って履歴を更新
calculator.onCalculate = (fullExpression, formulaOnly) => {
  if (historyEl) historyEl.textContent = formulaOnly;
  updateAndSaveHistory(fullExpression);
};

// 履歴パネルの開閉イベント
toggleHistoryBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  historyPanel?.classList.add("active");
});
closeHistoryBtn?.addEventListener("click", () => historyPanel?.classList.remove("active"));
historyPanel?.addEventListener("click", () => historyPanel?.classList.remove("active"));

// --- ボタンクリック処理 ---
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const token = mapper.resolve(btn);
    if (token) {
      calculator.handle(token);
    }
  });
});

// --- キーボード入力 ---
window.addEventListener("keydown", (e: KeyboardEvent) => {
  let token: KeyToken | null = null;
  if (e.key >= "0" && e.key <= "9") token = { kind: "digit", value: Number(e.key) };
  else if (e.key === ".") token = { kind: "decimal" };
  else if (e.key === "+") token = { kind: "op", value: Operation.Add };
  else if (e.key === "-") token = { kind: "op", value: Operation.Subtract };
  else if (e.key === "*") token = { kind: "op", value: Operation.Multiply };
  else if (e.key === "/") { e.preventDefault(); token = { kind: "op", value: Operation.Divide }; }
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); token = { kind: "equal" }; }
  else if (e.key === "Escape") token = { kind: "clear" };
  else if (e.key === "Backspace") token = { kind: "backspace" }; 

  if (token) {
    calculator.handle(token);
  }
});




// import { formatValue, performCalculation, type Operator } from './logic';

// // --- 画面のパーツ（ボタンや表示エリア）を読み込む ---
// const resultEl = document.getElementById("result") as HTMLDivElement;
// const historyEl = document.getElementById("history") as HTMLDivElement;
// const historyPanel = document.getElementById("history-panel") as HTMLDivElement;
// const historyList = document.getElementById("history-list") as HTMLDivElement;
// const toggleHistoryBtn = document.getElementById(
//   "toggle-history",
// ) as HTMLButtonElement;
// const closeHistoryBtn = document.getElementById(
//   "close-history",
// ) as HTMLButtonElement;

// // --- データを覚えさせておくための変数 ---
// let current = ""; 
// let operator: Operator | null = null; // 型を Operator | null に変更
// let previous: number | null = null; 
// let isError = false; 
// let isCalculated = false; 
// const MAX_DIGITS = 8; 

// // --- 履歴（過去の計算）の設定 ---
// let histories: string[] = JSON.parse(
//   localStorage.getItem("calc_history") || "[]",
// );

// window.addEventListener("DOMContentLoaded", () => renderHistoryList());

// function updateAndSaveHistory(entry?: string) {
//   if (entry) {
//     histories.unshift(entry);
//     if (histories.length > 20) histories.pop();
//     localStorage.setItem("calc_history", JSON.stringify(histories));
//   }
//   renderHistoryList();
// }

// function renderHistoryList() {
//   historyList.innerHTML = histories
//     .map(
//       (h) =>
//         `<div style="padding:12px 0; border-bottom:1px solid #eee; font-size:14px;">${h}</div>`,
//     )
//     .join("");
// }

// function updateDisplay(value: string) {
//   resultEl.textContent = value || "0";
// }

// // --- 実際の計算処理（logic.ts を呼び出すように変更） ---
// function calculate() {
//   if (previous === null || operator === null || current === "" || current === "-") return;

//   const a = previous;
//   const b = Number(current);

//   try {
//     const result = performCalculation(a, b, operator);
//     const resStr = formatValue(result, MAX_DIGITS);

//     historyEl.textContent = `${a} ${operator} ${b} =`;
//     updateDisplay(resStr);
//     updateAndSaveHistory(`${a} ${operator} ${b} = ${resStr}`);

//     current = resStr;
//     previous = null;
//     operator = null;
//     isCalculated = true; // 計算完了フラグ
//   } catch (e) {
//     updateDisplay("エラー");
//     isError = true;
//     current = "";
//     previous = null;
//     operator = null;
//   }
// }

// function handleInput(type: string, value?: string) {
//   if (isError && type !== "clear") return;

//   switch (type) {
//     case "num":
//       if (isCalculated) {
//         current = "";
//         isCalculated = false;
//       }
//       // ...（以下、数字入力ロジックは変更なし）...
//       if (current.replace(/[^0-9]/g, "").length >= MAX_DIGITS) return;
//       if (current === "0") current = value!;
//       else if (current === "-0") current = "-" + value!;
//       else current += value!;
//       updateDisplay(current);
//       break;

//     case "op":
//       isCalculated = false;
//       // ...（演算子入力ロジックは変更なし、valueをOperator型として扱う）...
//       const opValue = value as Operator;
//       if (previous === null) {
//         if (current === "" || current === "-") {
//           if (opValue === "-") { current = "-"; updateDisplay(current); }
//           else { current = ""; updateDisplay("0"); }
//           return;
//         }
//       }
//       if ((current === "" || current === "-") && previous !== null) {
//         operator = opValue;
//         historyEl.textContent = `${previous} ${operator}`;
//         return;
//       }
//       if (previous !== null) calculate();
//       previous = Number(current);
//       operator = opValue;
//       current = "";
//       historyEl.textContent = `${previous} ${operator}`;
//       break;

//     case "dot":
//       // バグ2の修正: 計算直後の場合は、現在の結果をクリアして "0." から始める
//       if (isCalculated) {
//         current = "0";
//         isCalculated = false;
//       }
//       if (current === "" || current === "-") current = current === "-" ? "-0" : "0";
//       if (!current.includes(".")) {
//         current += ".";
//         updateDisplay(current);
//       }
//       break;

//     case "equal":
//       calculate();
//       break;

//     case "clear":
//       current = ""; previous = null; operator = null;
//       isError = false; isCalculated = false;
//       updateDisplay("0"); historyEl.textContent = "";
//       break;

//     case "backspace":
//       // バグ1の修正: 計算結果（指数表記など）が表示されている時はBackspaceを無効化する
//       // または、current = "" にしてリセットする
//       if (isCalculated) return; 
      
//       current = current.slice(0, -1);
//       updateDisplay(current || "0");
//       break;

//     case "sqrt":
//       if (current !== "" && current !== "-" && Number(current) >= 0) {
//         const resStr = formatValue(Math.sqrt(Number(current)), MAX_DIGITS);
//         updateAndSaveHistory(`√(${current}) = ${resStr}`);
//         current = resStr;
//         updateDisplay(current);
//         isCalculated = true;
//       }
//       break;

//     case "percent":
//       if (current !== "" && current !== "-") {
//         current = (Number(current) / 100).toString();
//         updateDisplay(current);
//       }
//       break;
//   }
// }

// // --- イベントリスナー（変更なし） ---
// document.querySelectorAll("button").forEach((btn) => {
//   btn.addEventListener("click", () => {
//     const d = btn.dataset;
//     if (d.num !== undefined) handleInput("num", d.num);
//     else if (d.op !== undefined) handleInput("op", d.op);
//     else if (d.dot !== undefined) handleInput("dot");
//     else if (d.equal !== undefined) handleInput("equal");
//     else if (d.clear !== undefined) handleInput("clear");
//     else if (d.sqrt !== undefined) handleInput("sqrt");
//     else if (d.percent !== undefined) handleInput("percent");
//     else if (d.backspace !== undefined) handleInput("backspace");
//   });
// });

// window.addEventListener("keydown", (e) => {
//   if (e.key >= "0" && e.key <= "9") handleInput("num", e.key);
//   if (e.key === ".") handleInput("dot");
//   if (e.key === "+") handleInput("op", "+");
//   if (e.key === "-") handleInput("op", "-");
//   if (e.key === "*") handleInput("op", "×");
//   if (e.key === "/") {
//     e.preventDefault();
//     handleInput("op", "÷");
//   }
//   if (e.key === "Enter" || e.key === "=") {
//     e.preventDefault();
//     handleInput("equal");
//   }
//   if (e.key === "Escape") handleInput("clear");
//   if (e.key === "Backspace") handleInput("backspace");
// });

// toggleHistoryBtn.addEventListener("click", (e) => {
//   e.stopPropagation();
//   historyPanel.classList.add("active");
// });
// closeHistoryBtn.addEventListener("click", () =>
//   historyPanel.classList.remove("active"),
// );
// historyPanel.addEventListener("click", () =>
//   historyPanel.classList.remove("active"),
// );
