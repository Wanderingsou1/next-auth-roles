"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TodoForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<"low" | "medium" | "high">("medium");

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Todo name is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          priority,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to create todo");
        return;
      }

      // reset form
      setName("");
      setDescription("");
      setPriority("medium");

      onCreated();
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label>Todo name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Eg. Implement filters for todos"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Extra details…"
        />
      </div>

      {/* Priority */}
      <div className="space-y-2 max-w-xs">
        <Label>Priority</Label>
        <Select
          value={priority}
          onValueChange={(v) =>
            setPriority(v as "low" | "medium" | "high")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Todo"}
      </Button>
    </div>
  );
}
