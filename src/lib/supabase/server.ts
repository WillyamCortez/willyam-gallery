import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function createClientServer() {
  const cookieStore = cookies();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://your-project.supabase.co";
  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, "");

  const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "dummy-anon-key";
  const supabaseAnonKey = rawAnon.trim().replace(/^["']|["']$/g, "");

  const rawService = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRoleKey = rawService ? rawService.trim().replace(/^["']|["']$/g, "") : undefined;

  if (serviceRoleKey && !serviceRoleKey.includes("your-supabase")) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    }) as any;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Em Server Components em modo leitura, set pode falhar de forma segura
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Em Server Components em modo leitura, remove pode falhar de forma segura
        }
      },
    },
  });
}

