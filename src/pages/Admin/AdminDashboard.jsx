import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ExternalLink,
  FileText,
  FolderKanban,
  LayoutDashboard,
  PanelsTopLeft,
  UserRound,
} from "lucide-react";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import SEO from "../../components/seo/SEO.jsx";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient.js";
import { sanitizeRichText } from "../../utils/richText.js";
import { clearSupabaseListCache } from "../../hooks/useSupabaseContent.js";
import { adminResources, getEmptyRecord } from "./adminConfig.js";

const mediaBucket = "site-media";
const resourceKeys = Object.keys(adminResources);
const adminNavigation = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ...(adminResources.sidebarPromos
    ? [{ key: "sidebarPromos", label: adminResources.sidebarPromos.label, icon: PanelsTopLeft }]
    : []),
  ...(adminResources.authors ? [{ key: "authors", label: adminResources.authors.label, icon: UserRound }] : []),
  ...(adminResources.posts ? [{ key: "posts", label: adminResources.posts.label, icon: FileText }] : []),
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFormValue(field, value) {
  if (field.type === "date" && value) {
    return String(value).split("T")[0];
  }
  if (field.type === "datetime-local" && value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (part) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  if (field.type !== "json") return value || "";
  if (typeof value === "string") return value;
  return JSON.stringify(value || [], null, 2);
}

function parsePayload(fields, formValues) {
  const payload = {};

  for (const field of fields) {
    const value = formValues[field.name];
    if (field.type === "json") {
      payload[field.name] = value ? JSON.parse(value) : [];
    } else if (field.type === "richtext") {
      payload[field.name] = value ? sanitizeRichText(value) : null;
    } else if (field.type === "datetime-local") {
      payload[field.name] = value ? new Date(value).toISOString() : null;
    } else {
      payload[field.name] = value || null;
    }
  }

  return payload;
}

function getFileExtension(fileName = "") {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension !== fileName ? extension : "webp";
}

function createStoragePath({ activeResource, fieldName, formValues, file }) {
  const slug = slugify(formValues.slug || formValues.title || formValues.name || "arquivo");
  const extension = getFileExtension(file.name);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${activeResource}/${slug}/${fieldName}-${timestamp}.${extension}`;
}

function formatPostPublicationDate(value) {
  if (!value) return "Sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getPostStatus(value) {
  const publishedAt = new Date(value);
  return !Number.isNaN(publishedAt.getTime()) && publishedAt <= new Date()
    ? { label: "Publicado", value: "published" }
    : { label: "Agendado", value: "scheduled" };
}

export default function AdminDashboard() {
  const [activeResource, setActiveResource] = useState("dashboard");
  const resource = adminResources[activeResource] || null;
  const emptyRecord = useMemo(
    () => (resource ? getEmptyRecord(resource.fields) : {}),
    [resource],
  );
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formValues, setFormValues] = useState(emptyRecord);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoadingFields, setImageLoadingFields] = useState([]);
  const [relationOptions, setRelationOptions] = useState({});
  const [postScreen, setPostScreen] = useState("list");
  const [postSort, setPostSort] = useState({ key: "published_at", ascending: false });

  const selectedItem = items.find((item) => item.id === selectedId);
  const isPostsResource = activeResource === "posts";
  const sortedPostItems = useMemo(() => {
    if (!isPostsResource) return [];

    return [...items].sort((first, second) => {
      const firstValue = postSort.key === "status"
        ? getPostStatus(first.published_at).value
        : first[postSort.key] || "";
      const secondValue = postSort.key === "status"
        ? getPostStatus(second.published_at).value
        : second[postSort.key] || "";
      const result = String(firstValue).localeCompare(String(secondValue), "pt-BR", {
        numeric: true,
      });
      return postSort.ascending ? result : -result;
    });
  }, [isPostsResource, items, postSort]);

  useEffect(() => {
    setSelectedId(null);
    setFormValues(emptyRecord);
    setStatus("");
    setPostScreen("list");
    if (resource) {
      loadItems();
      loadRelationOptions();
    } else {
      setItems([]);
      setRelationOptions({});
      loadDashboardStats();
    }
  }, [activeResource, emptyRecord, resource]);

  async function loadDashboardStats() {
    if (!isSupabaseConfigured) {
      setStatus("Supabase ainda não está configurado nas variáveis de ambiente.");
      return;
    }

    setIsLoading(true);
    const stats = await Promise.all(
      resourceKeys.map(async (key) => {
        const currentResource = adminResources[key];
        const { count, error } = await supabase
          .from(currentResource.table)
          .select("id", { count: "exact", head: true });

        return {
          key,
          label: currentResource.label,
          singular: currentResource.singular,
          count: error ? null : count,
          error,
        };
      }),
    );
    setIsLoading(false);

    const failedStat = stats.find((stat) => stat.error);
    if (failedStat) {
      setStatus(`Erro ao carregar dashboard: ${failedStat.error.message}`);
      return;
    }

    setDashboardStats(stats);
  }

  async function loadItems() {
    if (!resource) return;

    if (!isSupabaseConfigured) {
      setStatus("Supabase ainda não está configurado nas variáveis de ambiente.");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from(resource.table)
      .select("*")
      .order(resource.orderBy, { ascending: resource.ascending ?? false });
    setIsLoading(false);

    if (error) {
      setStatus(`Erro ao carregar ${resource.label.toLowerCase()}: ${error.message}`);
      return;
    }

    setItems(data || []);
  }

  async function loadRelationOptions() {
    if (!resource || !isSupabaseConfigured) return;

    const relationFields = resource.fields.filter((field) => field.type === "relationSelect");
    if (relationFields.length === 0) {
      setRelationOptions({});
      return;
    }

    const entries = await Promise.all(
      relationFields.map(async (field) => {
        const relation = field.relation;
        const { data, error } = await supabase
          .from(relation.table)
          .select(`${relation.valueField}, ${relation.labelField}`)
          .order(relation.orderBy || relation.labelField, { ascending: true });

        if (error) return [field.name, []];
        return [
          field.name,
          (data || []).map((item) => ({
            value: item[relation.valueField],
            label: item[relation.labelField],
          })),
        ];
      }),
    );

    setRelationOptions(Object.fromEntries(entries));
  }

  function startCreate() {
    if (!resource) return;
    setSelectedId(null);
    setFormValues(emptyRecord);
    setStatus("");
    if (isPostsResource) setPostScreen("create");
  }

  function startEdit(item) {
    if (!resource) return;
    const nextValues = {};
    for (const field of resource.fields) {
      nextValues[field.name] = normalizeFormValue(field, item[field.name]);
    }
    setSelectedId(item.id);
    setFormValues(nextValues);
    setStatus("");
    if (isPostsResource) setPostScreen("edit");
  }

  function previewPost(item = selectedItem) {
    if (!item?.slug) return;
    const previewUrl = new URL("/", window.location.origin);
    previewUrl.searchParams.set("preview", item.slug);
    window.open(previewUrl.href, "_blank", "noopener,noreferrer");
  }

  function togglePostSort(key) {
    setPostSort((current) => ({
      key,
      ascending: current.key === key ? !current.ascending : true,
    }));
  }

  function returnToPostsList() {
    setSelectedId(null);
    setFormValues(emptyRecord);
    setStatus("");
    setPostScreen("list");
  }

  function updateField(name, value) {
    setFormValues((current) => {
      const nextValues = { ...current, [name]: value };

      if (activeResource === "blogHero" && name === "mode" && value === "single") {
        nextValues.image_2 = "";
        nextValues.image_3 = "";
      }

      const currentSlug = current.slug || "";
      const currentTitleSlug = slugify(current.title || "");
      const shouldUpdateSlug =
        activeResource === "posts" &&
        name === "title" &&
        !selectedId &&
        (!currentSlug || currentSlug === currentTitleSlug);

      if (shouldUpdateSlug) {
        nextValues.slug = slugify(value);
      }

      if (activeResource === "authors" && name === "instagram_handle") {
        const handle = String(value || "").trim().replace(/^@+/, "");
        nextValues.instagram_url = handle ? `https://www.instagram.com/${handle}/` : "";
      }

      return nextValues;
    });
  }

  async function handleImageFile(fieldName, file) {
    if (!file) return;

    if (!isSupabaseConfigured) {
      setStatus("Configure o Supabase antes de enviar imagens.");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError || !sessionData.session) {
      setStatus("Sua sessão expirou. Saia do painel e entre novamente.");
      return;
    }

    setImageLoadingFields((current) => [...new Set([...current, fieldName])]);
    setStatus("Enviando imagem para o Supabase Storage...");

    const storagePath = createStoragePath({
      activeResource,
      fieldName,
      formValues,
      file,
    });

    const { error } = await supabase.storage
      .from(mediaBucket)
      .upload(storagePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      setImageLoadingFields((current) => current.filter((name) => name !== fieldName));
      setStatus(`Não foi possível enviar a imagem: ${error.message}`);
      return;
    }

    const { data } = supabase.storage.from(mediaBucket).getPublicUrl(storagePath);
    updateField(fieldName, data.publicUrl || "");
    setImageLoadingFields((current) => current.filter((name) => name !== fieldName));
    setStatus("Imagem enviada. Agora clique em Salvar para gravar a URL no conteúdo.");
  }

  async function handleRichTextImageUpload(fieldName, file) {
    if (!file || !isSupabaseConfigured) {
      setStatus("Configure o Supabase antes de enviar imagens.");
      return "";
    }

    const loadingKey = `${fieldName}-content-image`;
    setImageLoadingFields((current) => [...new Set([...current, loadingKey])]);
    setStatus("Enviando imagem do artigo para o Supabase Storage...");

    const storagePath = createStoragePath({
      activeResource,
      fieldName: `${fieldName}-image`,
      formValues,
      file,
    });

    const { error } = await supabase.storage
      .from(mediaBucket)
      .upload(storagePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    setImageLoadingFields((current) => current.filter((name) => name !== loadingKey));

    if (error) {
      setStatus(`Não foi possível enviar a imagem: ${error.message}`);
      return "";
    }

    const { data } = supabase.storage.from(mediaBucket).getPublicUrl(storagePath);
    setStatus("Imagem inserida no artigo. Clique em Salvar para gravar o conteúdo.");
    return data.publicUrl || "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    if (!resource) return;

    if (imageLoadingFields.length > 0) {
      setStatus("Aguarde a imagem terminar de carregar antes de salvar.");
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus("Configure o Supabase antes de salvar.");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError || !sessionData.session) {
      setStatus("Sua sessão expirou. Saia do painel e entre novamente.");
      return;
    }

    let payload;
    try {
      payload = parsePayload(resource.fields, formValues);
      if (activeResource === "authors") {
        const handle = String(payload.instagram_handle || "").trim().replace(/^@+/, "");
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
          throw new Error("Informe um @ do Instagram válido.");
        }
        payload.instagram_handle = `@${handle}`;
        payload.instagram_url = `https://www.instagram.com/${handle}/`;
      }
      if (activeResource === "posts") {
        if (!payload.published_at) {
          payload.published_at = new Date().toISOString();
        }

        const selectedAuthor = relationOptions.author_id?.find(
          (option) => option.value === formValues.author_id,
        );
        payload.author = selectedAuthor?.label || null;
      }
    } catch (error) {
      setStatus(error.message || "Revise os campos informados.");
      return;
    }

    setIsSaving(true);
    const query = selectedId
      ? supabase.from(resource.table).update(payload).eq("id", selectedId).select()
      : supabase.from(resource.table).insert(payload).select();
    const { data, error } = await query;
    setIsSaving(false);

    if (error) {
      setStatus(`Erro ao salvar: ${error.message}`);
      return;
    }

    clearSupabaseListCache();
    setStatus(`${resource.singular} salvo com sucesso.`);
    await loadItems();
    if (isPostsResource) {
      returnToPostsList();
    } else {
      startCreate();
    }
  }

  async function handleDelete(item) {
    if (!resource) return;
    const itemTitle = item[resource.titleField || "title"] || "este registro";
    const confirmed = window.confirm(`Excluir "${itemTitle}"?`);
    if (!confirmed) return;

    setStatus("");
    const { error } = await supabase.from(resource.table).delete().eq("id", item.id);

    if (error) {
      setStatus(`Erro ao excluir: ${error.message}`);
      return;
    }

    clearSupabaseListCache();
    setStatus(`${resource.singular} excluído com sucesso.`);
    if (isPostsResource) {
      returnToPostsList();
    } else {
      startCreate();
    }
    await loadItems();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <SEO
        title="Painel administrativo | Alexandre Ivo"
        description="Acesso interno para gerenciar o conteúdo editorial do blog musical."
        path="/admin"
        robots="noindex, nofollow"
      />
      <main className="admin-shell">
        <aside className="admin-sidebar" aria-label="Navegação administrativa">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Painel</h1>
          </div>
          <nav className="admin-tabs">
            {adminNavigation.map(({ key, label, icon: Icon }) => (
              <button
                className={key === activeResource ? "is-active" : ""}
                key={key}
                type="button"
                onClick={() => setActiveResource(key)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <Button as="button" variant="secondary" type="button" onClick={handleLogout}>
            Sair
          </Button>
        </aside>

        <section className="admin-main" aria-labelledby="admin-resource-title">
          {activeResource === "dashboard" ? (
            <div className="admin-header">
              <div>
                <p className="eyebrow">Visão geral</p>
                <h2 id="admin-resource-title">Dashboard</h2>
                <p>Acompanhe os conteúdos cadastrados e acesse rapidamente cada área.</p>
              </div>
            </div>
          ) : (
            <div className="admin-header">
              <div>
                <p className="eyebrow">Conteúdo</p>
                <h2 id="admin-resource-title">{resource.label}</h2>
                <p>{resource.description}</p>
              </div>
              <div className="stack" style={{ gap: "var(--space-2)" }}>
                {isPostsResource ? (
                  <Button
                    as="button"
                    type="button"
                    onClick={postScreen === "list" ? startCreate : returnToPostsList}
                  >
                    {postScreen === "list" ? "Novo artigo" : "Voltar para artigos"}
                  </Button>
                ) : (
                  <Button as="button" type="button" onClick={startCreate}>
                    Novo {resource.singular}
                  </Button>
                )}
              </div>
            </div>
          )}

          {status && <p className="admin-status">{status}</p>}

          {activeResource === "dashboard" ? (
            <div className="admin-dashboard-grid">
              {isLoading && <p className="meta">Carregando indicadores...</p>}
              {!isLoading &&
                dashboardStats.map((stat) => {
                  const Icon = stat.key === "posts"
                    ? FileText
                    : stat.key === "authors"
                      ? UserRound
                      : FolderKanban;

                  return (
                    <article className="admin-dashboard-card" key={stat.key}>
                      <Icon aria-hidden="true" />
                      <span>{stat.label}</span>
                      <strong>{stat.count ?? 0}</strong>
                      <Button
                        as="button"
                        variant="secondary"
                        type="button"
                        onClick={() => setActiveResource(stat.key)}
                      >
                        Gerenciar {stat.singular}
                      </Button>
                    </article>
                  );
                })}
            </div>
          ) : isPostsResource && postScreen === "list" ? (
            <div className="admin-posts-table-wrap">
              <table className="admin-posts-table">
                <thead>
                  <tr>
                    {[
                      ["title", "Título"],
                      ["category", "Categoria"],
                      ["status", "Status"],
                      ["published_at", "Publicação"],
                      ["slug", "Slug"],
                    ].map(([key, label]) => (
                      <th key={key} scope="col" aria-sort={postSort.key === key ? (postSort.ascending ? "ascending" : "descending") : "none"}>
                        <button type="button" onClick={() => togglePostSort(key)}>
                          {label}
                          <ArrowUpDown aria-hidden="true" />
                        </button>
                      </th>
                    ))}
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan="6" className="admin-posts-empty">Carregando artigos...</td></tr>
                  )}
                  {!isLoading && sortedPostItems.length === 0 && (
                    <tr><td colSpan="6" className="admin-posts-empty">Nenhum artigo cadastrado.</td></tr>
                  )}
                  {!isLoading && sortedPostItems.map((item) => {
                    const postStatus = getPostStatus(item.published_at);
                    return (
                      <tr key={item.id}>
                        <td className="admin-post-title">{item.title || "Sem título"}</td>
                        <td>{item.category || "—"}</td>
                        <td><span className={`admin-post-status is-${postStatus.value}`}>{postStatus.label}</span></td>
                        <td>{formatPostPublicationDate(item.published_at)}</td>
                        <td className="admin-post-slug">{item.slug || "—"}</td>
                        <td>
                          <div className="admin-post-actions">
                            <button type="button" onClick={() => previewPost(item)}>Visualizar</button>
                            <button type="button" onClick={() => startEdit(item)}>Editar</button>
                            <button className="is-danger" type="button" onClick={() => handleDelete(item)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={`admin-grid ${isPostsResource ? "admin-grid--editor-full" : ""}`.trim()}
            >
            {!isPostsResource && (
              <div className="admin-list" aria-label={`Lista de ${resource.label}`}>
                {isLoading && <p className="meta">Carregando...</p>}
                {!isLoading && items.length === 0 && (
                  <p className="meta">Nenhum registro encontrado.</p>
                )}
                {items.map((item) => (
                  <article
                    className={`admin-list-item ${item.id === selectedId ? "is-active" : ""}`.trim()}
                    key={item.id}
                  >
                    <button type="button" onClick={() => startEdit(item)}>
                      <strong>{item[resource.titleField || "title"] || "Sem título"}</strong>
                      <span>{item[resource.subtitleField || "slug"]}</span>
                    </button>
                    <button
                      className="admin-delete"
                      type="button"
                      onClick={() => handleDelete(item)}
                    >
                      Excluir
                    </button>
                  </article>
                ))}
              </div>
            )}

            <form className="admin-editor" onSubmit={handleSubmit}>
              <div className="admin-editor-title">
                <h3>{selectedItem ? "Editar registro" : "Novo registro"}</h3>
                {selectedItem && <span className="meta">ID: {selectedItem.id}</span>}
              </div>

              <div className="admin-form-grid">
                {resource.fields
                  .filter((field) => {
                    if (!field.visibleWhen) return true;
                    return formValues[field.visibleWhen.field] === field.visibleWhen.equals;
                  })
                  .map((field) => (
                  <div className="field" key={field.name}>
                    <label htmlFor={`${activeResource}-${field.name}`}>
                      {field.label}
                    </label>
                    {field.help && <p className="field-help">{field.help}</p>}
                    {field.type === "image" || field.type === "imageUpload" ? (
                      <div className="admin-image-field">
                        {field.type === "image" && (
                          <input
                            className="input"
                            id={`${activeResource}-${field.name}`}
                            name={field.name}
                            type="text"
                            value={formValues[field.name] || ""}
                            placeholder="https://... ou /assets/images/imagem.webp"
                            onChange={(event) => updateField(field.name, event.target.value)}
                            required={field.required}
                          />
                        )}
                        <input
                          className="input"
                          id={
                            field.type === "imageUpload"
                              ? `${activeResource}-${field.name}`
                              : `${activeResource}-${field.name}-file`
                          }
                          type="file"
                          accept="image/*"
                          required={field.required && !formValues[field.name]}
                          onChange={(event) =>
                            handleImageFile(field.name, event.target.files?.[0])
                          }
                        />
                        {formValues[field.name] && (
                          <>
                            <img
                              className="admin-image-preview"
                              src={formValues[field.name]}
                              alt="Preview da imagem cadastrada"
                            />
                            <p className="meta">
                              Imagem pronta para salvar no campo {field.name}.
                            </p>
                          </>
                        )}
                      </div>
                    ) : field.type === "richtext" ? (
                      <RichTextEditor
                        id={`${activeResource}-${field.name}`}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={(value) => updateField(field.name, value)}
                        onImageUpload={
                          activeResource === "posts"
                            ? (file) => handleRichTextImageUpload(field.name, file)
                            : undefined
                        }
                        required={field.required}
                      />
                    ) : field.type === "select" || field.type === "relationSelect" ? (
                      <select
                        className="input"
                        id={`${activeResource}-${field.name}`}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        required={field.required}
                      >
                        <option value="">Selecione...</option>
                        {(field.type === "relationSelect"
                          ? relationOptions[field.name]
                          : field.options
                        )?.map((option) => (
                          <option
                            key={typeof option === "string" ? option : option.value}
                            value={typeof option === "string" ? option : option.value}
                          >
                            {typeof option === "string" ? option : option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" || field.type === "json" || field.type === "markdown" ? (
                      <textarea
                        className="textarea"
                        id={`${activeResource}-${field.name}`}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        placeholder={field.placeholder}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        required={field.required}
                      />
                    ) : (
                      <input
                        className="input"
                        id={`${activeResource}-${field.name}`}
                        name={field.name}
                        type={field.type}
                        value={formValues[field.name] || ""}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        readOnly={Boolean(field.autoGenerated)}
                        placeholder={
                          field.placeholder ||
                          (field.autoGenerated ? "Gerado automaticamente" : undefined)
                        }
                        required={field.required}
                      />
                    )}
                  </div>
                  ))}
              </div>

              <div className="admin-actions">
                <Button as="button" type="submit" disabled={isSaving || imageLoadingFields.length > 0}>
                  {isSaving
                    ? "Salvando..."
                    : imageLoadingFields.length > 0
                      ? "Carregando imagem..."
                      : "Salvar"}
                </Button>
                {isPostsResource && selectedItem?.slug && (
                  <Button as="button" variant="secondary" type="button" onClick={previewPost}>
                    <ExternalLink aria-hidden="true" />
                    Visualizar artigo
                  </Button>
                )}
                <Button as="button" variant="secondary" type="button" onClick={startCreate}>
                  Limpar
                </Button>
              </div>
            </form>
          </div>
          )}
        </section>
      </main>
    </>
  );
}
