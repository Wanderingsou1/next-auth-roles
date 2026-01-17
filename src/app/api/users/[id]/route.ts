import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (decoded.id !== id) {
      return NextResponse.json({ message: "Forbidden", decoded, id}, { status: 403 });
    }

    const body = await req.json();

    interface UpdateData {
      name?: string;
      email?: string;
      password?: string;
    }

    const updateData: UpdateData = { ...body };

    if (typeof updateData.password === "string" && updateData.password.trim() !== "") {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return NextResponse.json({ message: "Unauthorized"}, {status: 401});
    }

    if(decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return NextResponse.json({ message: "Forbidden"}, {status: 403});
    }

    const targetUser = await User.findById((await params).id);
    if(!targetUser) return NextResponse.json({message: "User not found"}, {status: 404});

    // admin can only delete users with role 'user'
    if(decoded.role === 'admin' && targetUser.role !== 'user') {
      return NextResponse.json({message: "Admin can only delete users"}, {status: 403});
    }

    // superadmin can delete any user including admins
    if(decoded.role === 'superadmin' && targetUser.role === 'superadmin') {
      return NextResponse.json({message: "Superadmins cannot delete self"}, {status: 403});
    }


    await User.findByIdAndDelete((await params).id);

    return NextResponse.json({message: "User deleted successfully"});

  } catch (error) {
    return NextResponse.json({ message: "Server error", error}, { status: 500});
  }
}