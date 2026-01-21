import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();

    // 1. Get logged in user
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 2. Get role of logged in user
    const { data: me, error: meError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (meError || !me)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Only admin and superadmin allowed
    if (me.role != "admin" && me.role != "superadmin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Fetch all users (profiles)
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (usersError || !users)
      return NextResponse.json(
        { message: usersError.message },
        { status: 500 },
      );

    return NextResponse.json({ users }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
