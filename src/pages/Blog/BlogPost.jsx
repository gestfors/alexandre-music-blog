import { ArrowLeft, CalendarDays, Clock, Eye, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import BlogComments from "../../components/BlogComments/BlogComments.jsx";
import BlogShare from "../../components/BlogShare/BlogShare.jsx";
import Layout from "../../components/layout/Layout/Layout.jsx";
import RichTextContent from "../../components/RichTextContent/RichTextContent.jsx";
import SEO from "../../components/seo/SEO.jsx";
import { useSupabaseItem } from "../../hooks/useSupabaseContent.js";
import { mapBlogPost } from "../../lib/contentMappers.js";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient.js";
import { absoluteUrl, siteSeo } from "../../utils/seo.js";
import NotFound from "../NotFound/NotFound.jsx";

const BLOG_VISITOR_KEY_STORAGE = "od_blog_visitor_key";
const BLOG_VIEWED_POSTS_STORAGE = "od_blog_viewed_posts";
const pendingViewRegistrations = new Set();

function getViewedPostSlugs() {
  if (typeof window === "undefined") return new Set();

  try {
    const rawValue = window.localStorage.getItem(BLOG_VIEWED_POSTS_STORAGE);
    if (!rawValue) return new Set();

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return new Set();

    return new Set(parsed.filter((value) => typeof value === "string"));
  } catch {
    return new Set();
  }
}

function hasRegisteredPostView(postSlug) {
  if (!postSlug) return false;
  return getViewedPostSlugs().has(postSlug);
}

function markPostViewAsRegistered(postSlug) {
  if (!postSlug || typeof window === "undefined") return;

  try {
    const viewedPosts = getViewedPostSlugs();
    viewedPosts.add(postSlug);
    window.localStorage.setItem(
      BLOG_VIEWED_POSTS_STORAGE,
      JSON.stringify(Array.from(viewedPosts)),
    );
  } catch {
    // Ignora falhas de storage para não quebrar a renderização do artigo.
  }
}

function getPostParagraphs(post) {
  if (post.content) {
    return post.content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return post.sections.map((section) => section.body).filter(Boolean);
}

function getIntroParagraphs(intro = "") {
  return intro
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function hasHtmlContent(content = "") {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

function formatPostDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split("T")[0].split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function formatViewsCount(viewsCount) {
  const safeViews = Number.isFinite(Number(viewsCount)) ? Number(viewsCount) : 0;
  return new Intl.NumberFormat("pt-BR").format(safeViews);
}

function getOrCreateVisitorKey() {
  if (typeof window === "undefined") return null;

  try {
    const existingKey = window.localStorage.getItem(BLOG_VISITOR_KEY_STORAGE);
    if (existingKey) return existingKey;

    const createdKey = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(BLOG_VISITOR_KEY_STORAGE, createdKey);
    return createdKey;
  } catch {
    return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const { search } = useLocation();
  const isPreview = new URLSearchParams(search).get("preview") === "1";
  const { item: post, isLoading } = useSupabaseItem({
    table: "blog_posts",
    slug,
    mapper: mapBlogPost,
    publishedOnly: !isPreview,
  });
  const [viewsCount, setViewsCount] = useState(0);
  const [authorProfile, setAuthorProfile] = useState(null);

  useEffect(() => {
    setViewsCount(post?.viewsCount ?? 0);
  }, [post?.slug, post?.viewsCount]);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthorProfile() {
      if (!isSupabaseConfigured || (!post?.authorId && !post?.author)) {
        if (isMounted) setAuthorProfile(null);
        return;
      }

      let query = supabase
        .from("blog_authors")
        .select("id, photo, name, bio, instagram_handle, instagram_url");

      query = post.authorId
        ? query.eq("id", post.authorId)
        : query.eq("name", post.author);

      const { data, error } = await query.maybeSingle();
      if (isMounted) setAuthorProfile(error ? null : data);
    }

    setAuthorProfile(null);
    loadAuthorProfile();

    return () => {
      isMounted = false;
    };
  }, [post?.author, post?.authorId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !post?.slug) return;

    if (hasRegisteredPostView(post.slug) || pendingViewRegistrations.has(post.slug)) {
      return;
    }

    const visitorKey = getOrCreateVisitorKey();
    if (!visitorKey) return;

    let isMounted = true;

    async function registerView() {
      pendingViewRegistrations.add(post.slug);

      const { data, error } = await supabase.rpc("register_blog_post_view", {
        p_post_slug: post.slug,
        p_visitor_key: visitorKey,
      });

      pendingViewRegistrations.delete(post.slug);

      if (error || !isMounted) return;

      markPostViewAsRegistered(post.slug);

      if (Number.isFinite(Number(data))) {
        setViewsCount(Number(data));
      }
    }

    registerView();

    return () => {
      isMounted = false;
    };
  }, [post?.slug]);

  if (!post && isLoading) return null;
  if (!post) return <NotFound />;

  const paragraphs = getPostParagraphs(post);
  const introParagraphs = getIntroParagraphs(post.intro);
  const canonicalUrl = post.canonicalUrl || absoluteUrl(post.path);
  const authorName = authorProfile?.name || post.author || "Alexandre Ivo";
  const socialImage = post.thumbnail || post.image;
  const hasRichContent = hasHtmlContent(post.content);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: socialImage,
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorProfile?.instagram_url ? { url: authorProfile.instagram_url } : {}),
      ...(authorProfile?.photo ? { image: authorProfile.photo } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: siteSeo.siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/assets/images/logo.png"),
      },
    },
    datePublished: post.publishedAt,
    mainEntityOfPage: canonicalUrl,
    articleSection: post.category,
    url: canonicalUrl,
  };

  return (
    <>
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        path={post.path}
        canonical={canonicalUrl}
        image={socialImage}
        type="article"
        structuredData={structuredData}
      />
      <Layout>
        <article className="blog-article" aria-labelledby="post-title">
          <header className="blog-post-header">
            <div className="container blog-post-header-content">
              <Link className="blog-back-link" to="/blog">
                <ArrowLeft aria-hidden="true" />
                <span>Voltar para o blog</span>
              </Link>
              <span className="blog-post-category">{post.category}</span>
              <h1 id="post-title">{post.title}</h1>
              <p className="blog-post-meta">
                <span className="blog-meta-item">
                  <CalendarDays aria-hidden="true" />
                  <span className="visually-hidden">Publicacao:</span>
                  {formatPostDate(post.publishedAt)}
                </span>
                <span className="blog-meta-item">
                  <UserRound aria-hidden="true" />
                  <span className="visually-hidden">Autor:</span>
                  {authorName}
                </span>
                <span className="blog-meta-item">
                  <Clock aria-hidden="true" />
                  <span className="visually-hidden">Leitura:</span>
                  {post.readingTime}
                </span>
                <span className="blog-meta-item">
                  <Eye aria-hidden="true" />
                  <span className="visually-hidden">Visualizacoes:</span>
                  {formatViewsCount(viewsCount)}
                </span>
              </p>
              {post.image && (
                <img
                  className="blog-post-cover"
                  src={post.image}
                  alt={post.title}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width="1200"
                  height="630"
                />
              )}
            </div>
          </header>

          <div className="section">
            <div className="container blog-article-layout">
              <div className="blog-article-content">
                {introParagraphs.map((paragraph, index) => (
                  <p className="blog-article-intro" key={`${index}-${paragraph}`}>
                    {paragraph}
                  </p>
                ))}
                {hasRichContent
                  ? <RichTextContent>{post.content}</RichTextContent>
                  : post.content
                    ? paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                    : post.sections.map((section) => (
                      <section key={section.title} className="blog-article-section">
                        <h2>{section.title}</h2>
                        <p>{section.body}</p>
                      </section>
                    ))}
              </div>
              <BlogShare title={post.title} url={canonicalUrl} />
              {authorProfile && (
                <aside className="blog-author-card" aria-labelledby="blog-author-name">
                  <div className="author-avatar">
                    <img
                      src={authorProfile.photo}
                      alt={`Foto de ${authorProfile.name}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="blog-author-card-content">
                    <p className="eyebrow">Publicado por</p>
                    <h2 id="blog-author-name">{authorProfile.name}</h2>
                    <p>{authorProfile.bio}</p>
                    <a
                      href={authorProfile.instagram_url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {authorProfile.instagram_handle}
                    </a>
                  </div>
                </aside>
              )}
            </div>
          </div>
          <div className="container blog-comments-container">
            <BlogComments postSlug={post.slug} />
          </div>
        </article>
      </Layout>
    </>
  );
}
