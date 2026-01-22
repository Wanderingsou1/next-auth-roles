import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { extractDocumentContent } from "@/lib/document-extractor";
import { uploadFileToStorage } from "@/lib/storage";

type Role = "user" | "admin" | "superadmin";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// GET /api/documents
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
 * GET /api/documents
 */

export async function GET(req: Request) {
  try {
    const me = await getMe();
    if (!me) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await supabaseServer();

    let query = supabase
      .from("documents")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if(me.role === "user") query = query.eq("user_id", me.id);

    const { data, count, error } = await query;

    if(error) return NextResponse.json({message: error.message}, {status: 400});

    return NextResponse.json({ 
      data: data ?? [],
      pagination: {page, limit, total: count ?? 0},
     }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err || "Server Error" }, { status: 500 });
  }
}


// POST /api/documents

export async function POST(req: Request) {
  try {
    const me = await getMe();
    if(!me) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    if(me.role !== "user") return NextResponse.json({message: "Forbidden"}, {status: 403});

    console.log("checkpoint 1");
    // Upload file
    const formData = await req.formData();
    const file = formData.get("file");

    if(!file || !(file instanceof File)) {
      return NextResponse.json({message: "file is required"}, {status: 400});
    }

    console.log("checkpoint 2");

    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if(!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {message: "Only pdf, doc and docx files are allowed"},
        {status: 400}
      );
    }

    console.log("checkpoint 3");

    const bucket = "documents";
    const safeOriginal = sanitizeFileName(file.name);
    const fileExt = file.name.split(".").pop() ?? "bin";
    const storageFileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${me.id}/${storageFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("checkpoint 4");


    // Upload via storage helper
    await uploadFileToStorage({
      bucket,
      path: storagePath,
      file: buffer,
      contentType: file.type,
    });

    console.log("checkpoint 4");

    // Extract Content
    const extracted = await extractDocumentContent({
      mimeType: file.type,
      buffer,
    });

    console.log("checkpoint 5");


    // Save document to db
    const {data: inserted, error: insertError} = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: me.id,
        original_name: file.name.slice(0, 255),
        file_name: safeOriginal,
        mime_type: file.type,
        size: file.size,
        bucket,
        storage_path: storagePath,
        extracted_text: extracted.text,
        extracted_html: extracted.html,
      })
      .select("*")
      .single();

    if(insertError) {
      // rollback storage
      await supabaseAdmin.storage
        .from(bucket)
        .remove([storagePath]); 

      return NextResponse.json({message: insertError.message}, {status: 400});
    }

    return NextResponse.json({message: "Document uploaded", data: inserted}, {status: 201});
  } catch (err) {
    return NextResponse.json({message: err || "Server Error"}, {status: 500});
  }
}