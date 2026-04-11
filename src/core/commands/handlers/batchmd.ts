import { Command } from "../CommandRegistry.js";
import { MemPalaceProcessor } from "../../../tools/md/MemPalaceProcessor.js";
import { output, error } from "../../../utils/logger.js";
import { existsSync } from "fs";

export function createBatchmdCommand(): Command {
  return {
    name: "batchmd",
    description: "Batch process markdown files into MemPalace (knowledge/insight/personality)",
    execute: async (args: string[]): Promise<boolean> => {
      if (args.length === 0) {
        output("Usage: /batchmd <directory> [-r]");
        output("  -r: recursive processing");
        output("");
        output("Files will be classified into ~/.catli/memPalace/:");
        output("  - knowledge/: Learning notes with subject");
        output("  - insight/: Opinions and views");
        output("  - personality/: Self-reflection");
        return true;
      }

      const inputDir = args[0];
      const recursive = args.includes("-r");

      if (!existsSync(inputDir)) {
        error(`Directory not found: ${inputDir}`);
        return true;
      }

      output(`Batch processing markdown files into MemPalace:`);
      output(`  Input: ${inputDir}`);
      output(`  Recursive: ${recursive}`);
      output("");

      const results = await MemPalaceProcessor.process({
        inputDir,
        recursive,
      });

      const success = results.filter((r) => !r.error).length;
      const failed = results.filter((r) => r.error).length;

      output(`\nProcessed: ${success} file(s), Failed: ${failed} file(s)`);
      return true;
    },
  };
}