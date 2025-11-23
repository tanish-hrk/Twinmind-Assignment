// Development logger utility

const isDevelopment = import.meta.env.MODE === 'development';

export class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = `[TwinMind ${prefix}]`;
  }

  log(...args: unknown[]): void {
    if (isDevelopment) {
      console.log(this.prefix, ...args);
    }
  }

  warn(...args: unknown[]): void {
    console.warn(this.prefix, ...args);
  }

  error(...args: unknown[]): void {
    console.error(this.prefix, ...args);
  }

  info(...args: unknown[]): void {
    if (isDevelopment) {
      console.info(this.prefix, ...args);
    }
  }

  debug(...args: unknown[]): void {
    if (isDevelopment) {
      console.debug(this.prefix, ...args);
    }
  }
}
