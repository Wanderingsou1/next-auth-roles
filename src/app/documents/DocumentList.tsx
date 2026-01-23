"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Document } from "./DocumentsClient";
import DocumentItem from "./DocumentItem";

type Role = "user" | "superadmin";

interface Props {
  documents: Document[];
  role: Role;
  onView: (doc: Document) => void;
  onViewAi: (doc: Document) => void;
  onDelete: (id: string) => void;
}

export default function DocumentList({
  documents,
  role,
  onView,
  onViewAi,
  onDelete,
}: Props) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Uploaded At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {documents.map((doc) => (
          <DocumentItem
            key={doc.id}
            document={doc}
            role={role}
            onView={onView}
            onViewAi={onViewAi}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
