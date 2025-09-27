# HitTags - Product Requirements Document (PRD)

## 1. Ürün Genel Bakış

### 1.1 Ürün Adı
HitTags - Sosyal Bookmark Platformu

### 1.2 Ürün Vizyonu
Kullanıcıların web içeriklerini organize etmesini, keşfetmesini ve paylaşmasını sağlayan sosyal bookmark platformu.

### 1.3 Hedef Kitle
- İçerik küratörleri
- Araştırmacılar ve öğrenciler
- Sosyal medya kullanıcıları
- Premium içerik üreticileri

## 2. Sayfa Yapısı ve Özellikler

### 2.1 Ana Sayfa (Home Page)
**Amaç:** Kullanıcıları karşılama ve platform özelliklerini tanıtma

**Bileşenler:**
- Hero section (ana başlık ve CTA)
- Özellik kartları
- Sosyal kanıt (kullanıcı sayıları, testimonials)
- Fiyatlandırma önizlemesi
- Footer

**Tasarım Gereksinimleri:**
- Modern, temiz tasarım
- Responsive layout
- Hızlı yükleme
- CTA butonları belirgin

### 2.2 Keşfet Sayfası (Explorer Page)
**Amaç:** Popüler içerikleri ve trendleri gösterme

**Bileşenler:**
- Arama çubuğu
- Filtre seçenekleri (kategori, tarih, popülerlik)
- Bookmark kartları (grid layout)
- Sonsuz scroll
- Sidebar (trending tags, önerilen kullanıcılar)

**Etkileşimler:**
- Bookmark beğenme
- Hızlı kaydetme
- Paylaşma
- Kullanıcı profiline gitme

### 2.3 Trend Sayfası (Trending Page)
**Amaç:** En popüler içerikleri ve eğilimleri gösterme

**Bileşenler:**
- Zaman filtresi (bugün, hafta, ay)
- Trending bookmark listesi
- Popüler taglar
- Yükselen kullanıcılar
- İstatistik kartları

### 2.4 Profil Sayfası (Profile Page)
**Amaç:** Kullanıcı profilini ve içeriklerini gösterme

**Bileşenler:**
- Profil bilgileri (avatar, bio, istatistikler)
- Takip/takipçi sayıları
- Bookmark koleksiyonları
- Aktivite akışı
- Ayarlar menüsü (kendi profili ise)

**Sekme Yapısı:**
- Bookmarklar
- Koleksiyonlar
- Beğeniler
- Takipçiler/Takip Edilenler

### 2.5 Koleksiyon Sayfası (Collection Page)
**Amaç:** Belirli bir koleksiyonu detaylı gösterme

**Bileşenler:**
- Koleksiyon başlığı ve açıklaması
- Bookmark listesi
- Koleksiyon istatistikleri
- Paylaşma seçenekleri
- Düzenleme araçları (sahip ise)

### 2.6 Bookmark Ekleme Sayfası (Add Page)
**Amaç:** Yeni bookmark ekleme

**Form Alanları:**
- URL girişi
- Başlık (otomatik doldurulur)
- Açıklama
- Tag seçimi/ekleme
- Koleksiyon seçimi
- Gizlilik ayarları
- Önizleme

**Özellikler:**
- URL'den otomatik meta veri çekme
- Tag önerileri
- Koleksiyon önerileri
- Taslak kaydetme

### 2.7 Tag Detay Sayfası (Tag Detail)
**Amaç:** Belirli bir tag ile ilgili içerikleri gösterme

**Bileşenler:**
- Tag bilgileri ve istatistikleri
- İlgili bookmarklar
- Benzer taglar
- Tag takip etme seçeneği
- Filtre seçenekleri

### 2.8 Bookmark Detay Sayfası (Bookmark Detail)
**Amaç:** Bookmark detaylarını ve etkileşimleri gösterme

**Bileşenler:**
- Bookmark önizlemesi
- Detaylı bilgiler
- Yorumlar bölümü
- Beğeni/kaydetme butonları
- Paylaşma seçenekleri
- İlgili bookmarklar

### 2.9 Giriş/Kayıt Sayfası (Login/Register)
**Amaç:** Kullanıcı kimlik doğrulama

**Özellikler:**
- Email/şifre girişi
- Sosyal medya girişi (Google, GitHub)
- Kayıt formu
- Şifre sıfırlama
- Email doğrulama

### 2.10 Fiyatlandırma Sayfası (Pricing)
**Amaç:** Abonelik planlarını gösterme

**Bileşenler:**
- Plan karşılaştırma tablosu
- Özellik listesi
- Fiyat bilgileri
- CTA butonları
- SSS bölümü

### 2.11 Admin Dashboard
**Amaç:** Platform yönetimi

**Bileşenler:**
- Genel istatistikler
- Kullanıcı yönetimi
- İçerik moderasyonu
- Analitik raporları
- Sistem ayarları

### 2.12 Admin SEO Ayarları
**Amaç:** SEO optimizasyonu

**Özellikler:**
- Meta tag yönetimi
- Sitemap oluşturma
- Robot.txt düzenleme
- Analytics entegrasyonu

