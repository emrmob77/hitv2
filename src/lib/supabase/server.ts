import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

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
          // Server Component context'te cookies.set desteklenmediğinde hata alınmasını engelleriz.
          console.warn("Supabase cookie set hatası", error);
        }
      },
    },
  });
};
