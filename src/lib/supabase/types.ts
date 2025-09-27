/**
 * Supabase veritabanı tipleri burada tanımlanır.
 *
 * Üretim ortamında `supabase gen types --project-id <ref>` komutu ile
 * otomatik olarak güncellenmesi önerilir. Şimdilik placeholder olarak
 * boş bir şema tutuyoruz.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
};
