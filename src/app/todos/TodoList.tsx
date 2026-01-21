"use client";

import TodoItem from "./TodoItem";
import type { Todo } from "./page";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  id: string;
  role: Role;
};

export default function TodoList({
  me,
  todos,
  onChanged,
}: {
  me: MeUser;
  todos: Todo[];
  onChanged: () => void;
}) {
  if (todos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No todos found.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border rounded-md text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left font-medium">
              Task
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Name
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Status
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Priority
            </th>
            <th className="px-3 py-2 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              me={me}
              todo={todo}
              onChanged={onChanged}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
