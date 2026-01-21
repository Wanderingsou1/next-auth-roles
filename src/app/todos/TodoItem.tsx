"use client";

import { useState } from "react";
import type { Todo } from "./page";
import { useRouter } from "next/navigation";
import EditTodoDialog from "./EditTodoDialog";
import ViewTodoDialog from "./ViewTodoDialog";

import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MoreHorizontal } from "lucide-react";
import TodoForm from "./TodoForm";
import { set } from "mongoose";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  id: string;
  role: Role;
};

export default function TodoItem({
  me,
  todo,
  checked,
  onCheckedChange,
  onChanged,
}: {
  me: MeUser;
  todo: Todo;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onChanged: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const isOwner = me.id === todo.user_id;

  const canEdit = me.role === "user" && isOwner;
  const canDelete = (me.role === "user" && isOwner) || me.role === "superadmin";

  const router = useRouter();

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
    <>
      <TableRow className={`hover:bg-muted/50 ${checked ? "bg-muted/60" : ""}`}
        onClick={() => setViewOpen(true)}>
        {/* Checkbox */}
        <TableCell>
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => onCheckedChange(Boolean(v))}
          />
        </TableCell>

        {/* Task ID */}
        <TableCell
          className="font-mono text-xs text-muted-foreground"
          // onClick={() => setViewOpen(true)}
        >
          {todo.task_key}
        </TableCell>

        {/* Title */}
        <TableCell className="font-medium">
          {todo.name}
        </TableCell>

        {/* Status */}
        <TableCell>
          <Badge variant="outline">{todo.status.replace("_", " ")}</Badge>
        </TableCell>

        {/* Priority */}
        <TableCell>
          <Badge variant="secondary">{todo.priority}</Badge>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                View
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Edit
                </DropdownMenuItem>
              )}

              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={deleteTodo}
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Edit dialog */}
      {canEdit && (
        <EditTodoDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          todo={todo}
          onSuccess={onChanged}
        />
      )}

      <ViewTodoDialog open={viewOpen} onOpenChange={setViewOpen} todo={todo} />
    </>
  );
}
