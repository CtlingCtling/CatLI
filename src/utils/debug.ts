export type DebugLevel = "error" | "warn" | "info" | "debug";

export interface DebugOptions {
  level: DebugLevel;
  output: "stderr" | "stdout" | "file" | "none";
  filePath?: string;
}

const DEFAULT_OPTIONS: DebugOptions = {
  level: "debug",
  output: "stderr",
};

let options: DebugOptions = { ...DEFAULT_OPTIONS };

const LEVELS: Record<DebugLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export function initDebug(opts: Partial<DebugOptions>): void {
  options = { ...options, ...opts };
}

export function setDebugLevel(level: DebugLevel): void {
  options.level = level;
}

export function debug(label: string, data?: unknown): void {
  if (LEVELS[options.level] < LEVELS.debug) return;

  const timestamp = new Date().toISOString();
  const header = `[DEBUG ${timestamp}] ${label}:`;
  const message = data !== undefined ? `\n${JSON.stringify(data, null, 2)}` : "";

  const fullMessage = `${header}${message}\n`;

  if (options.output === "stderr") {
    console.error(fullMessage);
  } else if (options.output === "stdout") {
    console.log(fullMessage);
  } else if (options.output === "file" && options.filePath) {
    // Lazy import to avoid circular deps
    import("fs").then((fs) => {
      fs.appendFileSync(options.filePath!, fullMessage);
    });
  }
  // output === "none" does nothing
}

export function info(label: string, data?: unknown): void {
  if (LEVELS[options.level] < LEVELS.info) return;

  const timestamp = new Date().toISOString();
  const header = `[INFO ${timestamp}] ${label}:`;
  const message = data !== undefined ? `\n${JSON.stringify(data, null, 2)}` : "";

  const fullMessage = `${header}${message}\n`;

  if (options.output === "stderr" || options.output === "stdout") {
    console.log(fullMessage);
  } else if (options.output === "file" && options.filePath) {
    import("fs").then((fs) => {
      fs.appendFileSync(options.filePath!, fullMessage);
    });
  }
}

export function warn(label: string, data?: unknown): void {
  if (LEVELS[options.level] < LEVELS.warn) return;

  const timestamp = new Date().toISOString();
  const header = `[WARN ${timestamp}] ${label}:`;
  const message = data !== undefined ? `\n${JSON.stringify(data, null, 2)}` : "";

  const fullMessage = `${header}${message}\n`;

  if (options.output === "stderr" || options.output === "stdout") {
    console.warn(fullMessage);
  } else if (options.output === "file" && options.filePath) {
    import("fs").then((fs) => {
      fs.appendFileSync(options.filePath!, fullMessage);
    });
  }
}

export function error(label: string, data?: unknown): void {
  if (LEVELS[options.level] < LEVELS.error) return;

  const timestamp = new Date().toISOString();
  const header = `[ERROR ${timestamp}] ${label}:`;
  const message = data !== undefined ? `\n${JSON.stringify(data, null, 2)}` : "";

  const fullMessage = `${header}${message}\n`;

  if (options.output === "stderr" || options.output === "stdout") {
    console.error(fullMessage);
  } else if (options.output === "file" && options.filePath) {
    import("fs").then((fs) => {
      fs.appendFileSync(options.filePath!, fullMessage);
    });
  }
}

export function getOptions(): DebugOptions {
  return { ...options };
}
