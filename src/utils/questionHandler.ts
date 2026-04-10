export interface QuestionOption {
  label: string;
  value: string;
}

import * as readline from "readline";

export interface QuestionResult {
  selected: string;
  isCustom: boolean;
}

const CUSTOM_OPTION = "Enter your own answer.";

let isActive = false;

export async function askQuestion(
  question: string,
  options: QuestionOption[]
): Promise<QuestionResult> {
  if (isActive) {
    return { selected: "", isCustom: false };
  }

  const allOptions: Array<{ label: string; value: string }> = [
    ...options,
    { label: CUSTOM_OPTION, value: "__custom__" },
  ];
  let selectedIndex = 0;
  isActive = true;

  const clearScreen = (): void => {
    process.stdout.write("\x1b[2J");
    process.stdout.write("\x1b[H");
  };

  const cleanup = (): void => {
    if (process.stdin.isTTY) {
      (process.stdin as any).setRawMode?.(false);
    }
    isActive = false;
    clearScreen();
    process.stdout.write("\n");
  };

  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      (process.stdin as any).setRawMode?.(true);
    }

    const render = (): void => {
      let display = `${question}\n`;
      for (let i = 0; i < allOptions.length; i++) {
        const marker = i === selectedIndex ? ">" : " ";
        const check = i === selectedIndex ? "[*]" : "[ ]";
        display += `${marker}${check} ${allOptions[i].label}\n`;
      }
      display += "\nUse arrow keys to select, Enter to confirm\n";

      clearScreen();
      process.stdout.write(display);
    };

    clearScreen();
    render();

    const keyHandler = (_str: string, key: any): void => {
      if (key.name === "up") {
        selectedIndex = (selectedIndex - 1 + allOptions.length) % allOptions.length;
        render();
      } else if (key.name === "down") {
        selectedIndex = (selectedIndex + 1) % allOptions.length;
        render();
      } else if (key.name === "return") {
        process.stdin.removeListener("keypress", keyHandler);
        cleanup();
        if (allOptions[selectedIndex].value === "__custom__") {
          promptCustomInput(resolve);
        } else {
          resolve({
            selected: allOptions[selectedIndex].value,
            isCustom: false,
          });
        }
      }
    };

    process.stdin.on("keypress", keyHandler);
  });
}

function promptCustomInput(resolve: (result: QuestionResult) => void): void {
  process.stdout.write("Please enter your answer: ");

  let input = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const dataHandler = (chunk: string): void => {
    input += chunk;
    if (input.includes("\n")) {
      process.stdin.removeListener("data", dataHandler);
      process.stdin.pause();
      const answer = input.replace(/\n$/, "").trim();
      resolve({
        selected: answer,
        isCustom: true,
      });
    }
  };

  process.stdin.on("data", dataHandler);
}

export async function askQuestionInteractive(
  question: string,
  options?: Array<{ label: string; value: string }>
): Promise<{ selected: string }> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (options && options.length > 0) {
      let display = `${question}\n`;
      for (let i = 0; i < options.length; i++) {
        display += `  ${i + 1}. ${options[i].label}\n`;
      }
      display += "\nEnter your choice (number): ";

      rl.question(display, (answer) => {
        const num = parseInt(answer.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= options.length) {
          resolve({ selected: options[num - 1].value });
        } else {
          resolve({ selected: answer.trim() });
        }
        rl.close();
      });
    } else {
      rl.question(`${question}\n> `, (answer) => {
        resolve({ selected: answer.trim() });
        rl.close();
      });
    }
  });
}
