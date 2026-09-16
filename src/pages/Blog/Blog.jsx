import Layout from "../../components/layout/Layout/Layout.jsx";
import SEO from "../../components/seo/SEO.jsx";
import BlogArticleCard from "../../components/BlogArticleCard/BlogArticleCard.jsx";
import { useSupabaseList } from "../../hooks/useSupabaseContent.js";
import { Search } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const { items: posts } = useSupabaseList({
    table: "blog_posts",
    orderBy: "published_at",
    ascending: false,
    select: "slug,title,excerpt,image,thumbnail,category,reading_time,published_at",
    limit: 6,
    publishedOnly: true,
    mapper: (post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      image: post.image || post.thumbnail,
      thumbnail: post.thumbnail || post.image,
      category: post.category,
      readingTime: post.reading_time,
      publishedAt: post.published_at,
      path: `/blog/${post.slug}`,
    }),
  });
  const { items: sidebarPromos, error: sidebarError } = useSupabaseList({
    table: "sidebar_promos",
    orderBy: "sort_order",
    ascending: true,
    select: "id,category,title,url,image,tone,sort_order",
    limit: 6,
    mapper: (promo) => promo,
  });
  const { items: heroSettings } = useSupabaseList({
    table: "blog_hero",
    orderBy: "created_at",
    ascending: true,
    select: "id,mode,image_1,image_2,image_3",
    limit: 1,
    fallback: [{ mode: "single", image_1: "/assets/images/Banner.png" }],
    mapper: (hero) => hero,
  });
  const hero = heroSettings[0];
  const heroImages = [hero?.image_1, hero?.image_2, hero?.image_3].filter(Boolean);
  const isHeroCarousel = hero?.mode === "carousel" && heroImages.length > 1;

  useEffect(() => {
    setHeroImageIndex(0);
  }, [hero?.mode, hero?.image_1, hero?.image_2, hero?.image_3]);

  useEffect(() => {
    if (!isHeroCarousel) return undefined;

    const timer = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroImages.length, isHeroCarousel]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const displayPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];

    const visiblePosts = normalizedSearch
      ? posts.filter((post) => {
          const searchableText = [post.title, post.excerpt, post.category, post.slug]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearch);
        })
      : posts;

    return visiblePosts.slice(0, 6);
  }, [normalizedSearch, posts]);

  return (
    <>
      <SEO
        title="Alexandre Music Blog"
        description="Notícias, entrevistas, lançamentos e histórias sobre música."
        path="/blog"
      />
      <Layout>
        <section
          className="blog-hero"
          aria-labelledby="blog-title"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10, 9, 20, 0.05) 0%, rgba(10, 9, 20, 0.05) 100%), url("${heroImages[heroImageIndex] || "/assets/images/Banner.png"}")`,
          }}
        >
          <div className="container blog-hero__inner">
            <div className="blog-hero__content">
              <h1 id="blog-title">BLOG DO ALEXANDRE IVO</h1>
              <p className="blog-hero__subtitle">
                Artigos para quem quer aprender a tocar, pra quem toca e pra quem apenas gosta de música
              </p>
            </div>
          </div>
        </section>

        <section className="blog-featured-banner" aria-label="Destaques do blog">
          <div className="container blog-featured-banner__inner">
            <div className="blog-featured-banner__copy">
              <p>COLEÇÃO</p>
              <h1>
                PARTITURAS<br></br>
                <strong> de NATAL</strong>
                <span> DO PROFESSOR ALEXANDRE IVO</span>
              </h1>
              <a href="#blog-main" className="blog-featured-banner__cta">
                GARANTA JÁ A SUA
              </a>
            </div>
          </div>
        </section>

        <main id="blog-main" className="blog-main-shell">
          <div className="container blog-main-grid">
            <div className="blog-main-column">
              <div className="blog-main-header">
                <h2>ÚLTIMAS NOTÍCIAS</h2>
              </div>

              <div className="blog-grid blog-grid--main">
                {displayPosts.length > 0 ? (
                  displayPosts.map((post) => (
                    <BlogArticleCard key={post.slug} post={post} className="blog-card--compact" />
                  ))
                ) : normalizedSearch ? (
                  <article className="blog-card placeholder-card" style={{ gridColumn: "1 / -1" }}>
                    <div className="blog-card-body">
                      <p className="blog-card-excerpt" style={{ display: "block", WebkitLineClamp: "unset", overflow: "visible" }}>
                        Nenhum artigo encontrado para “{searchTerm}”.
                      </p>
                    </div>
                  </article>
                ) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <article className="blog-card placeholder-card" key={`empty-${index}`}>
                      <div className="blog-card-image placeholder-image" />
                      <div className="blog-card-body">
                        <div className="placeholder-line placeholder-line--short" />
                        <div className="placeholder-line placeholder-line--large" />
                        <div className="placeholder-line placeholder-line--medium" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="blog-sidebar" aria-label="Conteúdo em destaque">
              <form
                className="blog-sidebar-search"
                role="search"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="blog-sidebar-query" className="visually-hidden">
                  Buscar artigos
                </label>
                <input
                  id="blog-sidebar-query"
                  name="query"
                  type="search"
                  aria-label="Buscar artigos"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar artigos"
                />
                <button type="submit" aria-label="Buscar">
                  <Search aria-hidden="true" />
                </button>
              </form>

              <p className="blog-sidebar-heading">
                CLIQUE E APROVEITE AS
                <span>OFERTAS</span>
              </p>

              <div className="blog-sidebar-promos">
                {sidebarPromos.map((promo) => (
                  <Fragment key={promo.title}>
                    <a
                      className={`blog-sidebar-promo blog-sidebar-promo--${promo.tone}`}
                      href={promo.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Conheça: ${promo.title}`}
                    >
                      <div
                        className="blog-sidebar-promo__image"
                        style={{ backgroundImage: `url(${promo.image})` }}
                        role="img"
                        aria-label={promo.title}
                      />
                      <div className="blog-sidebar-promo__category">
                        <small>CATEGORIA</small>
                        <strong>{promo.category}</strong>
                      </div>
                      <h3>{promo.title}</h3>
                    </a>
                  </Fragment>
                ))}
                {sidebarError && (
                  <p className="blog-sidebar-error">
                    Não foi possível carregar os cards da sidebar.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </main>
      </Layout>
    </>
  );
}
