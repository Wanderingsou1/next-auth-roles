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

function getAiBadgeVariant(status?: string) {
  switch (status) {
    case "ready":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    case "pending":
    default:
      return "outline";
  }
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

  // AI fields (added later in DB, so safe-cast)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiStatus = (document as any).ai_status as
    | "pending"
    | "processing"
    | "ready"
    | "failed"
    | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summary = (document as any).summary as string | null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keywords = (document as any).keywords as string[] | null | undefined;

  // Storage public URL or signed URL endpoint
  // (recommended: create a GET /api/documents/:id/file later)
  const fileUrl = `/api/documents/${document.id}?file=1`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {document.original_name}

            <Badge variant="outline">
              {isPdf ? "PDF" : isDocx ? "DOCX" : "DOC"}
            </Badge>

            {/* AI Status */}
            <Badge variant={getAiBadgeVariant(aiStatus)}>
              AI: {aiStatus ?? "pending"}
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

        {/* AI Summary + Keywords */}
        {(summary || (keywords && keywords.length > 0) || aiStatus) && (
          <div className="mt-3 space-y-2">
            {summary ? (
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-medium">Summary</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {summary}
                </p>
              </div>
            ) : aiStatus === "processing" ? (
              <p className="text-sm text-muted-foreground">
                Generating summary...
              </p>
            ) : null}

            {keywords && keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((k) => (
                  <Badge key={k} variant="secondary">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}

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
