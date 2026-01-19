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

    // get logged in user's role from profile
    const { data: me, error: meError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (meError || !me)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // only superadmin can change roles
    if (me.role !== "superadmin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    console.log("Checkpoint 0")

    // Validate role input
    const { role } = await req.json();

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    console.log("Checkpoint 1")

    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .single();

      console.log("Checkpoint 2")

    if (targetError || !target)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (me.id === target.id) {
      return NextResponse.json(
        { message: "Cannot change your own role" },
        { status: 400 },
      );
    }

    console.log("Checkpoint 3");

    // Update role in profiles table
    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select("id, name, email, role, created_at")
      .single();

    console.log("Checkpoint 4");
    console.log(updated); 

    if (updateError || !updated)
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 },
      );

    console.log("Checkpoint 5");


    return NextResponse.json(
      { message: "User role updated successfully", user: updated },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
