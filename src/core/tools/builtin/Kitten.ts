import { spawn } from "child_process";
import { Tool, ToolResult } from "../../../types/tool.js";

export const KittenTool: Tool = {
  name: "kitten",
  description: "Call an external AI to process text (single interaction, no context)",
  parameters: [
    {
      name: "prompt",
      description: "The prompt/instruction for the AI",
      type: "string",
      required: true,
    },
    {
      name: "input",
      description: "Optional input text to process",
      type: "string",
      required: false,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    return new Promise((resolve) => {
      const prompt = params.prompt as string;
      const input = params.input as string | undefined;

      const args = input ? [prompt, "--input", input] : [prompt];

      const child = spawn("npx", ["tsx", "src/kitten.ts", ...args], {
        cwd: process.cwd(),
        env: process.env,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true, content: stdout.trim() });
        } else {
          const errMsg = stderr.trim() || `Exit code: ${code}`;
          resolve({ success: false, content: "", error: `Sleepy kitty fall asleep. [${errMsg}]` });
        }
      });

      child.on("error", (err) => {
        resolve({ success: false, content: "", error: `Sleepy kitty fall asleep. [${err.message}]` });
      });
    });
  },
};
