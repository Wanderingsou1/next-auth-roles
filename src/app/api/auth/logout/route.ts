import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = supabaseServer();
    (await supabase).auth.signOut();

    return NextResponse.json(
      { message: "User logged out successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 },
    );
  }
}
