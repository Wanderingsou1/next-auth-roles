"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

import { MoreHorizontal } from "lucide-react";
import { Document } from "./DocumentsClient";

type Role = "user" | "superadmin";

interface Props {
  document: Document;
  role: Role;
  onView: (doc: Document) => void;
  onViewAi: (doc: Document) => void;
  onDelete: (id: string) => void;
}

function getAiBadgeClasses(status?: string) {
  switch (status) {
    case "ready":
      return "bg-green-100 text-green-700";
    case "processing":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function DocumentItem({
  document,
  role,
  onView,
  onViewAi,
  onDelete,
}: Props) {
  const fileType =
    document.mime_type === "application/pdf"
      ? "PDF"
      : document.mime_type.includes("word")
        ? "DOCX"
        : "DOC";

  // AI Status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiStatus = (document as any).ai_status as
    | "pending"
    | "processing"
    | "ready"
    | "failed"
    | undefined;

  const canViewAiSummary =
    (role === "user" || role === "superadmin") && aiStatus === "ready";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summary = (document as any).summary as string | null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keywords = (document as any).keywords as string[] | null | undefined;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span>{document.original_name}</span>

            {/* AI Status Badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getAiBadgeClasses(
                aiStatus,
              )}`}
            >
              AI: {aiStatus ?? "pending"}
            </span>
          </div>

          {/* Summary */}
          {summary ? (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {summary}
            </p>
          ) : null}

          {/* Keywords */}
          {keywords && keywords.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 4).map((k) => (
                <span
                  key={k}
                  className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {k}
                </span>
              ))}

              {keywords.length > 4 ? (
                <span className="text-[10px] text-muted-foreground">
                  +{keywords.length - 4}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </TableCell>

      <TableCell>{fileType}</TableCell>

      <TableCell>{(document.size / 1024).toFixed(1)} KB</TableCell>

      <TableCell>{new Date(document.created_at).toLocaleString()}</TableCell>

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

            {canViewAiSummary && (
              <DropdownMenuItem onClick={() => onViewAi(document)}>
                View AI Summary
              </DropdownMenuItem>
            )}

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
