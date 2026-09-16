export function mapBlogPost(row) {
  return {
    slug: row.slug,
    path: `/blog/${row.slug}`,
    canonicalUrl: row.canonical_url,
    title: row.title,
    excerpt: row.excerpt,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    image: row.image,
    thumbnail: row.thumbnail || row.image,
    authorId: row.author_id,
    author: row.author,
    category: row.category,
    publishedAt: row.published_at,
    viewsCount: row.views_count ?? 0,
    readingTime: row.reading_time,
    intro: row.intro,
    content: row.content,
    sections: row.sections || [],
  };
}

export function mapProject(row) {
  return {
    slug: row.slug,
    path: `/cases/${row.slug}`,
    title: row.title,
    badge: row.badge || row.type || "Site",
    publishedAt: row.published_at,
    description: row.description,
    fullDescription: row.full_description,
    metaDescription: row.meta_description,
    seoTitle: row.seo_title || row.title,
    seoDescription: row.seo_description || row.meta_description || row.description,
    image: row.image,
    thumbnail: row.thumbnail || null,
    galleryImages: [row.image_2, row.image_3, row.image_4, row.image_5].filter(Boolean),
    alt: row.alt,
    externalUrl: row.external_url,
  };
}
