import { supabaseAdmin } from "./supabase-admin";

/**
 * Upload a file buffer to Supabase Storage
 */

export async function uploadFileToStorage({
  bucket,
  path,
  file,
  contentType,
} : {
  bucket: string;
  path: string;
  file: Buffer;
  contentType: string;
}) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

    if(error) throw error;

    return {bucket, path};
}


/**
 * Delete a file from Supabase Storage
 */

export async function deleteFileFromStorage({bucket, path,} : {bucket: string; path: string;}) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if(error) throw error;
}

/**
 * Generate a signed URL for private file access
 * (used for preview/download)
 */

export async function getSignedUrl({bucket, path, expiresIn = 60 * 10,} 
  : {bucket: string; path: string; expiresIn?: number;}) {

    const {data, error} = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if(error || !data?.signedUrl) {
      throw new Error(error?.message || "Failed to generate signed URL");
    }

    return data.signedUrl;
  }

