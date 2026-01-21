"use client";

import { useState } from "react";
import type { Todo } from "./page";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  id: string;
  role: Role;
};

export default function TodoItem({
  me,
  todo,
  onChanged,
}: {
  me: MeUser;
  todo: Todo;
  onChanged: () => void;
}) {
  const [updating, setUpdating] = useState(false);

  const isOwner = me.id === todo.user_id;

  const canEdit =
    me.role === "user" && isOwner;

  const canDelete =
    (me.role === "user" && isOwner) ||
    me.role === "superadmin";

  const updateTodo = async (updates: Partial<Todo>) => {
    try {
      setUpdating(true);

      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!res.ok) return;

      onChanged();
    } finally {
      setUpdating(false);
    }
  };

  const deleteTodo = async () => {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      onChanged();
    }
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      {/* Task Key */}
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
        {todo.task_key}
      </td>

      {/* Name */}
      <td className="px-3 py-2">
        {todo.name}
      </td>

      {/* Status */}
      <td className="px-3 py-2">
        <Select
          value={todo.status}
          onValueChange={(v) =>
            updateTodo({ status: v as Todo["status"] })
          }
          disabled={!canEdit || updating}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Priority */}
      <td className="px-3 py-2">
        <Select
          value={todo.priority}
          onValueChange={(v) =>
            updateTodo({ priority: v as Todo["priority"] })
          }
          disabled={!canEdit || updating}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Actions */}
      <td className="px-3 py-2 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
            >
              ⋯
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {canDelete ? (
              <DropdownMenuItem
                className="text-destructive"
                onClick={deleteTodo}
              >
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>
                Read only
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
