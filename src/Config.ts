/**
 * 【設定・定数管理】（ユーティリティ）
 * アプリ全体で使用する定数（最大入力桁数、エラーメッセージなど）を一元管理するクラス
 */

export class Config {
  public static readonly MAX_DIGITS: number = 8;
  public static readonly ERROR_MESSAGE: string = "エラー";
}