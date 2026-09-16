import { useState } from "react";

export function useContactForm({ formAction }) {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("muted");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const project = String(formData.get("project") || "").trim();

    if (!name || !email || !project) {
      setStatusType("error");
      setStatus("Preencha nome, e-mail e uma breve descrição do projeto.");
      return;
    }

    setIsSubmitting(true);
    setStatusType("muted");
    setStatus("");

    try {
      const response = await fetch(formAction, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.errors?.map((error) => error.message).join(", ") ||
          "Erro ao enviar. Tente novamente.";
        setStatusType("error");
        setStatus(message);
        return;
      }

      form.reset();
      setStatusType("success");
      setStatus("Mensagem enviada com sucesso. Em breve entrarei em contato.");
    } catch {
      setStatusType("error");
      setStatus("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    status,
    statusType,
    isSubmitting,
    handleSubmit,
  };
}