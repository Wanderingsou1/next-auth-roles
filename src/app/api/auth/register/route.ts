import { NextResponse } from "next/server";
import { connectDB} from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const {name, email, password, role} = await req.json();

    // Validation
    if(!name || !email || !password) {
      return NextResponse.json({message: 'All fields are required'}, {status: 400});
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if(exists) {
      return NextResponse.json({ message: 'User already exists' }, {status: 400});
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, 
      email,
      password: hashed,
      role: role === "admin" ? "admin" : "user",
    });

    return NextResponse.json({message: 'User registered successfully', user: {id: user._id, email: user.email, role: user.role}}, {status: 201});


  } catch (error) {
    return NextResponse.json({ message: 'Server error', error}, {status: 500});
  }
}