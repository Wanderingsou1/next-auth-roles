"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

export type Todo = {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
};

export default function TodosPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });

    if (!res.ok) {
      router.push("/login");
      return null;
    }

    const data = await res.json();
    setMe(data.user);
    return data.user as MeUser;
  };

  const fetchTodos = async () => {
    const res = await fetch("/api/todos", { credentials: "include" });

    if (!res.ok) {
      alert("Failed to fetch todos");
      return;
    }

    const data = await res.json();
    setTodos(data.todos || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMe();
      await fetchTodos();
      setLoading(false);
    };

    init();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!me) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>

      {/* Create Todo - Only user */}
      {me.role === "user" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Todo</CardTitle>
          </CardHeader>

          <CardContent>
            <TodoForm onCreated={fetchTodos} />
          </CardContent>
        </Card>
      )}

      {/* Todos List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {me.role === "user" ? "My Todos" : "All User Todos (Read Only)"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <TodoList me={me} todos={todos} onChanged={fetchTodos} />
        </CardContent>
      </Card>
    </div>
  );
}
