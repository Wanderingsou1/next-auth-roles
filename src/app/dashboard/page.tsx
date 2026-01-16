"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  password?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null> (null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState<User[]>([]);

  const fetchMe = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include"});
    
    if(!res.ok) {
      router.push("/login");
      return;
    }

    const data = await res.json();
    setUser(data.user);
    setName(data.user.name || "");
    setEmail(data.user.email || "");
    return data.user;
  }


  const fetchUsers = async () => {
    const res = await fetch("/api/users");

    console.log("Fetch users response:", res);

    if(res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    } 
  };

  // useEffect(() => {
  //   const init = async () => {
  //     setLoading(true);
  //     await fetchMe();
  //     setLoading(false);
  //   };
  //   init();
  // }, []);
  
  // useEffect(() => {
  //   if(user?.role === "admin") {
  //     fetchUsers();
  //   }
  // }, [user]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const currentUser = await fetchMe();

      if(currentUser?.role === "admin") {
        await fetchUsers();
      }

      setLoading(false);
    }
    init();
  }, []);


  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST"});
    router.push("/login");
  }

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json"},
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json();

      console.log(data);

      if(!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Profile updated successfully ✅");
      setPassword("");
      fetchMe();
    } catch {
      alert("Something went wrong");
    }
  }

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {method: "DELETE"});
    const data = await res.json();

    if(!res.ok) { 
      alert(data.message || "Delete failed");
      return;
    }

    alert("User deleted successfully ✅");
    fetchUsers();
  }


  if(loading) return <p className="p-6">Loading...</p>;
  if(!user) return null;




  return (
  <div className="min-h-screen bg-background p-8 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Button variant="destructive" onClick={handleLogout}>Logout</Button>
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
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank if not changing" />
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
    {user.role === "admin" && (
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete {u.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(u._id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}
  </div>



);
}
