/**
 * 【電卓の状態定義】（ステートマシンモデル）
 * 電卓が現在どの段階にあるか（準備中、数値入力中、結果表示後、エラー等）を管理するEnum
 */

export enum CalcState {
  Ready,
  InputtingFirst,
  OperatorEntered,
  InputtingSecond,
  ResultShown,
  Error,
}