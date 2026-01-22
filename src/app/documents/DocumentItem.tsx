"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import { MoreHorizontal } from "lucide-react";
import { Document } from "./DocumentsClient";

type Role = "user" | "superadmin";

interface Props {
  document: Document;
  role: Role;
  onView: (doc: Document) => void;
  onDelete: (id: string) => void;
}

export default function DocumentItem({
  document,
  role,
  onView,
  onDelete,
}: Props) {
  const fileType =
    document.mime_type === "application/pdf"
      ? "PDF"
      : document.mime_type.includes("word")
      ? "DOCX"
      : "DOC";

  return (
    <TableRow>
      <TableCell className="font-medium">
        {document.original_name}
      </TableCell>

      <TableCell>{fileType}</TableCell>

      <TableCell>
        {(document.size / 1024).toFixed(1)} KB
      </TableCell>

      <TableCell>
        {new Date(document.created_at).toLocaleString()}
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(document)}>
              View
            </DropdownMenuItem>

            {(role === "user" || role === "superadmin") && (
              <DropdownMenuItem
                onClick={() => onDelete(document.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
