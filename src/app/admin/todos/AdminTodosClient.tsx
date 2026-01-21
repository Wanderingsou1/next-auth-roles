"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TodoList from "@/app/todos/TodoList";
import type { Todo } from "@/app/todos/page";

type Role = "admin" | "user" | "superadmin";

type MeUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function AdminTodosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");

  const [me, setMe] = useState<MeUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const fetchMe = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });

    if (!res.ok) {
      router.push("/login");
      return null;
    }

    const data = await res.json();
    setMe(data.user);

    if (data.user.role !== "admin" && data.user.role !== "superadmin") {
      router.push("/dashboard");
    }

    return data.user as MeUser;
  };

  const fetchTodos = async () => {
    const params = new URLSearchParams();

    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (userId) params.set("userId", userId);
    if (search.trim()) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);

    const res = await fetch(`/api/todos?${params.toString()}`, {
      credentials: "include",
    });

    if (!res.ok) return;

    const data = await res.json();
    setTodos(data.todos || []);
    setTotal(data.total || 0);
  };

  // initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMe();
      setLoading(false);
    };

    init();
  }, []);

  // reset page when filters OR userId change
  useEffect(() => {
    (async () => {
      setPage(1);
    })();
  }, [search, statusFilter, priorityFilter, userId]);

   // useEffect(() => {
  //   (async () => {
  //     await fetchTodos();
  //   })();
  // }, [search, statusFilter, priorityFilter, userId]);

  // fetch when page OR filters OR userId change
  useEffect(() => {
    if (!me) return;
    (async () => {
      await fetchTodos();
    })();
  }, [page, search, statusFilter, priorityFilter, userId, me]);

  if (loading) return <p>Loading...</p>;
  if (!me) return null;

  const totalPages = Math.ceil(total / limit);

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

          <Button
            variant="outline"
            onClick={() => router.push("/admin/todos")}
          >
            Clear Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Search todos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Todos table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos List</CardTitle>
        </CardHeader>

        <CardContent>
          <TodoList me={me} todos={todos} onChanged={fetchTodos} />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages || 1}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



 