export class CustomApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}
