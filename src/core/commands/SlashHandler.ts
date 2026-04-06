import { CommandRegistry } from "./CommandRegistry.js";

export class SlashHandler {
  private registry: CommandRegistry;

  constructor(registry: CommandRegistry) {
    this.registry = registry;
  }

  handle(input: string): boolean {
    const trimmed = input.trim();

    if (!trimmed.startsWith("/")) {
      return false;
    }

    const { command, args } = this.parse(trimmed);
    const cmd = this.registry.get(command);

    if (!cmd) {
      return true;
    }

    cmd.execute(args).catch((err) => {
      console.error(`[error] Command error: ${err}`);
    });

    return true;
  }

  parse(input: string): { command: string; args: string[] } {
    const parts = input.slice(1).split(/\s+/);
    const command = parts[0] || "";
    const args = parts.slice(1);

    return { command, args };
  }

  execute(command: string, args: string[]): Promise<boolean> {
    const cmd = this.registry.get(command);
    if (!cmd) {
      return Promise.resolve(false);
    }
    return cmd.execute(args);
  }
}
