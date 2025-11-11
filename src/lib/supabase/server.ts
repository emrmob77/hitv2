import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

type CreateSupabaseOptions = {
  strict?: boolean;
};

export function createSupabaseServerClient(options?: { strict?: true }): Promise<SupabaseClient<Database>>;
export function createSupabaseServerClient(options: { strict: false }): Promise<SupabaseClient<Database> | null>;
export async function createSupabaseServerClient({ strict = true }: CreateSupabaseOptions = {}) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    if (strict) {
      throw new Error(
        "Supabase sunucu istemcisi başlatılırken ortam değişkenleri eksik. Lütfen .env.local dosyasını güncelleyin."
      );
    }
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Component context'te cookies.set desteklenmediğinde sessizce devam et.
          // Bu Next.js 15'te layout ve page component'lerinde beklenen bir durumdur.
          // Cookie'ler sadece Server Actions ve Route Handlers'da değiştirilebilir.
        }
      },
    },
  });
};

/**
 * Create admin Supabase client with service role key
 * This bypasses RLS policies - use only for admin operations
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  if (!env.supabaseUrl || !env.serviceRoleKey) {
    throw new Error(
      "Supabase admin client için gerekli ortam değişkenleri eksik. SUPABASE_SERVICE_ROLE_KEY gerekli."
    );
  }

  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
