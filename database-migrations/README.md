# Database Migrations

Bu klasördeki migration dosyalarını Supabase'de çalıştırmanız gerekiyor.

## Premium Posts - Public Sharing Özelliği İçin Gerekli Migration'lar

### 1. Public Visibility Ekleme

Dosya: `add-public-visibility-to-posts.sql`

Bu migration, `exclusive_posts` tablosuna 'public' görünürlük seçeneği ekler.

**Supabase'de Çalıştırma:**
1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `add-public-visibility-to-posts.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. Run düğmesine tıklayın

### 2. Slug Alanı Ekleme

Dosya: `add-slug-to-posts.sql`

Bu migration:
- `exclusive_posts` tablosuna `slug` alanı ekler
- SEO-friendly URL'ler için otomatik slug oluşturma fonksiyonu ekler
- Mevcut postlar için slug'ları otomatik oluşturur

**Supabase'de Çalıştırma:**
1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `add-slug-to-posts.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. Run düğmesine tıklayın

### ⚠️ Önemli Not

Bu migration'ları çalıştırmadan premium posts'ların public paylaşım özellikleri çalışmayacaktır!

Migration'ları **sırasıyla** çalıştırın:
1. Önce `add-public-visibility-to-posts.sql`
2. Sonra `add-slug-to-posts.sql`

### Doğrulama

Migration'ların başarılı olduğunu doğrulamak için Supabase Table Editor'de:

1. `exclusive_posts` tablosunu açın
2. `slug` kolonunun eklendiğini kontrol edin
3. Yeni bir post oluşturun ve `visibility` alanında 'public' seçeneğinin olduğunu kontrol edin

### Public Post URL Formatı

Migration'lar tamamlandıktan sonra:
- Dashboard'da public visibility ile post oluşturabilirsiniz
- Public postlar `/p/[username]/[slug]` URL'inde görünür olacak
- Örnek: `/p/johndoe/my-first-public-post`
