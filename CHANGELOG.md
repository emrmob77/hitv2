# Changelog

Tüm önemli değişiklikler bu dosyada belgelenecektir.

## [Unreleased]

### Yapılacaklar
- Drag-drop sıralama özellikleri (collections, link groups)
- Subscription/Stripe entegrasyonu
- Browser extension
- AI-powered features
- Full-text search (Elasticsearch)
- Mobile apps (iOS/Android)

---

## [0.5.0] - 2025-10-03

### ✅ Eklenenler

#### Affiliate Link Management System
- **Affiliate Pages** (`src/app/(app)/dashboard/affiliate/`)
  - Affiliate links list page (`/dashboard/affiliate`)
  - Create new affiliate link page (`/dashboard/affiliate/new`)
  - Affiliate link details page (`/dashboard/affiliate/[affiliateId]`)
  - Edit affiliate link page (`/dashboard/affiliate/[affiliateId]/edit`)
  - Analytics dashboard (`/dashboard/affiliate/analytics`)
  - Public short link redirect (`/a/[shortCode]`)

- **Affiliate Features**
  - Link bookmarks to affiliate URLs
  - Commission rate tracking
  - Automatic short code generation
  - Click tracking and analytics
  - Conversion tracking (manual entry)
  - Earnings calculation (automatic)
  - Last 30 days click trends graph
  - Top performing links leaderboard
  - Total clicks, conversions, CVR metrics

- **Security & Advanced Features**
  - Click fraud detection (100 clicks/hour limit)
  - Link expiration dates
  - Auto-disable expired links
  - Suspicious activity logging
  - QR code generator for each link
  - PNG download for QR codes
  - Copy link functionality

- **Affiliate Components**
  - `affiliate-link-item.tsx` - Link card with copy
  - `qr-code-generator.tsx` - QR code generation
  - Loading, empty, and error states

#### Link Groups Improvements
- **UI/UX Enhancements**
  - Better empty states with EmptyState component
  - Clear call-to-action buttons
  - Premium feature gating
  - Improved link group cards
  - Copy URL functionality with visual feedback
  - Better hover effects
  - Skeleton loading states
  - Proper suspense boundaries

- **Analytics Features**
  - Total views metric
  - Total clicks metric
  - Click rate (engagement) calculation
  - Top performing links (top 5)
  - Individual link performance tracking

#### Reusable UI Components
- **New Components Created**
  - `empty-state.tsx` - Consistent empty state design
  - `loading-spinner.tsx` - Loading indicators
  - `error-state.tsx` - Error handling UI
  - `skeleton.tsx` - Loading placeholders

### 🐛 Bug Fixes

- Fixed hydration mismatch error in link groups
  - Removed `window.location.origin` usage
  - Use `baseUrl` prop from server instead
  - Consistent URL rendering

- Fixed affiliate link creation
  - Added missing `bookmark_id` column
  - Fixed earnings calculation
  - Removed reliance on database triggers

### 🗑️ Removed

- Removed unused affiliate test endpoints
  - `/api/affiliate/click` (unused)
  - `/api/affiliate/test-conversion` (development only)
  - Test conversion button from UI

### 🔧 Database Migrations

- **Migration 006**: `add_bookmark_id_to_affiliate_links.sql`
  - Added `bookmark_id` column with foreign key
  - Renamed `click_count` to `total_clicks`
  - Added `short_code` auto-generation trigger
  - Made `short_code` nullable
  - Added index on `bookmark_id`

### 📦 Dependencies Added

```json
{
  "qrcode": "^1.5.x"
}
```

### 🎨 UI/UX Patterns

- Server/Client component separation
- Proper data fetching patterns
- Optimistic updates
- Consistent loading states
- Error boundaries
- Premium feature gates

### 📈 Performance Optimizations

- **Database**
  - Indexed columns for faster queries
  - Efficient join operations
  - Proper use of `select` for specific fields

- **Frontend**
  - Server-side rendering where possible
  - Client components only when needed
  - Lazy loading for heavy components
  - Skeleton loaders for better UX

### 🔐 Security Enhancements

- Click fraud detection (rate limiting)
- Link expiration dates
- Auto-disable expired links
- Server-side validation
- RLS policies respected
- User authentication checks
- Input validation
- SQL injection prevention

### 📝 Documentation

