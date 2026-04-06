import { Command } from "../CommandRegistry.js";
import { SessionManager } from "../../session/SessionManager.js";
import { output } from "../../../utils/logger.js";
import { countMessagesTokens } from "../../../utils/tokenCounter.js";

export function createTokenCommand(sessionManager: SessionManager): Command {
  return {
    name: "token",
    description: "Show current token count",
    execute: async (): Promise<boolean> => {
      const session = sessionManager.getCurrentSession();
      if (!session || session.messages.length === 0) {
        output("No conversation yet.");
        return true;
      }

      const tokens = countMessagesTokens(session.messages);
      output(`Current conversation: ${session.messages.length} messages, ~${tokens} tokens`);
      return true;
    },
  };
}
