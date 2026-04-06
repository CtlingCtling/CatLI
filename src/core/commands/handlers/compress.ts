import { Command } from "../CommandRegistry.js";
import { SessionManager } from "../../session/SessionManager.js";
import { output } from "../../../utils/logger.js";
import { countMessagesTokens } from "../../../utils/tokenCounter.js";

export function createCompressCommand(sessionManager: SessionManager): Command {
  return {
    name: "compress",
    description: "Manually compress conversation history",
    execute: async (_args: string[]): Promise<boolean> => {
      const session = sessionManager.getCurrentSession();
      if (!session || session.messages.length === 0) {
        output("No conversation to compress.");
        return true;
      }

      const beforeCount = session.messages.length;
      const beforeTokens = countMessagesTokens(session.messages);

      await sessionManager.compress();

      const afterCount = session.messages.length;
      const afterTokens = countMessagesTokens(session.messages);

      output(`Compressed: ${beforeCount} → ${afterCount} messages, ~${beforeTokens} → ~${afterTokens} tokens`);
      return true;
    },
  };
}
