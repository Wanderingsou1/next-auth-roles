import { Suspense } from "react";
import AdminTodosClient from "./AdminTodosClient";

export default function AdminTodosPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <AdminTodosClient />
    </Suspense>
  );
}