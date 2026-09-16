export default function NotFound() {
  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <section style={{ textAlign: "center", maxWidth: "40rem" }}>
        <p style={{ margin: 0, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7a6f62" }}>
          404
        </p>
        <h1 style={{ margin: "0.5rem 0 1rem", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Página não encontrada
        </h1>
        <p style={{ margin: 0, color: "#4b453d", lineHeight: 1.6 }}>
          O endereço acessado não existe ou foi movido.
        </p>
      </section>
    </main>
  );
}
