import * as readline from "readline";
import { output } from "./logger.js";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionResult {
  selected: string;
  isCustom: boolean;
}

const CUSTOM_OPTION = "Enter your own answer.";

export async function askQuestion(
  question: string,
  options: QuestionOption[]
): Promise<QuestionResult> {
  const allOptions = [...options, { label: CUSTOM_OPTION, value: "__custom__" }];
  let selectedIndex = 0;

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    function render() {
      readline.cursorTo(process.stdout, 0);
      readline.moveCursor(process.stdout, 0, -allOptions.length);
      readline.clearScreenDown(process.stdout);

      output(question);
      output("");
      allOptions.forEach((opt, i) => {
        const marker = i === selectedIndex ? ">" : " ";
        const check = i === selectedIndex ? "[*]" : "[ ]";
        output(`${marker}${check} ${opt.label}`);
      });
      output("");
      output("↑↓ navigate, Enter confirm");
    }

    function cleanup() {
      readline.cursorTo(process.stdout, 0);
      readline.moveCursor(process.stdout, 0, allOptions.length - selectedIndex + 2);
      rl.close();
    }

    render();

    rl.on("keypress", (_str, key) => {
      if (key.name === "up") {
        selectedIndex = (selectedIndex - 1 + allOptions.length) % allOptions.length;
        render();
      } else if (key.name === "down") {
        selectedIndex = (selectedIndex + 1) % allOptions.length;
        render();
      } else if (key.name === "return") {
        cleanup();
        if (allOptions[selectedIndex].value === "__custom__") {
          promptCustomInput(rl, resolve);
        } else {
          resolve({
            selected: allOptions[selectedIndex].value,
            isCustom: false,
          });
        }
      }
    });
  });
}

function promptCustomInput(
  _rl: readline.Interface,
  resolve: (result: QuestionResult) => void
): void {
  output("");
  output("Please enter your answer:");

  const innerRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  innerRl.question("", (answer) => {
    innerRl.close();
    resolve({
      selected: answer.trim(),
      isCustom: true,
    });
  });
}
