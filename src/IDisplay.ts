export interface IDisplay {
  render(text: string): void;
  renderError(message: string): void;
}