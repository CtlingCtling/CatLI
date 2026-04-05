import { readFileSync, writeFileSync } from "fs";
import { Tool, ToolResult } from "../../../types/tool.js";

export const ReplaceTextTool: Tool = {
  name: "replace_text",
  description: "Replace text in a file",
  parameters: [
    {
      name: "filePath",
      description: "The path to the file",
      type: "string",
      required: true,
    },
    {
      name: "oldText",
      description: "The text to find and replace",
      type: "string",
      required: true,
    },
    {
      name: "newText",
      description: "The replacement text",
      type: "string",
      required: true,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const filePath = params.filePath as string;
      const oldText = params.oldText as string;
      const newText = params.newText as string;

      if (!filePath) {
        return { success: false, content: "", error: "filePath is required" };
      }
      if (!oldText) {
        return { success: false, content: "", error: "oldText is required" };
      }
      if (!newText) {
        return { success: false, content: "", error: "newText is required" };
      }

      const content = readFileSync(filePath, "utf-8");

      if (!content.includes(oldText)) {
        return { success: false, content: "", error: `Text not found: ${oldText}` };
      }

      const newContent = content.replace(oldText, newText);
      writeFileSync(filePath, newContent, "utf-8");
      return { success: true, content: `Replaced text in: ${filePath}` };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};