- Created `COMPLETED_FEATURES_v0.5.0.md`
- Updated `tasks.md` (Task 11 complete, Task 13 enhanced)
- Database migrations documented

---

## [0.3.0] - 2025-10-01

### ✅ Eklenenler

#### Premium Posts Sistemi
- **Premium Post Pages** (`src/app/(app)/dashboard/posts/`)
  - Premium post oluşturma sayfası (`/dashboard/posts/new`)
  - Premium post listeleme sayfası (`/dashboard/posts`)
  - Premium post detay sayfası (`/dashboard/posts/[postId]`)
  - Markdown desteği (react-markdown paketi)
  - Multiple media URLs (images, videos, documents)
  - Privacy controls (subscribers, premium, private)
  - View/like/comment tracking
  - Premium özellik kontrolü ve upgrade CTA
  - Rich content rendering (Markdown, HTML, Plain Text)

#### Link Groups (Linktree-like Feature)
- **Link Group Management** (`src/app/(app)/dashboard/link-groups/`)
  - Link group oluşturma sayfası (`/dashboard/link-groups/new`)
  - Link group listeleme sayfası (`/dashboard/link-groups`)
  - Link group detay ve yönetim sayfası (`/dashboard/link-groups/[groupId]`)
  - Link ekleme, düzenleme, pozisyon yönetimi
  - Theme customization (colors, button styles, backgrounds)
  - Click ve view analytics

- **Public Link Group Page** (`src/app/(public)/l/[username]/[slug]/page.tsx`)
  - Responsive, mobile-first public link sayfası
  - Theme-based styling (dynamic colors, button styles)
  - SEO optimized (meta tags, Open Graph)
  - Profile integration (avatar, bio)

- **Click Tracking API** (`src/app/api/link-redirect/[itemId]/route.ts`)
  - Link tıklama tracking
  - Click count incrementing
  - Redirect to external URL

#### Analytics Dashboard
- **Analytics Page** (`src/app/(app)/dashboard/analytics/page.tsx`)
  - Comprehensive analytics dashboard
  - Bookmarks metrics (total, public/private, likes, views)
  - Collections metrics (total, bookmarks, followers)
  - Premium posts metrics (views, likes)
  - Link groups metrics (views, clicks)
  - Social stats (followers, following, total likes)
  - Premium/Free user differentiation
  - Upgrade CTA for free users

#### Collections Enhancements
- Collection detail page improvements
- Public collection view username support
- "View Public Page" button added
- Collection statistics tracking

### 🔧 Teknik İyileştirmeler

- **Dependencies**
  - `react-markdown` paketi eklendi (Premium posts için)
  - Markdown rendering desteği

- **API Endpoints**
  - Link redirect tracking endpoint
  - Premium post CRUD endpoints
  - Link groups CRUD endpoints

- **Database Queries**
  - Analytics data aggregation
  - Premium feature checks
  - View count tracking
  - Click count tracking

### 🎨 UI/UX İyileştirmeleri

- Premium feature gates (upgrade CTAs)
- Responsive card layouts
- Icon-based metrics displays
- Empty state designs
- Loading states

---

## [0.2.0] - 2024-09-30

### Added

#### Bookmark Components & Pages
- **Bookmark List Component** (`src/components/bookmarks/bookmark-list.tsx`)
  - Grid ve list görünüm modları
  - Lucide React ikonları (Pencil, Trash2) kullanımı
  - SEO uyumlu `/bookmarks/[id]/[slug]` URL yapısı
  - Slug yoksa title'dan otomatik slug üretimi
  - Privacy level badges (Public, Private, Subscribers only)
  - Tag ve collection gösterimi
  - Favicon ve image desteği

- **Bookmark Detail Page** (`src/app/(marketing)/bookmarks/[id]/[slug]/page.tsx`)
  - Tam özellikli bookmark detay sayfası
  - BookmarkDetailPreview komponenti: Resim, başlık, açıklama, taglar, like/save/share butonları
  - BookmarkDetailSidebar komponenti: İstatistikler, koleksiyonlar, ilgili bookmarklar, paylaşım seçenekleri
  - BookmarkComments komponenti: Yorum sistemi (ekleme, yanıtlama, beğenme)
  - Breadcrumb navigation
  - Marketing layout (header + footer)
  - Database'den koleksiyon verisi çekme

