import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { Todo } from "@/models/Todo";


// Create a new todo
export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if(!token) {
      return NextResponse.json({message: "Unauthorized"}, {status:401});
    }

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return NextResponse.json({message: "Unauthorized"}, {status:401});
    }

    if(decoded.role !== "user") {
      return NextResponse.json({message: "Forbidden"}, {status:403});
    }

    const { name, description, status, priority } = await req.json();

    if(!name || typeof name !== "string") {
      return NextResponse.json({message: "Todo name is required"}, {status: 400});
    }

    const todo = await Todo.create({
      userId: decoded.id,
      name,
      description,
      status,
      priority,
    });

    return NextResponse.json({message: "Todo created successfully", todo}, {status: 201});
  } catch (error) {
    return NextResponse.json({message: "Server error", error}, {status: 500});
  }
}


// Get all todos for the authenticated user
export async function GET() {
  try {
    await connectDB();

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if(!token) {
      return NextResponse.json({message: "Unauthorized"}, {status:401});
    }

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const filter: { userId?: string } = {};

    // normal users can only see their own todos
    if(decoded.role === "user") {
      filter.userId = decoded.id;
    }

    // admin and superadmin can see all todos
    const todos = await Todo.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({todos}, {status: 200});
  } catch (error) {
    return NextResponse.json({message: "Server error", error}, {status: 500});
  }
}
