import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if(!userId) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const user = await User.findById(userId).select("-password");
    if(!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    // only superadmin can change roles
    if(user.role !== 'superadmin') {
      return NextResponse.json({ message: "forbidden"}, {status: 403});
    }

    const { role } = await req.json();

    if(!['user', 'admin'].includes(role)) {
      return NextResponse.json({message: "Invalid role"}, {status: 400});
    }

    if(user.id === (await params).id) {
      return NextResponse.json({message: "Cannot change your own role"}, {status: 400});
    }

    const updated = await User.findByIdAndUpdate(
      (await params).id,
      { role },
      { new: true }
    ).select("-password");


    if(!updated) return NextResponse.json({message: "User not found"}, {status: 404});

    return NextResponse.json({ message: "User role updated successfully", user: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}