import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export const createSupabaseBrowserClient = () => {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
};
