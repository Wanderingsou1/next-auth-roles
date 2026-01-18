import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Todo } from "@/models/Todo";
import { User } from "@/models/User";

export async function PUT(req: Request, { params }: { params: {id: string} }) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if(!userId) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const user = await User.findById(userId).select("-password");
    if(!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    // only users can update their todos
    if(user.role !== "user") {
      return NextResponse.json({message: "Forbidden"}, {status:403});
    }

    const body = await req.json();

    const todo = await Todo.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      body,
      { new: true}
    );

    if(!todo) return NextResponse.json({message: "Todo not found"}, {status:404});

    return NextResponse.json({message: "Todo updated successfully", todo}, {status: 200});
  } catch (error) {
    return NextResponse.json({message: "Server error", error}, {status: 500});
  }
}


export async function DELETE(req: Request, { params }: { params: {id: string} }) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if(!userId) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const user = await User.findById(userId).select("-password");
    if(!user) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    // users can delete their todos
    if(user.role === "user") {

      const todo = await Todo.findOneAndDelete(
        { _id: params.id, userId: user.id }
      );

      if(!todo) return NextResponse.json({message: "Todo not found"}, {status:404});
      return NextResponse.json({message: "Todo deleted successfully"}, {status: 200});
    }

    // superadmin can delete any todo
    if(user.role === "superadmin") {
      const todo = await Todo.findByIdAndDelete(params.id);

      if(!todo) return NextResponse.json({message: "Todo not found"}, {status:404});
      return NextResponse.json({message: "Todo deleted successfully"}, {status: 200});
    }

    return NextResponse.json({message: "Forbidden"}, {status: 403});
  } catch (error) {
    return NextResponse.json({message: "Server error", error}, {status: 500});
  }
}