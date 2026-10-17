/**
 * 【カスタム例外：0除算エラー】（ユーティリティ / エラー定義）
 * 0による割り算が試みられた際にスローされる独自の例外クラス
 */

export class DivisionByZeroError extends Error {
  constructor(message: string = "Divide by zero") {
    super(message);
    this.name = "DivisionByZeroError";
  }
}