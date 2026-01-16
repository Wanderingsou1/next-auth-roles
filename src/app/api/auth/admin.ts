import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { User } from "@/models/User";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token= (await cookieStore).get("token")?.value;

    if(!token) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded?.id) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    if(decoded.role !== "admin") {
      return NextResponse.json({message: "Forbidden"}, {status: 403});
    }

    await connectDB();

    const users = await User.find().select("-password");
    return NextResponse.json({users}, {status: 200});
  } catch (error) {
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}