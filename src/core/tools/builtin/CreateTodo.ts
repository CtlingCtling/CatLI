import { Tool, ToolResult } from "../../../types/tool.js";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
}

const todos: Todo[] = [];

export const CreateTodoTool: Tool = {
  name: "create_todo",
  description: "Create a TODO item for tracking tasks",
  parameters: [
    {
      name: "title",
      description: "The title of the TODO",
      type: "string",
      required: true,
    },
    {
      name: "description",
      description: "Optional description of the TODO",
      type: "string",
      required: false,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const title = params.title as string;
      const description = params.description as string | undefined;

      if (!title) {
        return { success: false, content: "", error: "title is required" };
      }

      const todo: Todo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title,
        description,
        completed: false,
        createdAt: Date.now(),
      };

      todos.push(todo);

      return {
        success: true,
        content: `Created TODO: ${title}\nID: ${todo.id}\n${description ? `Description: ${description}` : ""}`,
      };
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
      if (todos.length === 0) {
        return { success: true, content: "No TODOs" };
      }

      const active = todos.filter((t) => !t.completed);
      const completed = todos.filter((t) => t.completed);

      let content = `Active TODOs (${active.length}):\n`;
      for (const todo of active) {
        content += `  - [ ] ${todo.title} ${todo.description ? `— ${todo.description}` : ""}\n`;
      }

      if (completed.length > 0) {
        content += `\nCompleted (${completed.length}):\n`;
        for (const todo of completed) {
          content += `  - [x] ${todo.title}\n`;
        }
      }

      return { success: true, content };
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
      name: "id",
      description: "The ID of the TODO to mark as completed",
      type: "string",
      required: true,
    },
  ],
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    try {
      const id = params.id as string;

      if (!id) {
        return { success: false, content: "", error: "id is required" };
      }

      const todo = todos.find((t) => t.id === id);
      if (!todo) {
        return { success: false, content: "", error: `TODO not found: ${id}` };
      }

      todo.completed = true;
      return { success: true, content: `Completed TODO: ${todo.title}` };
    } catch (err) {
      const error = err as Error;
      return { success: false, content: "", error: error.message };
    }
  },
};

export { todos };
