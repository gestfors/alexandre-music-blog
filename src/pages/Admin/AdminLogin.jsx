import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button/Button.jsx";
import SEO from "../../components/seo/SEO.jsx";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient.js";
import { useAdminSession } from "./useAdminSession.js";

export default function AdminLogin() {
  const { session, isLoading } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/admin";

  if (!isLoading && session) return <Navigate to="/admin" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");

    if (!isSupabaseConfigured) {
      setStatus("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o login.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (error) {
      setStatus("Login ou senha invalidos.");
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <>
      <SEO
        title="Login administrativo | Robson Svicero"
        description="Acesso interno ao painel de conteúdo do site."
        path="/admin/login"
        robots="noindex, nofollow"
      />
      <main className="admin-auth">
        <section className="admin-auth-card" aria-labelledby="admin-login-title">
          <p className="eyebrow">Painel administrativo</p>
          <h1 id="admin-login-title">Acesse sua conta</h1>
          <p>
            Entre com o e-mail e senha cadastrados no Supabase para gerenciar
            artigos do blog e projetos.
          </p>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="admin-email">E-mail</label>
              <input
                className="input"
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Senha</label>
              <input
                className="input"
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button as="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            {status && <p className="status">{status}</p>}
          </form>
        </section>
      </main>
    </>
  );
}
