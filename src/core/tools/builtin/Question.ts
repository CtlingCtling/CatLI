import { Tool, ToolResult } from "../../../types/tool.js";
import { output } from "../../../utils/logger.js";
import { askQuestion, QuestionOption } from "../../../utils/questionHandler.js";

export interface QuestionParams {
  question: string;
  options?: Array<{ label: string; value: string }>;
}

export const QuestionTool: Tool = {
  name: "question",
  description: "Ask a question to the user with selectable options",
  parameters: [
    {
      name: "question",
      description: "The question to ask the user",
      type: "string",
      required: true,
    },
    {
      name: "options",
      description: "Array of options to present to the user",
      type: "array",
      required: false,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const question = (params.question as string) || "";
      let options = (params.options as Array<{ label: string; value: string }>) || [];

      if (!question) {
        return { success: false, content: "", error: "question is required" };
      }

      if (options.length === 0) {
        output(`[Question] ${question}`);
        output("(No options provided, waiting for user input...)");
        return {
          success: true,
          content: "Question asked. User will respond in the next input.",
        };
      }

      if (typeof options[0] === "string") {
        options = (options as unknown as string[]).map((opt) => ({
          label: opt,
          value: opt,
        }));
      }

      const questionOptions: QuestionOption[] = options.map((opt) => ({
        label: opt.label || opt.value || "",
        value: opt.value || opt.label || "",
      }));

      const result = await askQuestion(question, questionOptions);

      return {
        success: true,
        content: result.isCustom
          ? `User selected custom input: ${result.selected}`
          : `User selected: ${result.selected}`,
      };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};
