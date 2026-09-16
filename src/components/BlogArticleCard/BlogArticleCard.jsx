import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card/Card.jsx";

function formatLongPostDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(parsedDate)
    .toUpperCase();
}

function formatShortPostDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split("T")[0].split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function formatViewsCount(viewsCount) {
  const safeViews = Number.isFinite(Number(viewsCount)) ? Number(viewsCount) : 0;
  return new Intl.NumberFormat("pt-BR").format(safeViews);
}

export default function BlogArticleCard({
  post,
  titleAs: Title = "h2",
  className = "",
  featured = false,
}) {
  const imageSource = featured ? post.image || post.thumbnail : post.thumbnail;
  const linkLabel = featured ? "Ler a matéria" : "Ler mais";

  return (
    <Card
      as={Link}
      to={post.path}
      aria-label={`${linkLabel}: ${post.title}`}
      title={`${linkLabel}: ${post.title}`}
      className={`blog-card clickable-card ${featured ? "blog-card-featured" : ""} ${className}`.trim()}
      key={post.slug}
    >
      {imageSource && (
        <img
          className="blog-card-image"
          src={imageSource}
          alt={`Capa do artigo: ${post.title}`}
          title={`Capa do artigo: ${post.title}`}
          loading={featured ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={featured ? "high" : "auto"}
          width="800"
          height="500"
        />
      )}
      <div className="blog-card-body">
        <p className="blog-card-kicker">
          <span className="blog-card-category">{post.category}</span>
          {featured && (
            <time dateTime={post.publishedAt}>{formatLongPostDate(post.publishedAt)}</time>
          )}
        </p>
        <Title className="blog-card-title">{post.title}</Title>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        {!featured && (
          <p className="blog-card-meta">
            <time dateTime={post.publishedAt}>{formatShortPostDate(post.publishedAt)}</time>
            <span>{post.readingTime}</span>
            <span className="blog-card-views">
              <Eye aria-hidden="true" />
              <span className="visually-hidden">Visualizacoes:</span>
              {formatViewsCount(post.viewsCount)}
            </span>
          </p>
        )}
        <span className="blog-card-link">
          {linkLabel} <span aria-hidden="true">-&gt;</span>
        </span>
      </div>
    </Card>
  );
}
