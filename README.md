## HitTags Web Uygulaması

Bu depo, HitTags sosyal bookmark platformunun Next.js 15.5.4 (App Router) tabanlı web uygulaması için temel kurulumunu içerir. Tasarım, gereksinim ve uygulama planı `design.md`, `requirements.md` ve `tasks.md` dosyalarıyla uyumlu olacak şekilde kurgulanmıştır.

### ✨ Güncel Özellikler (v0.5.0)

- ✅ **Affiliate Link Management** - Commission tracking, analytics, QR codes
- ✅ **Link Groups** - Linktree-like pages with analytics
- ✅ **Premium Posts** - URL-free content with Markdown support
- ✅ **Collections** - Organize and share bookmark collections
- ✅ **Analytics Dashboard** - Comprehensive metrics and insights
- ✅ **SEO Optimized** - Meta tags, Open Graph, sitemap
- ✅ **Authentication** - Supabase Auth with Google/GitHub OAuth

### Başlangıç

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır.

### Proje Yapısı

- `src/app/(marketing)`: Açılış sayfaları ve pazarlama içerikleri için route grubu.
- `src/app/(app)`: Uygulama içi görünümler (ör. dashboard) için route grubu.
- `src/components/layout`: Site genelinde kullanılan layout bileşenleri.
- `src/config`: Uygulama genelinde paylaşılan konfigürasyonlar.
- `src/lib`: Yardımcı fonksiyonlar ve ileride eklenecek servis katmanı.
- `data`: Ön tasarım/prototip amaçlı HTML mockup dosyaları (canlı uygulama tarafından kullanılmaz).

Bu yapı, ilerleyen task'lerde eklenecek özelliklerin ayrıştırılmasını kolaylaştırır.

### Supabase Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
SUPABASE_JWT_SECRET="jwt-secret"
SUPABASE_REDIRECT_URL="http://localhost:3000/auth/callback"
```

1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. Supabase projenize ait değerleri doldurun.
3. Sunucu tarafı işlemler için servis anahtarlarını yalnızca güvenli ortamlarda kullanın.

### Komutlar

- `npm run dev`: Geliştirme sunucusunu başlatır (Turbopack ile).
- `npm run build`: Üretim derlemesi.
- `npm run start`: Üretim sunucusunu başlatır.
- `npm run lint`: ESLint çalıştırır.

### Supabase Kurulumu

- Supabase projesini hazırlamak için `docs/supabase-setup.md` dosyasındaki adımları uygulayın.
- `database-schema.sql` dosyası tüm tabloları, tetikleyicileri ve RLS politikalarını içerir.
- `src/lib/supabase/` klasörü hem sunucu hem istemci tarafı için Supabase istemcilerini barındırır.

### Statik Tasarım Sayfaları

- `data/` klasöründeki HTML mockup dosyaları doğrudan `renderDataHtml` yardımcı fonksiyonu ile sayfalara gömülür.
- `tailwind.config.ts` içerisinde `./data/**/*.html` yolu tanımlandığı için Tailwind, mockup dosyalarındaki sınıfları da build aşamasında işler.
- FontAwesome ve Inter fontu otomatik olarak import edilir; ekstra ikon kütüphanesi eklemenize gerek yoktur.
- Yeni bir sayfa eklemek için ilgili HTML dosyasını `data/` altına yerleştirin ve sayfa bileşeninde `renderDataHtml("dosya.html")` kullanın.

**Mevcut rotalar**

- Public: `/`, `/explore`, `/trending`, `/pricing`, `/login`
- Auth: `/signup`, `/reset-password`, `/onboarding`
- İçerik detayları: `/tags/[slug]`, `/collections/[slug]`, `/bookmarks/[slug]`, `/users/[username]`
- Uygulama statik akışı: `/app-static/bookmarks/add`
- Admin panelleri: `/admin/dashboard`, `/admin/seo-settings`, `/admin/content-discovery`, `/admin/onboarding-settings`, `/admin/flows/bookmark-add`

### Sonraki Adımlar

- Shadcn/ui bileşenlerinin eklenmesi.
- Supabase istemci yardımcılarının tanımlanması.
- tasks.md dosyasındaki bir sonraki task'lerin uygulanması.