#### Tag System
- **Tag Detail Page** (`src/app/(marketing)/tags/[slug]/page.tsx`)
  - TagHeader: Tag bilgileri, istatistikler, follow butonu
  - TagFilters: Filtreleme (sort, date range, type, domain)
  - TagBookmarkCard: Bookmark kartları liste görünümü
  - TagSidebar: İstatistikler, ilgili taglar, top contributors, popular domains
  - Breadcrumb navigation
  - Mock data ile örnek içerik

- **Dashboard Tags Page** (`src/app/(app)/dashboard/tags/page.tsx`)
  - Kullanıcının bookmarklarında kullandığı tagların listesi
  - Tag başına istatistikler (kullanıcının kullanım sayısı, toplam kullanım)
  - Trending badge desteği
  - Renkli tag ikonları
  - "View Tag" ve "Filter Bookmarks" aksiyonları
  - Empty state mesajı

#### Marketing Layout
- **Footer Eklendi** (`src/app/(marketing)/layout.tsx`)
  - MarketingFooter komponenti tüm marketing sayfalarına eklendi
  - Product, Company, Legal linkleri
  - Social media ikonları
  - Copyright bilgisi

### Fixed

#### API & Database
- **Tag API Endpoint** (`src/app/api/tags/[slug]/route.ts`)
  - `is_public` field'ı `privacy_level` ile değiştirildi
  - Olmayan kolonlar kaldırıldı: `view_count`, `like_count`, `comment_count`
  - Privacy filtering: Sadece `privacy_level: 'public'` bookmarklar gösteriliyor
  - bookmark_tags relation eklendi

#### Hydration & Rendering Issues
- `toLocaleString()` kullanımı kaldırıldı (server/client mismatch)
- `Date.now()` yerine sabit tarihler kullanıldı
- `onError` handler'lar client component'lerde olmayan yerlerden kaldırıldı
- Server component uyumlu yapı

#### Dashboard Bookmarks
- Slug field'ı database query'sine eklendi
- Slug yoksa title'dan otomatik slug üretimi
- `/bookmarks/[id]/[slug]` formatında public bookmark linklerine yönlendirme

### Changed

- **Icon System**: Font Awesome yerine Lucide React ikonları kullanımı
- **URL Structure**: Bookmarklar için SEO uyumlu slug-based URL'ler
- **Privacy System**: `is_public` yerine `privacy_level` field'ı kullanımı

### Technical Improvements

- Server-side rendering optimizasyonları
- Type safety iyileştirmeleri
- Client/Server component ayrımı
- Database query optimizasyonları
- Error handling iyileştirmeleri

---

## [0.1.0] - 2024-01-10

### Eklenenler
- İlk proje kurulumu
- Temel auth sistemi
- Bookmark CRUD işlemleri
- Tag sistemi
- SEO optimizasyonları
- Database schema

---

## Component Structure

### Premium Posts
```
src/app/(app)/dashboard/posts/
├── page.tsx                    # Post listesi
├── new/page.tsx               # Post oluşturma
└── [postId]/page.tsx          # Post detay
```

### Link Groups
```
src/app/(app)/dashboard/link-groups/
├── page.tsx                    # Link group listesi
├── new/page.tsx               # Link group oluşturma
└── [groupId]/page.tsx         # Link group yönetimi

src/app/(public)/l/[username]/[slug]/
└── page.tsx                   # Public link page
```

### Analytics
```
src/app/(app)/dashboard/analytics/
└── page.tsx                   # Analytics dashboard
```

### Bookmarks
```
src/components/bookmarks/
├── bookmark-list.tsx              # List/Grid görünüm
├── bookmark-detail-preview.tsx    # Detay sayfa önizleme
├── bookmark-detail-sidebar.tsx    # Detay sayfa sidebar
└── bookmark-comments.tsx          # Yorum sistemi
```

### Tags
```
src/components/tags/
├── tag-header.tsx                 # Tag başlık bölümü
├── tag-filters.tsx                # Filtreleme
├── tag-bookmark-card.tsx          # Bookmark kartı
└── tag-sidebar.tsx                # Sidebar
```

---

## Notes

- Tüm yeni sayfalar SEO optimizasyonlu
- Marketing sayfaları public, dashboard sayfaları authenticated
- Responsive tasarım (mobile-first)
- Accessibility (ARIA labels, semantic HTML)
- Type-safe TypeScript kullanımı
- Premium features gated with upgrade CTAs
