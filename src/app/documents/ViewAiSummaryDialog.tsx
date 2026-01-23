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

export default function ViewAiSummaryDialog({
  document,
  open,
  onOpenChange,
}: Props) {
  const aiStatus = document.ai_status ?? "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            AI Summary
            <Badge variant="outline">{aiStatus}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Document</p>
            <p className="text-sm text-muted-foreground">
              {document.original_name}
            </p>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium">Summary</p>

            {document.summary ? (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                {document.summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {aiStatus === "processing"
                  ? "Generating summary..."
                  : "Summary not available yet."}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium">Keywords</p>

            {document.keywords && document.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {document.keywords.map((k) => (
                  <Badge key={k} variant="secondary">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                No keywords available.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
