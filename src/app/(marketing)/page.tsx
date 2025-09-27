import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/40">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sosyal Bookmark Platformu
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {siteConfig.name} ile en iyi web kaynaklarını keşfedin, kaydedin ve toplulukla paylaşın.
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            HitTags, SEO-first mimarisi, güçlü etiketleme sistemi ve premium içerik akışlarıyla küresel içerik kürasyonunu kolaylaştırır. Keşfet sekmesi, trend algoritmaları ve kişiselleştirilmiş feed ile değerli bağlantıları her zaman elinizin altında tutun.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-800"
            >
              Ücretsiz Başlayın
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/50 hover:bg-muted"
            >
              Keşfet sayfasını incele →
            </Link>
          </div>
        </div>
        <div className="grid gap-6 rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:grid-cols-3">
          {[
            {
              title: "SEO-First Mimari",
              description:
                "SSR, SSG ve ISR kombinasyonu ile etiket ve koleksiyon sayfalarında maksimum görünürlük sağlayın.",
            },
            {
              title: "Zengin Sosyal Özellikler",
              description:
                "Takip, beğeni, yorum ve akıllı öneriler ile topluluğunuzu büyütün ve içerikleri öne çıkarın.",
            },
            {
              title: "Premium İçerik Akışları",
              description:
                "URL'siz paylaşımlar, medya yüklemeleri ve abonelik modelleri ile içerik üreticilerini destekleyin.",
            },
          ].map((feature) => (
            <div key={feature.title} className="space-y-3 rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
