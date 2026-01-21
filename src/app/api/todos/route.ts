import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Create a new todo
export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();

    // Get logged in user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (userError || !user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (user.role !== "user") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, description, status, priority } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Todo name is required" },
        { status: 400 },
      );
    }

    const taskKey = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert Todo
    const { data: todo, error: insertError } = await supabase
      .from("todos")
      .insert([
        {
          user_id: user.id,
          task_key: taskKey,
          name,
          description: description || null,
          status: status || "pending",
          priority: priority || "medium",
          updated_at: new Date(),
        },
      ])
      .select("*")
      .single();

    if (insertError)
      return NextResponse.json(
        { message: insertError.message },
        { status: 500 },
      );

    return NextResponse.json(
      { message: "Todo created successfully", todo },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}





// Get all todos for the authenticated user
export async function GET(req: Request) {
  try {
    const supabase = await supabaseServer();

    // Get logged in user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (userError || !user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const userIdFilter = searchParams.get("userId");

    // pagination
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;




    // filter
    let query = supabase
    .from("todos")
    .select("*")
    .order("updated_at", { ascending: false })
    .range(from, to);

    if (user.role === "user") {
      query = query.eq("user_id", user.id);
    }

    if (userIdFilter && user.role !== "user") {
      query = query.eq("user_id", userIdFilter);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    
    // admin and superadmin can see all todos
    const { data: todos, count , error: todosError } = await query;

    if (todosError)
      return NextResponse.json(
        { message: todosError.message },
        { status: 500 },
      );

    return NextResponse.json({ todos, page, limit, total: count }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
