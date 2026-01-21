"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "superadmin";
  password?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState<User[]>([]);

  // filters
  const [search, setSearch] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const fetchMe = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });

    if (!res.ok) {
      router.push("/login");
      return;
    }

    const data = await res.json();
    setUser(data.user);
    setName(data.user.name || "");
    setEmail(data.user.email || "");
    return data.user;
  };

  const fetchUsers = async () => {
    const params = new URLSearchParams();

    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) params.set("search", search);

    const res = await fetch("/api/users", { credentials: "include" });

    console.log("Fetch users response:", res);

    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const currentUser = await fetchMe();

      if (currentUser?.role === "admin" || currentUser?.role === "superadmin") {
        await fetchUsers();
      }

      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    (async () => {
      setPage(1);
    })();
  }, [search]);

  useEffect(() => {
    (async () => {
      await fetchUsers();
    })();
  }, [page, search]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleUpdateProfile = async () => {
    try {
      const body = { name, email, ...(password.trim() ? { password } : {}) };
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Profile updated successfully ✅");
      setPassword("");
      fetchMe();
    } catch {
      alert("Something went wrong");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    alert("User deleted successfully ✅");
    fetchUsers();
  };

  const handleChangeRole = async (id: string, role: "admin" | "user") => {
    const res = await fetch(`/api/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ role }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Role update failed");
      return;
    }

    alert("User role updated successfully ✅");
    fetchUsers();
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {user.role === "user" && (
            <Button variant="outline" onClick={() => router.push("/todos")}>
              Todos
            </Button>
          )}

          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if not changing"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user.role} disabled />
            </div>
          </div>

          <Button onClick={handleUpdateProfile}>Update Profile</Button>
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {(user.role === "admin" || user.role === "superadmin") && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel - Users</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {user.role === "superadmin" && (
                    <TableHead>Role Action</TableHead>
                  )}
                  <TableHead>Todos</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((u) => {
                  const canDelete =
                    user.role === "superadmin"
                      ? u.id !== user.id
                      : u.role === "user";

                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      {user.role === "superadmin" && (
                        <TableCell>
                          {u.role !== "superadmin" && u.id !== user.id ? (
                            <Select
                              value={u.role}
                              onValueChange={(value) =>
                                handleChangeRole(
                                  u.id,
                                  value as "user" | "admin",
                                )
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not Allowed
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {u.role === "user" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/todos?userId=${u.id}`)
                            }
                          >
                            View Todos
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            View Todos
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canDelete ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure you want to delete {u.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(total / limit) || 1}
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
