export class DivisionByZeroError extends Error {
  constructor(message: string = "Divide by zero") {
    super(message);
    this.name = "DivisionByZeroError";
  }
}