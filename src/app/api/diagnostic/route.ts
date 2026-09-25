import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const rawService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const r2Account = process.env.R2_ACCOUNT_ID;
  const r2KeyId = process.env.R2_ACCESS_KEY_ID;
  const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET_NAME;

  const result: any = {
    env: process.env.NODE_ENV,
    supabase: {
      url_configured: Boolean(rawUrl && !rawUrl.includes("your-project")),
      url_preview: rawUrl ? `${rawUrl.substring(0, 15)}...` : null,
      anon_configured: Boolean(rawAnon && !rawAnon.includes("dummy")),
      service_role_configured: Boolean(rawService && !rawService.includes("your-supabase")),
      connection: "untested",
      profiles_count: 0,
      galleries_count: 0,
      error: null,
    },
    r2: {
      account_configured: Boolean(r2Account && !r2Account.includes("dummy")),
      key_id_configured: Boolean(r2KeyId && !r2KeyId.includes("dummy")),
      secret_configured: Boolean(r2Secret && !r2Secret.includes("dummy")),
      bucket_name: r2Bucket || null,
    },
  };

  if (result.supabase.url_configured) {
    try {
      const supabase = createClientServer();
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .limit(5);

      if (pError) {
        result.supabase.connection = "error";
        result.supabase.error = pError.message;
      } else {
        result.supabase.connection = "ok";
        result.supabase.profiles_count = profiles?.length || 0;
        result.supabase.profiles_sample = profiles;

        const { count: gCount, error: gError } = await supabase
          .from("galleries")
          .select("*", { count: "exact", head: true });

        if (!gError) {
          result.supabase.galleries_count = gCount || 0;
        }
      }
    } catch (err: any) {
      result.supabase.connection = "exception";
      result.supabase.error = err.message;
    }
  }

  if (result.r2.account_configured) {
    try {
      const { r2Client, r2BucketName } = await import("@/lib/r2/client");
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
      const listRes = await r2Client.send(new ListObjectsV2Command({ Bucket: r2BucketName, MaxKeys: 20 }));
      result.r2.connection = "ok";
      result.r2.objects_count = listRes.KeyCount || 0;
      result.r2.sample_keys = (listRes.Contents || []).map((o: any) => ({ key: o.Key, size: o.Size }));
    } catch (r2Err: any) {
      result.r2.connection = "error";
      result.r2.error = r2Err.message;
    }
  }

  return NextResponse.json(result);
}
