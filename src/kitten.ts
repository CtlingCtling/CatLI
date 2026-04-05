import OpenAI from "openai";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface KittenConfig {
  baseURL?: string;
  apiKey?: string;
  model?: string;
}

function loadConfig(): KittenConfig {
  const configPath = join(homedir(), ".catli.json");
  try {
    if (existsSync(configPath)) {
      const data = readFileSync(configPath, "utf-8");
      const config = JSON.parse(data);
      return {
        baseURL: config.kittenBaseURL,
        apiKey: config.kittenApiKey || config.apiKey,
        model: config.kittenModel,
      };
    }
  } catch {}
  return {};
}

function getConfig(): KittenConfig {
  const config = loadConfig();
  return {
    baseURL: process.env.KITTEN_BASE_URL || config.baseURL || "https://api.deepseek.com",
    apiKey: process.env.KITTEN_API_KEY || config.apiKey || "",
    model: process.env.KITTEN_MODEL || config.model || "deepseek-chat",
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: kitten <prompt>  or  echo <text> | kitten <prompt>");
    process.exit(1);
  }

  const prompt = args.join(" ");
  let input = "";

  if (!process.stdin.isTTY) {
    input = readFileSync("/dev/stdin", "utf-8").trim();
  }

  const fullPrompt = input ? `${prompt}\n\nInput:\n${input}` : prompt;

  const config = getConfig();

  if (!config.apiKey) {
    console.error("Error: No API key found. Set KITTEN_API_KEY or configure in ~/.catli.json");
    process.exit(1);
  }

  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  try {
    const response = await client.chat.completions.create({
      model: config.model || "deepseek-chat",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log(content);
  } catch (err) {
    const error = err as Error;
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
