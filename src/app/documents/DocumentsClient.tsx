"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import DocumentList from "./DocumentList";
import UploadDocumentDialog from "./UploadDocumentDialog";
import ViewDocumentDialog from "./ViewDocumentDialog";
import ViewAiSummaryDialog from "./ViewAiSummaryDialog";

type Role = "user" | "superadmin";

export interface Document {
  id: string;
  user_id: string;
  original_name: string;
  file_name: string;
  mime_type: string;
  size: number;
  bucket: string;
  storage_path: string;
  extracted_text: string;
  extracted_html: string;

  summary?: string | null;
  keywords?: string[] | null;
  ai_status?: "pending" | "processing" | "ready" | "failed";

  created_at: string;
}

interface Props {
  role: Role;
}

export default function DocumentsClient({ role }: Props) {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [viewAiDoc, setViewAiDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);

    const res = await fetch("/api/documents", {
      credentials: "include",
    });

    if (!res.ok) {
      setLoading(false);
      return;
    }

    const data = await res.json();
    setDocuments(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => await fetchDocuments())();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    alert("Document deleted ✅");
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-background p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>

        <div className="flex gap-2">
          {role === "user" && (
            <Button onClick={() => setUploadOpen(true)}>Upload Document</Button>
          )}

          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <DocumentList
              documents={documents}
              role={role}
              onView={setViewDoc}
              onViewAi={setViewAiDoc} 
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {role === "user" && (
        <UploadDocumentDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploaded={fetchDocuments}
        />
      )}

      {/* View Dialog */}
      {viewDoc && (
        <ViewDocumentDialog
          document={viewDoc}
          open={!!viewDoc}
          onOpenChange={() => setViewDoc(null)}
        />
      )}

      {/* View AI Summary Dialog */}
      {viewAiDoc && (
        <ViewAiSummaryDialog
          document={viewAiDoc}
          open={!!viewAiDoc}
          onOpenChange={() => setViewAiDoc(null)}
        />
      )}
    </div>
  );
}
