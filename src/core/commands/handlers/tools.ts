import { Command } from "../CommandRegistry.js";
import { ToolRegistry } from "../../tools/ToolRegistry.js";
import { output } from "../../../utils/logger.js";

export function createToolsCommand(toolRegistry: ToolRegistry): Command {
  return {
    name: "tools",
    description: "List available tools",
    execute: async (): Promise<boolean> => {
      const tools = toolRegistry.list();
      if (tools.length === 0) {
        output("No tools available.");
        return true;
      }

      output("Available tools:");
      for (const tool of tools) {
        output(`  - ${tool.name}: ${tool.description}`);
      }

      return true;
    },
  };
}
