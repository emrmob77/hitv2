export type NormalizedTag = {
  name: string;
  slug: string;
};

export function generateTagSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200) || 'tag';
}

export function parseTags(raw: unknown): NormalizedTag[] {
  if (typeof raw !== 'string') {
    return [];
  }

  const tokens = raw
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean)
    .map(token => token.replace(/^#+/, ''));

  const unique = new Map<string, NormalizedTag>();

  for (const token of tokens) {
    const slug = generateTagSlug(token);
    if (!slug || unique.has(slug)) {
      continue;
    }

    unique.set(slug, {
      name: token,
      slug,
    });
  }

  return Array.from(unique.values());
}
