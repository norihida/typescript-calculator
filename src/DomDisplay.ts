import type { IDisplay } from "./IDisplay";

export class DomDisplay implements IDisplay {
  constructor(private readonly element: HTMLElement) {}

  public render(text: string): void {
    this.element.textContent = text || "0";
    this.element.classList.remove("error");
  }

  public renderError(message: string): void {
    this.element.textContent = message;
    this.element.classList.add("error");
  }
}