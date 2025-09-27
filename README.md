## HitTags Web Uygulaması

Bu depo, HitTags sosyal bookmark platformunun Next.js 14 (App Router) tabanlı web uygulaması için temel kurulumunu içerir. Tasarım, gereksinim ve uygulama planı `design.md`, `requirements.md` ve `tasks.md` dosyalarıyla uyumlu olacak şekilde kurgulanmıştır.

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

### Sonraki Adımlar

- Shadcn/ui bileşenlerinin eklenmesi.
- Supabase istemci yardımcılarının tanımlanması.
- tasks.md dosyasındaki bir sonraki task'lerin uygulanması.
