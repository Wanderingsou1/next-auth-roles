"use client";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

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
  // selected todo ids
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected =
    todos.length > 0 && selected.length === todos.length;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(todos.map((t) => t.id));
    } else {
      setSelected([]);
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  if (todos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No todos found.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Select all */}
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => toggleAll(Boolean(v))}
              />
            </TableHead>

            {/* Task ID */}
            <TableHead className="w-[120px]">
              Task
            </TableHead>

            {/* Title */}
            <TableHead>
              Title
            </TableHead>

            {/* Status */}
            <TableHead>
              Status
            </TableHead>

            {/* Priority */}
            <TableHead>
              Priority
            </TableHead>

            {/* Actions */}
            <TableHead className="w-10 text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              me={me}
              todo={todo}
              checked={selected.includes(todo.id)}
              onCheckedChange={(checked: boolean) =>
                toggleOne(todo.id, checked)
              }
              onChanged={onChanged}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
