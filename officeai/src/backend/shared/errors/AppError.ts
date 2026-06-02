export class AppError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}
