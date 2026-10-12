export class DivisionByZeroError extends Error {
  constructor(message = "Divide by zero") {
    super(message);
    this.name = "DivisionByZeroError";
  }
}