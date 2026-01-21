import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    console.log("checkpoint 1");

    // Fetch profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, role, created_at")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { message: "Profile not found", error: profileError },
        { status: 404 },
      );
    }

    // const { data: sessionData } = await supabase.auth.getSession();
    // console.log("SESSION:", sessionData.session);

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: profile.name,
          role: profile.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized", error },
      { status: 401 },
    );
  }
}
