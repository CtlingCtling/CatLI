import { Command } from "../CommandRegistry.js";
import { output } from "../../../utils/logger.js";

export function createExitCommand(): Command {
  return {
    name: "exit",
    description: "Exit the CLI",
    execute: async (): Promise<boolean> => {
      output("👋Goodbye!");
      setTimeout(() => process.exit(0), 100);
      return true;
    },
  };
}
