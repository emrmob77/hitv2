import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export const createSupabaseBrowserClient = () => {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase istemcisi başlatılırken ortam değişkenleri eksik. Lütfen .env.local dosyasını güncelleyin."
    );
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
};
