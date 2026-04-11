import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_DIR = join(__dirname, "../../../builtin_prompts");

export class MemPalaceLoader {
  static getMemPalacePrompt(): string {
    const promptPath = join(PROMPT_DIR, "memPalace.md");
    if (existsSync(promptPath)) {
      return readFileSync(promptPath, "utf-8");
    }
    return "";
  }

  static getJudgePrompt(category: "knowledge" | "insight" | "personality", content: string): string {
    const memPalace = this.getMemPalacePrompt();
    const categoryPrompts = {
      knowledge: `基于以下 MemPalace 系统的 Knowledge 分类标准，分析这篇学习笔记：

## 判断标准
- 用户是否真正理解这些知识？
- 概念是否准确？逻辑是否完整？
- 有无明显漏洞或错误？

## 内容
${content}

## 输出格式
直接输出一句客观评价，不要多余解释。`,
      insight: `基于以下 MemPalace 系统的 Insight 分类标准，分析这篇观点文章：

## 判断标准
- 用户对事物的认知是否客观全面？
- 是否辩证？证据是否充分？
- 有无偏见或误解？

## 内容
${content}

## 输出格式
直接输出一句客观评价，不要多余解释。`,
      personality: `基于以下 MemPalace 系统的 Personality 分类标准，分析这篇自我反思：

## 判断标准
- 用户自我认知是否清晰？
- 心态积极还是消极？
- 属于成长型还是固定型思维？

## 内容
${content}

## 输出格式
直接输出一句客观评价，不要多余解释。`,
    };

    return `${memPalace}\n\n${categoryPrompts[category]}`;
  }
}