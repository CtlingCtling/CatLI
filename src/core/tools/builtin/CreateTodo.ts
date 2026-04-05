import { Tool, ToolResult } from "../../../types/tool.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface TodoStore {
  [title: string]: boolean;
}

class TodoManager {
  private static instance: TodoManager;
  private filePath: string;
  private todos: TodoStore = {};

  constructor() {
    this.filePath = join(homedir(), ".catli", "todos.json");
    this.load();
  }

  static getInstance(): TodoManager {
    if (!TodoManager.instance) {
      TodoManager.instance = new TodoManager();
    }
    return TodoManager.instance;
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const data = readFileSync(this.filePath, "utf-8");
        this.todos = JSON.parse(data);
      }
    } catch {
      this.todos = {};
    }
  }

  private save(): void {
    const dir = this.filePath.substring(0, this.filePath.lastIndexOf("/"));
    if (!existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.filePath, JSON.stringify(this.todos, null, 2));
  }

  create(title: string): boolean {
    if (title in this.todos) {
      return false;
    }
    this.todos[title] = false;
    this.save();
    return true;
  }

  complete(title: string): boolean {
    if (!(title in this.todos)) {
      return false;
    }
    this.todos[title] = true;
    this.save();
    return true;
  }

  list(): TodoStore {
    return { ...this.todos };
  }

  remove(title: string): boolean {
    if (!(title in this.todos)) {
      return false;
    }
    delete this.todos[title];
    this.save();
    return true;
  }
}

export const CreateTodoTool: Tool = {
  name: "create_todo",
  description: "Create a TODO item",
  parameters: [
    {
      name: "title",
      description: "The title of the TODO",
      type: "string",
      required: true,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const title = params.title as string;

      if (!title) {
        return { success: false, content: "", error: "title is required" };
      }

      const manager = TodoManager.getInstance();
      const success = manager.create(title);

      if (!success) {
        return { success: false, content: "", error: `TODO already exists: ${title}` };
      }

      return { success: true, content: `Created TODO: ${title}` };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};

export const CompleteTodoTool: Tool = {
  name: "complete_todo",
  description: "Mark a TODO as completed",
  parameters: [
    {
      name: "title",
      description: "The title of the TODO to mark as completed",
      type: "string",
      required: true,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const title = params.title as string;

      if (!title) {
        return { success: false, content: "", error: "title is required" };
      }

      const manager = TodoManager.getInstance();
      const success = manager.complete(title);

      if (!success) {
        return { success: false, content: "", error: `TODO not found: ${title}` };
      }

      return { success: true, content: `Completed TODO: ${title}` };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};

export const ListTodosTool: Tool = {
  name: "list_todos",
  description: "List all TODO items",
  parameters: [],
  execute: async (): Promise<ToolResult> => {
    try {
      const manager = TodoManager.getInstance();
      const todos = manager.list();
      const keys = Object.keys(todos);

      if (keys.length === 0) {
        return { success: true, content: "No TODOs" };
      }

      let content = "";
      for (const [title, completed] of Object.entries(todos)) {
        const marker = completed ? "[x]" : "[ ]";
        content += `${marker} ${title}\n`;
      }

      return { success: true, content: content.trim() };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};

export const RemoveTodoTool: Tool = {
  name: "remove_todo",
  description: "Remove a TODO item",
  parameters: [
    {
      name: "title",
      description: "The title of the TODO to remove",
      type: "string",
      required: true,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const title = params.title as string;

      if (!title) {
        return { success: false, content: "", error: "title is required" };
      }

      const manager = TodoManager.getInstance();
      const success = manager.remove(title);

      if (!success) {
        return { success: false, content: "", error: `TODO not found: ${title}` };
      }

      return { success: true, content: `Removed TODO: ${title}` };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};
