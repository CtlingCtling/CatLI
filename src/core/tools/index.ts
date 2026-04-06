import { ToolRegistry } from "./ToolRegistry.js";
import { ToolExecutor } from "./ToolExecutor.js";
import { ReadFileTool } from "./builtin/ReadFile.js";
import { WriteFileTool } from "./builtin/WriteFile.js";
import { ReplaceTextTool } from "./builtin/ReplaceText.js";
import { RunBashTool } from "./builtin/RunBash.js";
import { QuestionTool } from "./builtin/Question.js";
import { CreateTodoTool, ListTodosTool, CompleteTodoTool, RemoveTodoTool } from "./builtin/CreateTodo.js";
import { KittenTool } from "./builtin/Kitten.js";
import { Tool } from "../../types/tool.js";

export function createToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  const builtinTools: Tool[] = [
    ReadFileTool,
    WriteFileTool,
    ReplaceTextTool,
    RunBashTool,
    QuestionTool,
    CreateTodoTool,
    ListTodosTool,
    CompleteTodoTool,
    RemoveTodoTool,
    KittenTool,
  ];

  for (const tool of builtinTools) {
    registry.register(tool);
  }

  return registry;
}

export { ToolRegistry, ToolExecutor };