## 3. Kullanıcı Akışları

### 3.1 Yeni Kullanıcı Onboarding
1. Ana sayfaya giriş
2. Kayıt olma
3. Email doğrulama
4. Profil tamamlama
5. İlk bookmark ekleme
6. Kullanıcı takip etme önerileri

### 3.2 Bookmark Ekleme Akışı
1. "+" butonuna tıklama
2. URL girişi
3. Otomatik meta veri çekme
4. Detay düzenleme
5. Tag ve koleksiyon seçimi
6. Kaydetme

### 3.3 İçerik Keşfetme Akışı
1. Keşfet sayfasına giriş
2. Filtre uygulama
3. Bookmark inceleme
4. Beğenme/kaydetme
5. Profil ziyareti
6. Takip etme

## 4. Teknik Gereksinimler

### 4.1 Performans
- Sayfa yükleme süresi < 3 saniye
- Sonsuz scroll optimizasyonu
- Resim lazy loading
- CDN kullanımı

### 4.2 Responsive Tasarım
- Mobile-first yaklaşım
- Tablet ve desktop uyumluluğu
- Touch-friendly etkileşimler
- Adaptive layout

### 4.3 Erişilebilirlik
- WCAG 2.1 AA uyumluluğu
- Klavye navigasyonu
- Screen reader desteği
- Yüksek kontrast modu

### 4.4 SEO Optimizasyonu
- Semantic HTML
- Meta tag optimizasyonu
- Open Graph desteği
- Structured data markup

## 5. Tasarım Sistemi

### 5.1 Renk Paleti
**Ana Renkler:**
- Primary: #3B82F6 (Mavi)
- Secondary: #10B981 (Yeşil)
- Accent: #F59E0B (Turuncu)

**Nötr Renkler:**
- Gray-50: #F9FAFB
- Gray-100: #F3F4F6
- Gray-500: #6B7280
- Gray-900: #111827

### 5.2 Tipografi
**Font Ailesi:** Inter, system-ui, sans-serif

**Font Boyutları:**
- Heading 1: 2.5rem (40px)
- Heading 2: 2rem (32px)
- Heading 3: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

### 5.3 Spacing
**Grid Sistemi:** 8px base unit
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### 5.4 Bileşenler

#### 5.4.1 Butonlar
**Primary Button:**
- Background: Primary color
- Text: White
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: 600

**Secondary Button:**
- Background: Transparent
- Border: 2px solid primary
- Text: Primary color
- Padding: 10px 22px

#### 5.4.2 Kartlar
**Bookmark Card:**
- Background: White
- Border: 1px solid gray-200
- Border-radius: 12px
- Padding: 16px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

#### 5.4.3 Form Elemanları
**Input Field:**
- Border: 1px solid gray-300
- Border-radius: 8px
- Padding: 12px 16px
- Focus: Border-color primary

### 5.5 İkonlar
- Feather Icons kullanımı
- 24px standart boyut
- Stroke-width: 2px
- Tutarlı stil

## 6. Etkileşim Tasarımı

### 6.1 Hover Efektleri
- Butonlar: Renk koyulaşması
- Kartlar: Gölge artışı
- Linkler: Alt çizgi
- İkonlar: Renk değişimi

### 6.2 Animasyonlar
- Sayfa geçişleri: 300ms ease-in-out
- Hover efektleri: 200ms ease
- Loading animasyonları: Skeleton screens
- Micro-interactions: Subtle feedback

### 6.3 Loading States
- Skeleton screens
- Progress indicators
- Spinner animations
- Lazy loading placeholders

## 7. Mobil Tasarım Gereksinimleri

### 7.1 Navigation
- Bottom tab bar
- Hamburger menu
- Swipe gestures
- Pull-to-refresh

### 7.2 Touch Targets
- Minimum 44px boyut
- Yeterli spacing
- Thumb-friendly yerleşim
- Gesture support

### 7.3 Mobile-Specific Features
- Swipe actions
- Long press menus
- Native sharing
- Offline support

## 8. Başarı Metrikleri

### 8.1 Kullanıcı Metrikleri
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention rate
- Session duration

### 8.2 Engagement Metrikleri
- Bookmarks per user
- Comments per bookmark
- Likes per bookmark
- Collections created

### 8.3 Business Metrikleri
- Conversion rate (free to premium)
- Monthly recurring revenue (MRR)
- Churn rate
- Customer lifetime value (CLV)

## 9. Gelecek Özellikler

### 9.1 Kısa Vadeli (3 ay)
- Browser extension
- Mobile app
- Advanced search
- Bulk operations

### 9.2 Orta Vadeli (6 ay)
- AI-powered recommendations
- Content categorization
- Team collaboration
- API access

### 9.3 Uzun Vadeli (12 ay)
- Machine learning insights
- Advanced analytics
- White-label solution
- Enterprise features

---

Bu PRD, Figma, UXPin veya Google Sites gibi tasarım araçlarında kullanılmak üzere hazırlanmıştır. Her bölüm detaylı wireframe ve mockup oluşturma için gerekli bilgileri içermektedir.