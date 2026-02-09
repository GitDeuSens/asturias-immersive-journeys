// Logger utility - only logs in development
const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, ...args: any[]) => {
    if (isDev) {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
  log: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.info(message, ...args);
    }
  }
};
