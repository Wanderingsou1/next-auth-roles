"use client";

import type { Todo } from "./page";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

export default function ViewTodoDialog({
  open,
  onOpenChange,
  todo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: Todo;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              {todo.task_key}
            </span>
            {todo.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {todo.description && (
            <p className="text-sm text-muted-foreground">
              {todo.description}
            </p>
          )}

          <div className="flex gap-2">
            <Badge variant="outline">
              {todo.status.replace("_", " ")}
            </Badge>
            <Badge variant="secondary">
              {todo.priority}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Created:{" "}
              {new Date(todo.created_at).toLocaleString()}
            </p>
            <p>
              Updated:{" "}
              {new Date(todo.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}