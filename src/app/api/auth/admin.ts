import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if(!userId) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const user = await User.findById(userId).select("-password");
    if(!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    if(user.role !== "admin" && user.role !== "superadmin") {
      return NextResponse.json({message: "Forbidden"}, {status: 403});
    }

    const users = await User.find().select("-password");
    return NextResponse.json({users}, {status: 200});
  } catch (error) {
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}