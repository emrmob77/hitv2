# Supabase Kurulum Rehberi

Bu doküman, `tasks.md` dosyasındaki 2. aşamadaki adımları tamamlamak için gerekli Supabase yapılandırmasını adım adım özetler. Ayrıca `requirements.md` ve `design.md` dosyalarındaki gereksinimler referans alınmıştır.

## 1. SQL Şemasını Uygula

1. Supabase projenizin SQL Editor bölümünü açın.
2. Depodaki `database-schema.sql` dosyasının tamamını kopyalayarak çalıştırın.
   - Dosya; tabloları, indexleri, tetikleyicileri (slug üretimi vb.), RLS politikalarını ve örnek plan verilerini içerir.
   - `seo_metrics` ve `seo_performance` tabloları SEO izleme gereksinimlerini (`requirements.md` Gereksinim 3) karşılar.
   - `generate_slug`, `trigger_bookmark_slug` ve `trigger_tag_slug` fonksiyonları SEO-friendly URL hedeflerini (`design.md` ve `SEO-Strategy.md`) destekler.
3. SQL çalıştığında tüm tablolar oluşturulmuş ve RLS politikaları etkinleşmiş olacaktır.

## 2. Row Level Security (RLS) Kontrol Listesi

`database-schema.sql` dosyası aşağıdaki tablolar için RLS'yi otomatik olarak etkinleştirir:

- `profiles`, `user_settings`
- `bookmarks`, `collections`, `collection_collaborators`
- `exclusive_posts`, `affiliate_links`, `tag_links`
- `comments`, `likes`, `follows`, `notifications`
- `subscriptions_user`

Her tablo için politikalar gereksinimlere göre özelleştirilmiştir. Ek bir politika gerekiyorsa Supabase Dashboard üzerinden eklenebilir.

## 3. Auth Sağlayıcıları

`requirements.md` Gereksinim 1 kapsamında aşağıdaki OAuth sağlayıcılarını etkinleştirin:

1. Supabase Dashboard → Authentication → Providers.
2. Google ve GitHub için istemci kimlik / gizli anahtar bilgilerini girin.
3. Callback URL olarak `.env.example` içinde tanımlanan `SUPABASE_REDIRECT_URL` değerini kullanın (`http://localhost:3000/auth/callback`).

> **Not:** İleride Apple, LinkedIn vb. ek sağlayıcılar desteklenecekse yine aynı adımlar uygulanabilir.

## 4. Ortam Değişkenleri

1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. Aşağıdaki alanları Supabase Proje ayarlarından alınan değerlerle doldurun:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SUPABASE_JWT_SECRET="<jwt-secret>"
SUPABASE_REDIRECT_URL="http://localhost:3000/auth/callback"
```

3. `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucu tarafında (örn. background job) kullanılmalıdır. İstemci tarafında paylaşmayın.

## 5. Tip Üretimi (Opsiyonel)

Supabase tiplerini otomatik oluşturmak için CLI kullanabilirsiniz:

```bash
supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/types.ts
```

Bu komut `src/lib/supabase/types.ts` dosyasındaki placeholder tipleri günceller.

## 6. Kontrol Listesi

- [ ] `database-schema.sql` başarıyla çalıştırıldı.
- [ ] RLS politikalarının etkin olduğu doğrulandı.
- [ ] Google ve GitHub OAuth sağlayıcıları etkinleştirildi.
- [ ] `.env.local` dosyası Supabase değerleriyle güncellendi.
- [ ] (Opsiyonel) Tipler Supabase CLI ile güncellendi.

Kurulum tamamlandığında Next.js uygulaması Supabase istemcisi (`src/lib/supabase/*`) üzerinden veritabanına güvenli şekilde bağlanabilir.
