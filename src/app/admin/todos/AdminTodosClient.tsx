"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import TodoList from "@/app/todos/TodoList";
import type { Todo } from "@/app/todos/page";

type Role = "admin" | "user" | "superadmin";

type MeUser = {
  _id: string,
  name: string,
  email: string,
  role: Role,
};

export default function AdminTodosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");

  const [me, setMe] = useState<MeUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });

    if(!res.ok) {
      router.push("/login");
      return null;
    }

    const data = await res.json();
    setMe(data.user);

    // Only admin and superadmin can access this page
    if(data.user.role !== "admin" && data.user.role !== "superadmin") {
      router.push("/dashboard");
    }

    return data.user as MeUser; 
  };

  const fetchTodos = async () => {
    const res = await fetch(`/api/todos?userId=${userId}`, { credentials: "include" });

    if(!res.ok) {
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

  const filteredTodos = useMemo(() => {
    if(!userId) return todos;
    return todos.filter((t) => t.userId === userId);  
  }, [todos, userId]);

  if(loading) return <p>Loading...</p>;
  if(!me) return null;


  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {userId ? "User Todos" : "All Todos"}
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>

          <Button variant="outline" onClick={() => router.push("/admin/todos")}>
            Clear Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos List</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Reusing same TodoList UI */}
          <TodoList me={me} todos={filteredTodos} onChanged={fetchTodos} />
        </CardContent>
      </Card>
    </div>
  );
}