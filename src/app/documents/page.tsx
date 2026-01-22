import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabaseServer";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const supabase = await supabaseServer();

  // 1. Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/dashboard");
  }

  // 3. Role guard
  if (profile.role === "admin") {
    redirect("/dashboard");
  }

  // 4. Render client UI
  return <DocumentsClient role={profile.role} />;
}
