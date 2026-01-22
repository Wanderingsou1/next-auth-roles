"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { Document } from "./DocumentsClient";

interface Props {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewDocumentDialog({
  document,
  open,
  onOpenChange,
}: Props) {
  const isPdf = document.mime_type === "application/pdf";
  const isDocx =
    document.mime_type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isDoc = document.mime_type === "application/msword";

  // Storage public URL or signed URL endpoint
  // (recommended: create a GET /api/documents/:id/file later)
  const fileUrl = `/api/documents/${document.id}?file=1`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {document.original_name}
            <Badge variant="outline">
              {isPdf ? "PDF" : isDocx ? "DOCX" : "DOC"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Metadata */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Uploaded:</strong>{" "}
            {new Date(document.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Size:</strong> {(document.size / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* Preview */}
        <div className="mt-4 border rounded-md h-full overflow-auto bg-background">
          {/* PDF Preview */}
          {(isPdf || isDoc) && (
            <div className="h-full overflow-auto rounded-md border bg-muted p-4">
              {document.extracted_text ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {document.extracted_text}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No text could be extracted from this PDF.
                </p>
              )}
            </div>
          )}

          {/* DOCX Preview */}
          {isDocx && (
            <div
              className="prose prose-sm max-w-none p-4"
              dangerouslySetInnerHTML={{
                __html:
                  document.extracted_html || "<p>No preview available</p>",
              }}
            />
          )}

          {/* Fallback */}
          {!isPdf && !isDocx && (
            <div className="p-4 text-sm text-muted-foreground">
              Preview not available for this file type.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
