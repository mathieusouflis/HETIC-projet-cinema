export const info = (...args: unknown[]): void => {
  console.log("\x1b[36m%s\x1b[0m", "[INFO]", ...args);
};

export const warn = (...args: unknown[]): void => {
  console.log("\x1b[33m%s\x1b[0m", "[WARN]", ...args);
};

export const error = (...args: unknown[]): void => {
  console.log("\x1b[31m%s\x1b[0m", "[ERROR]", ...args);
};

export const success = (...args: unknown[]): void => {
  console.log("\x1b[32m%s\x1b[0m", "[SUCCESS]", ...args);
};

export const logger = {
  info: info,
  warn: warn,
  error: error,
  success: success
}
