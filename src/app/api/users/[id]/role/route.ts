import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import  { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { User } from "@/models/User";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if(!token) {
      return NextResponse.json({ message: "Unauthorized"}, {status: 401});
    }

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded || !("role" in decoded)) {
      return NextResponse.json({ message: "Unauthorized"}, {status: 401});
    }

    // only superadmin can change roles
    if(decoded.role !== 'superadmin') {
      return NextResponse.json({ message: "forbidden"}, {status: 403});
    }

    const { role } = await req.json();

    if(!['user', 'admin'].includes(role)) {
      return NextResponse.json({message: "Invalid role"}, {status: 400});
    }

    if(decoded.id === (await params).id) {
      return NextResponse.json({message: "Cannot change your own role"}, {status: 400});
    }

    const updated = await User.findByIdAndUpdate(
      (await params).id,
      { role },
      { new: true }
    ).select("-password");


    if(!updated) return NextResponse.json({message: "User not found"}, {status: 404});

    return NextResponse.json({ message: "User role updated successfully", user: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}