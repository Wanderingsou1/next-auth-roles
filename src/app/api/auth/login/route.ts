import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const {email, password} = await req.json();

    const user = await User.findOne({ email});
    if(!user) {
      return NextResponse.json({ message: 'Invalid credentials'}, { status: 401});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials'}, { status: 401});
    }

    const token = signToken({ id: user._id, role: user.role});

    const res = NextResponse.json({ message: 'Login successful'});
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      path: '/',
    });

    return res;


  } catch (error) {
  return NextResponse.json({ message: 'Server error', error}, {status: 500});
  }
}