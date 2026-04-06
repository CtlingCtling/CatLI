import tiktoken, { Tiktoken } from "tiktoken";

const DEFAULT_ENCODING = "o200k_base";

let encoder: Tiktoken | null = null;

function getEncoder(): Tiktoken {
  if (!encoder) {
    encoder = tiktoken.get_encoding(DEFAULT_ENCODING);
  }
  return encoder;
}

export function countTokens(text: string): number {
  const enc = getEncoder();
  return enc.encode(text).length;
}

export function countMessagesTokens(messages: Array<{ role: string; content: string }>): number {
  const enc = getEncoder();
  let total = 0;

  for (const msg of messages) {
    const roleText = `<｜${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}｜>`;
    total += enc.encode(roleText).length;
    total += enc.encode(msg.content).length;
  }

  return total;
}
