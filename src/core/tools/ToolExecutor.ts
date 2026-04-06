import { Tool, ToolCallRequest, ToolCallResponse } from "../../types/tool.js";
import { ToolRegistry } from "./ToolRegistry.js";

export class ToolExecutor {
  private registry: ToolRegistry;

  constructor(registry: ToolRegistry) {
    this.registry = registry;
  }

  async execute(toolCall: ToolCallRequest): Promise<ToolCallResponse> {
    const tool = this.registry.get(toolCall.name);

    if (!tool) {
      return {
        id: toolCall.id,
        result: { success: false, content: "", error: `Tool ${toolCall.name} not found` },
        error: `Tool ${toolCall.name} not found`,
      };
    }

    try {
      const result = await tool.execute(toolCall.arguments);
      return { id: toolCall.id, result };
    } catch (err) {
      const error = err as Error;
      return {
        id: toolCall.id,
        result: { success: false, content: "", error: error.message },
        error: error.message,
      };
    }
  }

  async executeAll(toolCalls: ToolCallRequest[]): Promise<ToolCallResponse[]> {
    return Promise.all(toolCalls.map((tc) => this.execute(tc)));
  }

  validateParameters(tool: Tool, params: Record<string, unknown>): { valid: boolean; error?: string } {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        return { valid: false, error: `Missing required parameter: ${param.name}` };
      }
    }
    return { valid: true };
  }
}
