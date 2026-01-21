import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = await supabaseServer();

    type TodoUpdatePayload = {
      name?: string;
      description?: string | null;
      status?: "pending" | "in_progress" | "done";
      priority?: "low" | "medium" | "high";
      updated_at: string;
    };


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

    const updateData: TodoUpdatePayload = {
      updated_at: new Date().toISOString(),
    };

        if (body.name !== undefined || body.name.trim() !== "") updateData.name = body.name;
        if (body.description !== undefined || body.description.trim() !== "")
          updateData.description = body.description;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.priority !== undefined)
          updateData.priority = body.priority;
 
    // Update only if todo belongs to logged in user
    const { data: todo, error: updateError } = await supabase
      .from("todos")
      .update(updateData)
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



// Get a single todo

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();

    // Auth
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Profile
    const { data: me } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (!me) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let query = supabase
      .from("todos")
      .select("*")
      .eq("id", id);

    // user can only see own todo
    if (me.role === "user") {
      query = query.eq("user_id", me.id);
    }

    const { data: todo, error } = await query.single();

    if (error || !todo) {
      return NextResponse.json(
        { message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ todo }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

