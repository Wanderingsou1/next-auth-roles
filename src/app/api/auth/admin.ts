import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if(user.role !== "admin" && user.role !== "superadmin") {
      return NextResponse.json({message: "Forbidden"}, {status: 403});
    }

    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (usersError || !users) {
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({users}, {status: 200});
  } catch {
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}