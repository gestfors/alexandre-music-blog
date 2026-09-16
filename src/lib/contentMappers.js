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
