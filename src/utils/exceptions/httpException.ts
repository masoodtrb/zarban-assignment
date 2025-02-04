export interface HttpExceptionOptions {
  cause?: string;
  description?: string;
  statusCode?: number;
  data?: unknown
}

export class HttpException extends Error {
  public cause?: string;
  public description?: string;
  public statusCode?: number;
  public data: unknown;

  constructor(message: string, options?: HttpExceptionOptions) {
    super(message);
    this.name = 'HttpException';
    this.cause = options?.cause ?? message;
    this.description = options?.description;
    this.statusCode = options?.statusCode;
    this.data = options?.data;

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
