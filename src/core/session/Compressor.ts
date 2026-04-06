import { readFileSync } from "fs";
import { join } from "path";
import { Message, MessageRole } from "../../types/message.js";
import { DeepSeekClient } from "../api/DeepSeekClient.js";
import { countMessagesTokens } from "../../utils/tokenCounter.js";

export interface CompressionOptions {
  tokenThreshold: number;
  preserveRecentTokens: number;
  maxTokensPerChunk: number;
}

export class Compressor {
  private client?: DeepSeekClient;
  private options: CompressionOptions;

  constructor(client?: DeepSeekClient, options?: Partial<CompressionOptions>) {
    this.client = client;
    this.options = {
      tokenThreshold: options?.tokenThreshold || 6000,
      preserveRecentTokens: options?.preserveRecentTokens || 2000,
      maxTokensPerChunk: options?.maxTokensPerChunk || 1500,
    };
  }

  async compress(messages: Message[]): Promise<Message[]> {
    const systemMessages = messages.filter((m) => m.role === MessageRole.System);
    const nonSystemMessages = messages.filter((m) => m.role !== MessageRole.System);

    if (nonSystemMessages.length === 0) {
      return messages;
    }

    const totalTokens = countMessagesTokens(nonSystemMessages);

    if (totalTokens <= this.options.tokenThreshold) {
      return messages;
    }

    const recentMessages = this.preserveRecentMessages(nonSystemMessages);
    const olderMessages = nonSystemMessages.slice(0, -recentMessages.length);

    if (olderMessages.length === 0) {
      return [...systemMessages, ...recentMessages];
    }

    const compressedOlder = await this.compressChunks(olderMessages);

    return [...systemMessages, ...compressedOlder, ...recentMessages];
  }

  private preserveRecentMessages(messages: Message[]): Message[] {
    const result: Message[] = [];
    let tokenCount = 0;

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgTokens = countMessagesTokens([msg]);

      if (tokenCount + msgTokens > this.options.preserveRecentTokens && result.length > 0) {
        break;
      }

      result.unshift(msg);
      tokenCount += msgTokens;
    }

    return result;
  }

  private async compressChunks(messages: Message[]): Promise<Message[]> {
    const chunks = this.createTokenChunks(messages);
    const compressed: Message[] = [];

    for (const chunk of chunks) {
      const summary = await this.summarizeChunk(chunk);
      compressed.push(summary);
    }

    return compressed;
  }

  private createTokenChunks(messages: Message[]): Message[][] {
    const chunks: Message[][] = [];
    let currentChunk: Message[] = [];
    let currentTokens = 0;

    for (const msg of messages) {
      const msgTokens = countMessagesTokens([msg]);

      if (currentTokens + msgTokens > this.options.maxTokensPerChunk && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentTokens = 0;
      }

      currentChunk.push(msg);
      currentTokens += msgTokens;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private async summarizeChunk(chunk: Message[]): Promise<Message> {
    const conversationText = this.formatMessagesForSummary(chunk);
    const prompt = this.getSummaryPrompt(conversationText);

    try {
      if (!this.client) {
        return {
          id: `compressed-${Date.now()}-fallback`,
          role: MessageRole.System,
          content: `[Previous conversation - ${chunk.length} messages collapsed, no AI available]`,
          timestamp: Date.now(),
        };
      }

      const summaryText = await this.client.generateContent([
        {
          id: `summary-${Date.now()}`,
          role: MessageRole.User,
          content: prompt,
          timestamp: Date.now(),
        },
      ]);

      return {
        id: `compressed-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        role: MessageRole.System,
        content: `[Previous conversation summary]\n${summaryText.trim()}`,
        timestamp: Date.now(),
      };
    } catch {
      return {
        id: `compressed-${Date.now()}-fallback`,
        role: MessageRole.System,
        content: `[Previous conversation - ${chunk.length} messages collapsed]`,
        timestamp: Date.now(),
      };
    }
  }

  private formatMessagesForSummary(messages: Message[]): string {
    return messages
      .map((m) => {
        const role = m.role === MessageRole.System ? "System" : m.role === MessageRole.User ? "User" : "Assistant";
        return `${role}: ${m.content}`;
      })
      .join("\n");
  }

  private getSummaryPrompt(conversation: string): string {
    const templatePath = join(process.cwd(), "builtin_prompts", "message_summary.md");
    let template = "";

    try {
      template = readFileSync(templatePath, "utf-8");
    } catch {
      template = "Please summarize the following conversation concisely:\n\n{{conversation}}\n\nSummary:";
    }

    return template.replace("{{conversation}}", conversation);
  }
}
