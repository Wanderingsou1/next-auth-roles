"use client";

import TodoItem from "./TodoItem";
import type { Todo } from "./page";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  _id: string;
  role: Role;
};

export default function TodoList(
  { me, todos, onChanged }: { me: MeUser; todos: Todo[]; onChanged: () => void; }) 
  
{
  if (todos.length === 0) {
    return <p className="text-sm text-muted-foreground">No todos found.</p>;
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} me={me} todo={todo} onChanged={onChanged} />
      ))}
    </div>
  );
}
