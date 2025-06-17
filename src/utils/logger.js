const config = require("../config/config");

class CustomLogger {
  constructor(env) {
    this.env = env || "development";
    this.level = this.env === "development" ? "debug" : "info";
  }

  formatMessage(level, message) {
    const formattedMessage = `${level}: ${message}`;

    if (this.env === "development") {
      // Colorize output in development
      const color = this.getColor(level);
      return `${color(formattedMessage)}`;
    } else {
      // Plain text output in production
      return `${formattedMessage}`;
    }
  }

  getColor(level) {
    const colors = {
      debug: (msg) => `\x1b[36m${msg}\x1b[0m`, // Cyan
      info: (msg) => `\x1b[32m${msg}\x1b[0m`, // Green
      warn: (msg) => `\x1b[33m${msg}\x1b[0m`, // Yellow
      error: (msg) => `\x1b[31m${msg}\x1b[0m`, // Red
    };
    return colors[level] || ((msg) => msg);
  }

  log(level, message, ...args) {
    const formattedMessage = this.formatMessage(level, message);

    if (args.length) {
      console.log(formattedMessage, ...args);
    } else {
      console.log(formattedMessage);
    }
  }

  debug(message, ...args) {
    if (this.level === "debug") {
      this.log("debug", message, ...args);
    }
  }

  info(message, ...args) {
    this.log("info", message, ...args);
  }

  warn(message, ...args) {
    this.log("warn", message, ...args);
  }

  error(message, ...args) {
    if (message instanceof Error) {
      this.log("error", message.stack, ...args);
    } else {
      this.log("error", message, ...args);
    }
  }
}

const logger = new CustomLogger(config.env);

module.exports = logger;
