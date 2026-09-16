import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient.js";
import Button from "../ui/Button/Button.jsx";

const initialForm = {
  name: "",
  email: "",
  content: "",
  website: "",
};

function formatCommentDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function BlogComments({ postSlug }) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      if (!isSupabaseConfigured || !postSlug) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("blog_comments")
        .select("id, post_slug, author_name, content, created_at")
        .eq("post_slug", postSlug)
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (!error) setComments(data || []);
      setIsLoading(false);
    }

    setIsLoading(true);
    loadComments();

    return () => {
      isMounted = false;
    };
  }, [postSlug]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || !isSupabaseConfigured) return;

    setIsSubmitting(true);
    setStatus("");

    const { data, error } = await supabase.rpc("submit_blog_comment", {
      p_post_slug: postSlug,
      p_author_name: form.name,
      p_author_email: form.email,
      p_content: form.content,
      p_website: form.website,
    });

    if (error) {
      setStatus(error.message || "Não foi possível publicar o comentário.");
      setStatusType("error");
    } else {
      const publishedComment = data?.[0];
      if (publishedComment) {
        setComments((current) => [publishedComment, ...current]);
      }
      setForm((current) => ({ ...current, content: "", website: "" }));
      setStatus("Comentário publicado com sucesso.");
      setStatusType("success");
    }

    setIsSubmitting(false);
  }

  return (
    <section className="blog-comments" aria-labelledby="blog-comments-title">
      <div className="blog-comments-header">
        <p className="eyebrow">Comunidade</p>
        <h2 id="blog-comments-title">Comentários</h2>
      </div>

      <form className="blog-comments-form" onSubmit={handleSubmit}>
        <div className="blog-comments-fields">
          <div className="field">
            <label htmlFor="comment-name">Nome</label>
            <input
              className="input"
              id="comment-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
              placeholder="Seu nome"
            />
          </div>

          <div className="field">
            <label htmlFor="comment-email">E-mail</label>
            <input
              className="input"
              id="comment-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
              placeholder="voce@exemplo.com"
            />
          </div>
        </div>

        <div className="field blog-comments-message">
          <label htmlFor="comment-content">Comentário</label>
          <textarea
            className="textarea"
            id="comment-content"
            name="content"
            value={form.content}
            onChange={handleChange}
            minLength={2}
            maxLength={2000}
            required
            placeholder="Escreva seu comentário..."
          />
          <span className="meta">{form.content.length}/2000 caracteres</span>
        </div>

        <div className="blog-comments-honeypot" aria-hidden="true">
          <label htmlFor="comment-website">Website</label>
          <input
            id="comment-website"
            name="website"
            value={form.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="blog-comments-submit">
          <Button as="button" type="submit" variant="dark" disabled={isSubmitting || !isSupabaseConfigured}>
            {isSubmitting ? "Publicando..." : "Publicar comentário"}
          </Button>
          <p className="meta">Seu e-mail é obrigatório, mas não será exibido publicamente.</p>
        </div>

        {status && (
          <p
            className="status"
            role="status"
            aria-live="polite"
            style={{ color: statusType === "error" ? "var(--danger)" : "var(--success)" }}
          >
            {status}
          </p>
        )}
      </form>

      <div className="blog-comments-list" aria-live="polite">
        {isLoading && <p className="meta">Carregando comentários...</p>}
        {!isLoading && comments.length === 0 && (
          <p className="meta">Ainda não há comentários. Seja a primeira pessoa a comentar.</p>
        )}
        {comments.map((comment) => (
          <article className="blog-comment" key={comment.id}>
            <div className="blog-comment-heading">
              <strong>{comment.author_name}</strong>
              <time dateTime={comment.created_at}>{formatCommentDate(comment.created_at)}</time>
            </div>
            <p>{comment.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
