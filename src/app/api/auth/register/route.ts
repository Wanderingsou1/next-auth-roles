import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // Create user in Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { id: data.user?.id, email: data.user?.email },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 },
    );
  }
}
