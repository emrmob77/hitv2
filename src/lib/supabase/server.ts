import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export const createSupabaseServerClient = () => {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase sunucu istemcisi başlatılırken ortam değişkenleri eksik. Lütfen .env.local dosyasını güncelleyin."
    );
  }

  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
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
