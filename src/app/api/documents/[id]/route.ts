import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { deleteFileFromStorage, getSignedUrl } from "@/lib/storage";

type Role = "user" | "admin" | "superadmin";

async function getMe() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", data.user.id)
    .single();

  if(profileError || !profile) return null;

  return {
    id: data.user.id,
    role: profile.role as Role,
  };
}


/**
 * GET /api/documents/:id
 * GET /api/documents/:id?file=1  -> secure preview/download
 */

export async function GET(req: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const {id} = await params;
    const me = await getMe();

    if(!me) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    if(me.role === "admin") return NextResponse.json({message: "Forbidden"}, {status: 403});

    const docId = id;
    const url = new URL(req.url);
    const wantsFile = url.searchParams.get("file") === "1";


    // fetch document from supabase
    const { data: doc, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();

    if(error || !doc) return NextResponse.json({message: "Not Found"}, {status: 404});

    if(me.role === "user" && me.id !== doc.user_id) return NextResponse.json({message: "Forbidden"}, {status: 403});

    if(wantsFile) {
      const signedUrl = await getSignedUrl({
        bucket: doc.bucket,
        path: doc.storage_path,
      });

      return NextResponse.redirect(signedUrl);
    }

    return NextResponse.json({data: doc});

  } catch (error) {
      return NextResponse.json({message: error || "Server Error"}, {status: 500});
  }
}


/**
 * DELETE /api/documents/:id
 */

export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const {id} = await params;
    const me = await getMe();

    if(!me) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    if(me.role === "admin") return NextResponse.json({message: "Forbidden"}, {status: 403});

    const docId = id;

    // Fetch Document
    const {data: doc, error} = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();

    if(error || !doc) return NextResponse.json({message: "Not Found"}, {status: 404});

    if(me.role === "user" && me.id !== doc.user_id) return NextResponse.json({message: "Forbidden"}, {status: 403});


    // Delete file from storage
    await deleteFileFromStorage({
      bucket: doc.bucket,
      path: doc.storage_path,
    });


    // Delete document from supabase
    const { error: deleteError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", docId);

    if(deleteError) return NextResponse.json({message: deleteError.message}, {status: 500});

    return NextResponse.json({message: "Document deleted"});

  } catch (error) {
    return NextResponse.json({message: error || "Server Error"}, {status: 500});
  }
}