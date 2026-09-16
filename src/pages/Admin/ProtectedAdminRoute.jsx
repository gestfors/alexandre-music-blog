import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button/Button.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { useAdminSession } from "./useAdminSession.js";

export default function ProtectedAdminRoute({ children }) {
  const { session, isLoading } = useAdminSession();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionMetadata = session?.user?.app_metadata || session?.user?.raw_app_meta_data || {};
  const isAdmin = sessionMetadata.role === "admin";

  async function handleSignOut() {
    await supabase?.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="admin-auth">
        <p className="meta">Carregando painel...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <main className="admin-auth">
        <section className="admin-auth-card" aria-labelledby="admin-access-denied-title">
          <p className="eyebrow">Painel administrativo</p>
          <h1 id="admin-access-denied-title">Acesso não autorizado</h1>
          <p>
            Sua conta está autenticada, mas não possui a função administrativa
            necessária para acessar este painel.
          </p>
          <Button as="button" type="button" onClick={handleSignOut}>
            Sair e acessar outra conta
          </Button>
        </section>
      </main>
    );
  }

  return children;
}
