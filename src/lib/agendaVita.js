const baseUrl = import.meta.env.VITE_AGENDAVITA_URL;
const anonKey = import.meta.env.VITE_AGENDAVITA_ANON_KEY;
const organizationSlug = import.meta.env.VITE_AGENDAVITA_ORGANIZATION_SLUG;

export async function agendaVita(action, payload = {}) {
  if (!baseUrl || !anonKey || !organizationSlug) throw new Error('A agenda ainda não foi configurada para este site.');
  const response = await fetch(`${baseUrl}/functions/v1/public-booking`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, slug: organizationSlug, ...payload }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error) throw new Error(data?.error || 'Não foi possível concluir a solicitação.');
  return data;
}
