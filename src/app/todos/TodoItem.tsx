"use client";

import { useState } from "react";

import type { Todo } from "./page";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue}
 from "@/components/ui/select";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  _id: string;
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

  const isOwner = me._id === todo.userId;
  const canEdit = me.role === "user" && isOwner;
  const canDelete =
    (me.role === "user" && isOwner) || me.role === "superadmin";

  const updateTodo = async (updates: Partial<Todo>) => {
    try {
      setUpdating(true);

      const res = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      onChanged();
    } catch {
      alert("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const deleteTodo = async () => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      onChanged();
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{todo.name}</h3>
            {todo.description ? (
              <p className="text-sm text-muted-foreground">{todo.description}</p>
            ) : null}
          </div>

          <Badge variant="secondary">{todo.priority}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Select
              value={todo.status}
              onValueChange={(v: string) => updateTodo({ status: v as 'pending' | 'in_progress' | 'done' })}
              disabled={!canEdit || updating}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={todo.priority}
              onValueChange={(v: string) => updateTodo({ priority: v as 'low' | 'medium' | 'high' })}
              disabled={!canEdit || updating}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canDelete ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this todo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteTodo}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="secondary" size="sm" disabled>
              Read Only
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Created: {new Date(todo.createdAt).toLocaleString()} | Updated:{" "}
          {new Date(todo.updatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
