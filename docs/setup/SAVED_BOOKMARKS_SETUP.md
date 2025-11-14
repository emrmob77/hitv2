# Saved Bookmarks Setup Guide

## Seçenek 1: Supabase Dashboard ile SQL Çalıştırma (Önerilen)

1. **Supabase Dashboard'a gidin:**
   - https://supabase.com/dashboard
   - Projenizi seçin: `dzapvvdvycfpfwagmopx`

2. **SQL Editor'ü açın:**
   - Sol menüden "SQL Editor" seçin
   - "New query" butonuna tıklayın

3. **Aşağıdaki SQL'i yapıştırın ve çalıştırın:**

```sql
-- Create saved_bookmarks table
CREATE TABLE IF NOT EXISTS saved_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bookmark_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_bookmarks_user_id ON saved_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_bookmarks_bookmark_id ON saved_bookmarks(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_saved_bookmarks_created_at ON saved_bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE saved_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved bookmarks"
  ON saved_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save bookmarks"
  ON saved_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their bookmarks"
  ON saved_bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

4. **"Run" butonuna basın**

5. **Başarılı olduğunu doğrulayın:**
   - "Success" mesajını görmelisiniz
   - Table Editor'de `saved_bookmarks` tablosunu görebilirsiniz

## Seçenek 2: Var Olan Tablolarla Çalışma (Alternatif)

Eğer migration yapmak istemiyorsanız, `collection_bookmarks` tablosunu kullanabiliriz ama bu semantic olarak doğru değil çünkü:
- Collection bookmark = Bir koleksiyona ekleme
- Saved bookmark = Kişisel kaydetme (favorileme)

## Migration Sonrası Kontrol

Migration başarılı olduysa, aşağıdaki özellikleri test edin:

1. **Save butonu:** Bookmark detay sayfasında "Save" butonuna tıklayın
2. **Saved sayfası:** `/dashboard/saved` adresine gidin
3. **State persistence:** Sayfayı yenileyin, saved durumu korunmalı
4. **Unsave:** Save butonuna tekrar tıklayarak kaldırın

## Sorun Giderme

### "saved_bookmarks does not exist" hatası alıyorsanız:
- Migration'ı tekrar çalıştırın
- Supabase projesi doğru mu kontrol edin

### "permission denied" hatası alıyorsanız:
- RLS policies'i kontrol edin
- Auth durumunuzu kontrol edin (giriş yapmış olmalısınız)

### Save butonu çalışmıyorsa:
- Console'da hataları kontrol edin (F12 > Console)
- Network sekmesinde API yanıtlarını kontrol edin

## Özellikler

✅ **Save/Unsave Toggle:** Tek tıkla kaydet/kaldır
✅ **Saved Sayfası:** Tüm kaydettiğin bookmarkları gör
✅ **Dashboard Menu:** Sidebar'da "Saved" linki
✅ **Real-time Updates:** State anında güncellenir
✅ **Toast Notifications:** Başarı/hata mesajları
✅ **Initial State:** Server'dan saved durumu gelir
