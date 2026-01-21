import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    // only users can update their todos
    if (user.role !== "user") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
 
    // Update only if todo belongs to logged in user
    const { data: todo, error: updateError } = await supabase
      .from("todos")
      .update({
        status: body.status,
        priority: body.priority,
        updated_at: new Date(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError)
      return NextResponse.json({ message: updateError?.message }, { status: 404 });

    if (!todo)
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });

    return NextResponse.json(
      { message: "Todo updated successfully", todo },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    console.log(id);
    console.log(user.id);

    // users can delete their todos
    if (user.role === "user") {
      const { data: todo, error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error || !todo) {
        return NextResponse.json(
          { message: "Todo not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Todo deleted successfully" },
        { status: 200 },
      );
    }

    // superadmin can delete any todo
    if (user.role === "superadmin") {
      const { data: todo, error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id)
        .select("*")
        .single();

      if (error || !todo) {
        return NextResponse.json(
          { message: "Todo not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Todo deleted successfully" },
        { status: 200 },
      );
    }

    // admin cannot delete
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json(
      { message: "Server error"},
      { status: 500 },
    );
  }
}
