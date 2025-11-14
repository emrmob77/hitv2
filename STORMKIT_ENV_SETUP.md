# Stormkit.io Environment Variables Setup

Bu dosya Stormkit.io'da ayarlanması gereken tüm environment variables'ları listeler.

## 🔴 ZORUNLU (REQUIRED) - Supabase

Bu değişkenler olmadan uygulama çalışmaz:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
SUPABASE_REDIRECT_URL=https://your-domain.stormkit.dev/auth/callback
```

**Önemli:** `SUPABASE_REDIRECT_URL` değerini Stormkit.io domain'inize göre ayarlayın:
- Production: `https://spearfate-n8sh8h.stormkit.dev/auth/callback`
- Veya custom domain: `https://yourdomain.com/auth/callback`

## 🟡 ÖNEMLİ (IMPORTANT) - Site URL

```
NEXT_PUBLIC_SITE_URL=https://spearfate-n8sh8h.stormkit.dev
```

Bu değer SEO, sitemap ve paylaşım linkleri için kullanılır.

## 🟢 OPSIYONEL (OPTIONAL) - Stripe (Ödeme için)

Stripe kullanmıyorsanız bu değişkenleri boş bırakabilirsiniz:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_...
```

## 🟢 OPSIYONEL - Cron Jobs

```
CRON_SECRET=your-random-secret-key-here
```

## 🟢 OPSIYONEL - Search & AI Services

```
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_API_KEY=your-elasticsearch-api-key
GOOGLE_VISION_API_KEY=your-google-vision-api-key
OPENAI_API_KEY=your-openai-api-key
```

## 🟢 OPSIYONEL - Analytics

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🟢 OPSIYONEL - Database (Direct connection)

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📋 Stormkit.io'da Ayarlama Adımları

1. **Stormkit.io Dashboard'a gidin**
   - Settings → Environment variables sekmesine gidin

2. **Zorunlu değişkenleri ekleyin:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `SUPABASE_REDIRECT_URL` (Stormkit domain'inize göre)
   - `NEXT_PUBLIC_SITE_URL` (Stormkit domain'inize göre)

3. **Değerleri Supabase'den alın:**
   - Supabase Dashboard → Project Settings → API
   - URL: `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key: `SUPABASE_SERVICE_ROLE_KEY`
   - JWT Secret: Settings → API → JWT Secret

4. **Redirect URL'i ayarlayın:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Redirect URLs listesine ekleyin: `https://gorillablaze-eo8yv1.stormkit.dev/auth/callback`

5. **Kaydedin ve yeni deployment tetikleyin**

## ⚠️ 404 Hatası İçin Kontrol Listesi

404 hatası alıyorsanız şunları kontrol edin:

- ✅ Tüm zorunlu Supabase environment variables'ları eklenmiş mi?
- ✅ `SUPABASE_REDIRECT_URL` doğru domain ile ayarlanmış mı?
- ✅ `NEXT_PUBLIC_SITE_URL` doğru domain ile ayarlanmış mı?
- ✅ Build Settings'te Install command: `npm install --legacy-peer-deps`
- ✅ Build Settings'te Output folder: (boş bırakın)
- ✅ Runtime Settings'te Node.js version: `20.x` veya `18.x`
- ✅ Runtime Settings'te Start command: `npm start`

## 🔍 Environment Variables Kontrolü

Stormkit.io'da environment variables'ları kontrol etmek için:

1. Settings → Environment variables
2. Her değişkenin yanındaki göz ikonuna tıklayarak değeri kontrol edin
3. Değerlerin doğru olduğundan emin olun (özellikle URL'ler)

