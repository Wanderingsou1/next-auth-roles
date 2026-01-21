import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
      return NextResponse.json({message: "unauthorized"}, {status: 401})

    // Only update own profile
    console.log(authData.user.id);
    console.log(id);
    if (authData.user.id !== id)
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { name, email, password } = await req.json();

    // Update auth email, password if provided
    if (email || password) {
      const { error } = await supabase.auth.updateUser({ email, password });

      if (error)
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Update name is the profile
    if (name) {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", id);

      if (error)
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile Updated Successfully " });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();
    const supabaseAdminClient = supabaseAdmin;

    // Auth User
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user)
      NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Fetch Requester Role
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user?.id)
      .single();

    console.log(me);

    // users cannot delete users
    if (!me || (me.role !== "admin" && me.role !== "superadmin")) {
      return NextResponse.json({ message: "onafoca" }, { status: 403 });
    }

    // Fetch target user role

    const { data: target } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();

    if (!target)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    // admin can only delete users with role 'user'
    if (me.role === "admin" && target.role !== "user") {
      return NextResponse.json(
        { message: "Admin can only delete users" },
        { status: 403 },
      );
    }

    // superadmin cannot delete self
    if (me.role === "superadmin" && id === authData.user?.id) {
      return NextResponse.json(
        { message: "Superadmin cannot delete self" },
        { status: 403 },
      );
    }

    const { error } = await supabaseAdminClient.auth.admin.deleteUser(id);
    if (error)
      return NextResponse.json({ message: error.message }, { status: 400 });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
