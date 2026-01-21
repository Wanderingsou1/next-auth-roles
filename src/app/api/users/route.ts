import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Only admin and superadmin allowed
    if (me.role != "admin" && me.role != "superadmin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Fetch all users (profiles)
    // const { data: users, error: usersError } = await supabase
    //   .from("profiles")
    //   .select("id, name, email, role, created_at")
    //   .order("created_at", { ascending: false });

    // if (usersError || !users)
    //   return NextResponse.json(
    //     { message: usersError.message },
    //     { status: 500 },
    //   );

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%`
      );
    }

    const { data: users, count, error } = await query;

    if(error) return NextResponse.json({message: error.message}, {status: 500})


    return NextResponse.json({ users, page, limit, total: count }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
