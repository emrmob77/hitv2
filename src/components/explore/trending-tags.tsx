import Link from "next/link";

interface TrendingTag {
  name: string;
  slug: string;
  count?: number;
}

interface TrendingTagsProps {
  tags: TrendingTag[];
}

export function TrendingTags({ tags }: TrendingTagsProps) {
  return (
    <div className="sticky top-[420px] rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="mb-3 text-base font-semibold text-neutral-900">
        Trending Tags
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tag/${tag.slug}`}
            className="cursor-pointer rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 transition hover:bg-neutral-200"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
