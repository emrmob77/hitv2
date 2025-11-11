# HitTags Web Uygulaması

Next.js 15.5.4 (App Router) tabanlı sosyal bookmark platformu.

## ✨ Özellikler

- 🔖 **Bookmark Management** - URL kaydetme, organize etme, paylaşma
- 📚 **Collections** - Bookmark koleksiyonları oluşturma ve paylaşma
- 🏷️ **Tag System** - Etiketleme ve keşif sistemi
- 💰 **Affiliate Links** - Commission tracking ve analytics
- 🔗 **Link Groups** - Linktree-benzeri sayfalar
- ✍️ **Premium Posts** - Markdown destekli içerik paylaşımı
- 📊 **Analytics** - Kapsamlı metrikler ve istatistikler
- 🔐 **Authentication** - Supabase Auth (Google/GitHub OAuth)
- 👥 **Social Features** - Takip, beğeni, yorum sistemi
- 👑 **Admin Panel** - Kullanıcı, içerik ve sistem yönetimi
- 🎨 **SEO Optimized** - Meta tags, Open Graph, sitemap

## 🚀 Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışır.

## 📁 Proje Yapısı

```
hitv2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public sayfalar (landing, pricing)
│   │   ├── (app)/              # Auth-required sayfalar (dashboard)
│   │   ├── admin/              # Admin panel
│   │   ├── api/                # API routes
│   │   └── auth/               # Authentication
│   ├── components/             # React bileşenleri
│   │   ├── ui/                 # shadcn/ui bileşenleri
│   │   └── layout/             # Layout bileşenleri
│   ├── lib/                    # Utility fonksiyonlar
│   │   ├── supabase/           # Supabase clients
│   │   └── utils.ts            # Yardımcı fonksiyonlar
│   └── types/                  # TypeScript tipleri
├── database/                   # Veritabanı schema ve migrations
│   ├── schema/                 # Ana schema dosyaları
│   │   ├── database-schema.sql
│   │   └── database-triggers.sql
│   └── migrations/             # Migration dosyaları
├── docs/                       # Dokümantasyon
│   ├── operations/             # Ops docs (API, deployment, monitoring)
│   ├── setup/                  # Setup guides (Stripe, Supabase)
│   └── strategy/               # Strategy docs (SEO, security)
├── public/                     # Static assets
├── supabase/                   # Supabase configuration
│   └── migrations/             # Supabase migrations
├── .env.example                # Örnek environment variables
├── package.json
└── tasks.md                    # Development tasks
```

## 🔧 Environment Variables

`.env.example` dosyasını `.env.local` olarak kopyalayın ve değerleri doldurun:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

⚠️ **Önemli**: Service role key'i asla client-side'da kullanmayın!

## 📊 Veritabanı

### Schema Dosyaları

- `database/schema/database-schema.sql` - Ana veritabanı schema'sı
- `database/schema/database-triggers.sql` - Trigger'lar ve fonksiyonlar
- `database/migrations/` - Incremental migrations

### Supabase Kurulumu

1. [Supabase](https://supabase.com) üzerinde yeni proje oluşturun
2. `docs/supabase-setup.md` adımlarını takip edin
3. `database/schema/database-schema.sql` dosyasını SQL Editor'de çalıştırın
4. Environment variables'ı `.env.local`'a ekleyin

Detaylı kurulum için: `docs/setup/` klasörü

## 🛠️ Komutlar

```bash
npm run dev          # Geliştirme sunucusu (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript type checking
```

## 🗺️ Ana Rotalar

### Public Routes
- `/` - Ana sayfa
- `/explore` - İçerik keşfi
- `/trending` - Trend içerikler
- `/pricing` - Fiyatlandırma
- `/auth/sign-in` - Giriş
- `/auth/sign-up` - Kayıt

### App Routes (Auth Required)
- `/dashboard` - Kullanıcı dashboard
- `/bookmarks` - Bookmark yönetimi
- `/collections` - Koleksiyon yönetimi
- `/analytics` - İstatistikler
- `/settings` - Ayarlar

### Admin Routes (Admin Only)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - Kullanıcı yönetimi
- `/admin/content` - İçerik yönetimi
- `/admin/analytics` - Sistem analytics
- `/admin/settings` - Sistem ayarları

### Dynamic Routes
- `/tags/[slug]` - Tag detay
- `/collections/[slug]` - Koleksiyon detay
- `/bookmarks/[slug]` - Bookmark detay
- `/[username]` - Kullanıcı profili

## 📚 Dokümantasyon

- **Setup Guides**: `docs/setup/`
  - Stripe entegrasyonu
  - Supabase kurulumu
  - Tag sistemi implementasyonu

- **Operations**: `docs/operations/`
  - API dokümantasyonu
  - Deployment rehberi
  - Monitoring ve backup

- **Strategy**: `docs/strategy/`
  - SEO stratejisi
  - Security best practices
  - Premium content stratejisi

## 🔐 Admin Panel

Admin paneline erişim için:
1. Supabase'de kullanıcınızın `is_admin` flag'ini `true` yapın
2. `/admin/dashboard` adresine gidin

Admin client service role key kullanır ve RLS politikalarını bypass eder.

## 🎨 UI Components

Proje [shadcn/ui](https://ui.shadcn.com/) kullanır:
- `components/ui/` - shadcn/ui bileşenleri
- `components/layout/` - Layout bileşenleri
- Tailwind CSS ile stillendirilmiş

## 🚧 Development

Geliştirme görevleri için `tasks.md` dosyasına bakın.

## 📄 Lisans

MIT
