# Changelog

## [Unreleased] - 2025-09-30

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

## Component Structure

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

### Pages
```
src/app/
├── (marketing)/
│   ├── bookmarks/[id]/[slug]/     # Public bookmark detay
│   ├── tags/[slug]/               # Public tag sayfası
│   └── layout.tsx                 # Marketing layout (header + footer)
└── (app)/dashboard/
    ├── bookmarks/                 # Dashboard bookmarks
    └── tags/                      # Dashboard tags
```

---

## Notes

- Tüm yeni sayfalar SEO optimizasyonlu
- Marketing sayfaları public, dashboard sayfaları authenticated
- Responsive tasarım (mobile-first)
- Accessibility (ARIA labels, semantic HTML)
- Type-safe TypeScript kullanımı
