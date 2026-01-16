import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken} from "@/lib/jwt";
import { User } from "@/models/User";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if(!token) {
      return NextResponse.json({message: 'Unauthorized'}, {status: 401});
    }

    const decoded = verifyToken(token);

    if(typeof decoded === 'string' || !decoded || !('id' in decoded)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-password');

    return NextResponse.json( { user });

  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized', error}, {status: 401});
  }
}
