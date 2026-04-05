import { CommandRegistry } from "./CommandRegistry.js";
import {
  SlashHandler,
  createHelpCommand,
  createExitCommand,
  createToolsCommand,
} from "./SlashHandler.js";
import { createReverseCommand, createClearCommand } from "./handlers/reverse.js";
import { createConfigCommand } from "./handlers/config.js";
import { createKittenCommand } from "./handlers/kitten.js";
import { ToolRegistry } from "../tools/ToolRegistry.js";
import { SessionManager } from "../session/SessionManager.js";
import { ConfigManager } from "../../config/ConfigManager.js";

export function createCommandRegistry(
  toolRegistry: ToolRegistry,
  sessionManager: SessionManager,
  configManager: ConfigManager
): CommandRegistry {
  const registry = new CommandRegistry();

  registry.register(createHelpCommand(toolRegistry));
  registry.register(createClearCommand(sessionManager));
  registry.register(createReverseCommand(sessionManager));
  registry.register(createExitCommand());
  registry.register(createToolsCommand(toolRegistry));
  registry.register(createConfigCommand(configManager));
  registry.register(createKittenCommand());

  return registry;
}

export { CommandRegistry, SlashHandler };
