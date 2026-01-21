"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import { set } from "mongoose";

type Role = "user" | "admin" | "superadmin";

type MeUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Todo = {
  id: string;
  task_key: string;
  user_id: string;
  name: string;
  description?: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
};

export default function TodosPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const [total, setTotal] = useState(0);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

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
    const params = new URLSearchParams();

    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (search.trim()) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);

    const res = await fetch(`/api/todos?${params.toString()}`, {
      credentials: "include",
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    setTodos(data.todos || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMe();
      await fetchTodos();
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, priorityFilter]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!me) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>

        <div className="flex items-center gap-2">
          {me.role === "user" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-black/90">
                  Add Todo
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Todo</DialogTitle>
                </DialogHeader>

                <TodoForm
                  onCreated={() => {
                    fetchTodos();
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>

      {/* Create Todo - only normal user */}
      {/* {me.role === "user" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Todo</CardTitle>
          </CardHeader>
          <CardContent>
            <TodoForm onCreated={fetchTodos} />
          </CardContent>
        </Card>
      )} */}

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
          <CardTitle>
            {me.role === "user" ? "My Todos" : "All User Todos (Read Only)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TodoList me={me} todos={todos} onChanged={fetchTodos} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(total / limit) + 1}
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
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
