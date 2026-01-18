import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Todo } from "@/models/Todo";
import { User } from "@/models/User";


// Create a new todo
export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if(!userId) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const user = await User.findById(userId).select("-password");
    if(!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    if(user.role !== "user") {
      return NextResponse.json({message: "Forbidden"}, {status:403});
    }

    const { name, description, status, priority } = await req.json();

    if(!name || typeof name !== "string") {
      return NextResponse.json({message: "Todo name is required"}, {status: 400});
    }

    const todo = await Todo.create({
      userId: user.id,
      name,
      description,
      status,
      priority,
    });

    return NextResponse.json({message: "Todo created successfully", todo}, {status: 201});
  } catch (error) {
    return NextResponse.json({message: "Server error"}, {status: 500});
  }
}


// Get all todos for the authenticated user
export async function GET(req: Request) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if(!userId) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const user = await User.findById(userId).select("-password");
    if(!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const filter: { userId?: string } = {};

    // normal users can only see their own todos
    if(user.role === "user") {
      filter.userId = user.id;
    }

    // admin and superadmin can see all todos
    const todos = await Todo.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({todos}, {status: 200});
  } catch (error) {
    return NextResponse.json({message: "Server error"}, {status: 500});
  }
}
