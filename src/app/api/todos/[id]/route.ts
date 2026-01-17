import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { Todo } from "@/models/Todo";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if(!token) return NextResponse.json({message: "Unauthorized"}, {status:401});

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return NextResponse.json({message: "Unauthorized"}, {status:401});
    }

    // only users can update their todos
    if(decoded.role !== "user") {
      return NextResponse.json({message: "Forbidden"}, {status:403});
    }

    const body = await req.json();

    const todo = await Todo.findOneAndUpdate(
      { _id: (await params).id, userId: decoded.id },
      body,
      { new: true}
    );

    if(!todo) return NextResponse.json({message: "Todo not found"}, {status:404});

    return NextResponse.json({message: "Todo updated successfully", todo}, {status: 200});
  } catch (error) {
    return NextResponse.json({message: "Server error", error}, {status: 500});
  }
}


export async function DELETE(req: Request, { params }: { params: Promise<{id: string}> }) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if(!token) return NextResponse.json({message: "Unauthorized"}, {status:401});

    const decoded = verifyToken(token);

    if(typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return NextResponse.json({message: "Unauthorized"}, {status:401});
    }

    // users can delete their todos
    if(decoded.role === "user") {

      const todo = await Todo.findOneAndDelete(
        { _id: (await params).id, userId: decoded.id }
      );

      if(!todo) return NextResponse.json({message: "Todo not found"}, {status:404});
      return NextResponse.json({message: "Todo deleted successfully"}, {status: 200});
    }

    // superadmin can delete any todo
    if(decoded.role === "superadmin") {
      const todo = await Todo.findByIdAndDelete((await params).id);

      if(!todo) return NextResponse.json({message: "Todo not found"}, {status:404});
      return NextResponse.json({message: "Todo deleted successfully"}, {status: 200});
    }


  } catch (error) {
    return NextResponse.json({message: "Server error", error}, {status: 500});
  }
}