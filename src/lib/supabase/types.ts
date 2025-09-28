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

// Placeholder veritabanı tipleri Supabase CLI ile güncellenene kadar
// Supabase client çağrılarının tür güvenliğini gevşetiyoruz.
// CLI çıktısı eklendiğinde bu `any` yerine gerçek tiplerle değiştirilecek.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
