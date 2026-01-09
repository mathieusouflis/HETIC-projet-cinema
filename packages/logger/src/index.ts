class Logger {
  public info(...args: unknown[]): void {
    console.log("\x1b[36m%s\x1b[0m", `    [INFO] `, ...args);
  }

  public warn(...args: unknown[]): void {
    console.log("\x1b[33m%s\x1b[0m", `    [WARN] `, ...args);
  }

  public error(...args: unknown[]): void {
    console.log("\x1b[31m%s\x1b[0m", `   [ERROR] `, ...args);
  }

  public success(...args: unknown[]): void {
    console.log("\x1b[32m%s\x1b[0m", ` [SUCCESS] `, ...args);
  }
}

export const logger = new Logger()
