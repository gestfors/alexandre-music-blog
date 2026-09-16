create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  image text,
  author text,
  category text,
  excerpt text,
  seo_title text,
  seo_description text,
  thumbnail text,
  published_at timestamptz,
  views_count bigint not null default 0,
  reading_time text,
  intro text,
  content text,
  canonical_url text,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blog_posts'
      and column_name = 'published_at'
      and data_type = 'date'
  ) then
    alter table public.blog_posts
      alter column published_at type timestamptz
      using (published_at::timestamp at time zone 'America/Sao_Paulo');
  end if;
end $$;

alter table public.blog_posts add column if not exists image text;
alter table public.blog_posts add column if not exists author text;
alter table public.blog_posts add column if not exists thumbnail text;
alter table public.blog_posts add column if not exists content text;
alter table public.blog_posts add column if not exists canonical_url text;
alter table public.blog_posts add column if not exists views_count bigint not null default 0;

create table if not exists public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  photo text not null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  bio text not null check (char_length(trim(bio)) between 2 and 500),
  instagram_handle text not null check (instagram_handle ~ '^@[A-Za-z0-9._]{1,30}$'),
  instagram_url text not null check (instagram_url ~ '^https://(www\.)?instagram\.com/[A-Za-z0-9._]+/?$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_authors_name_idx
on public.blog_authors (name);

alter table public.blog_posts
add column if not exists author_id uuid references public.blog_authors(id) on delete set null;

create index if not exists blog_posts_author_id_idx
on public.blog_posts (author_id);

create table if not exists public.blog_post_views (
  id bigserial primary key,
  post_slug text not null references public.blog_posts(slug) on delete cascade,
  visitor_key text not null,
  viewed_at timestamptz not null default now(),
  unique (post_slug, visitor_key)
);

create index if not exists blog_post_views_post_slug_idx
on public.blog_post_views (post_slug);

create or replace function public.register_blog_post_view(p_post_slug text, p_visitor_key text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  current_views bigint;
begin
  if p_post_slug is null or p_visitor_key is null then
    return null;
  end if;

  insert into public.blog_post_views (post_slug, visitor_key)
  values (p_post_slug, p_visitor_key)
  on conflict (post_slug, visitor_key) do nothing;

  if found then
    update public.blog_posts
    set views_count = coalesce(views_count, 0) + 1
    where slug = p_post_slug
    returning views_count into current_views;
  else
    select views_count
    into current_views
    from public.blog_posts
    where slug = p_post_slug;
  end if;

  return coalesce(current_views, 0);
end;
$$;

revoke all on function public.register_blog_post_view(text, text) from public;
grant execute on function public.register_blog_post_view(text, text) to anon, authenticated;

create index if not exists blog_posts_published_at_idx
on public.blog_posts (published_at desc);

create table if not exists public.sidebar_promos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (char_length(trim(category)) between 1 and 80),
  title text not null check (char_length(trim(title)) between 1 and 180),
  url text,
  image text not null,
  tone text not null check (tone in ('bass', 'piano', 'guitar')),
  sort_order integer not null default 1 check (sort_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sidebar_promos
add column if not exists url text;

create index if not exists sidebar_promos_sort_order_idx
on public.sidebar_promos (sort_order asc, created_at asc);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null references public.blog_posts(slug) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 80),
  author_email text not null check (char_length(author_email) between 5 and 254),
  content text not null check (char_length(content) between 2 and 2000),
  status text not null default 'approved' check (status in ('approved', 'pending', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_created_at_idx
on public.blog_comments (post_slug, created_at desc);

create index if not exists blog_comments_email_created_at_idx
on public.blog_comments (lower(author_email), created_at desc);

create or replace function public.submit_blog_comment(
  p_post_slug text,
  p_author_name text,
  p_author_email text,
  p_content text,
  p_website text default ''
)
returns table (
  id uuid,
  post_slug text,
  author_name text,
  content text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_slug text := trim(coalesce(p_post_slug, ''));
  clean_name text := trim(coalesce(p_author_name, ''));
  clean_email text := lower(trim(coalesce(p_author_email, '')));
  clean_content text := trim(coalesce(p_content, ''));
begin
  if trim(coalesce(p_website, '')) <> '' then
    raise exception 'Comentario invalido.';
  end if;

  if not exists (select 1 from public.blog_posts where slug = clean_slug) then
    raise exception 'Artigo nao encontrado.';
  end if;

  if char_length(clean_name) not between 2 and 80 then
    raise exception 'Informe um nome entre 2 e 80 caracteres.';
  end if;

  if char_length(clean_email) > 254
    or clean_email !~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$' then
    raise exception 'Informe um e-mail valido.';
  end if;

  if char_length(clean_content) not between 2 and 2000 then
    raise exception 'O comentario deve ter entre 2 e 2000 caracteres.';
  end if;

  if (
    select count(*)
    from public.blog_comments as comments
    where lower(comments.author_email) = clean_email
      and comments.created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'Aguarde alguns minutos antes de enviar outro comentario.';
  end if;

  return query
  insert into public.blog_comments (post_slug, author_name, author_email, content)
  values (clean_slug, clean_name, clean_email, clean_content)
  returning
    blog_comments.id,
    blog_comments.post_slug,
    blog_comments.author_name,
    blog_comments.content,
    blog_comments.created_at;
end;
$$;

revoke all on function public.submit_blog_comment(text, text, text, text, text) from public;
grant execute on function public.submit_blog_comment(text, text, text, text, text) to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists blog_authors_set_updated_at on public.blog_authors;
create trigger blog_authors_set_updated_at
before update on public.blog_authors
for each row execute function public.set_updated_at();

drop trigger if exists sidebar_promos_set_updated_at on public.sidebar_promos;
create trigger sidebar_promos_set_updated_at
before update on public.sidebar_promos
for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
alter table public.blog_authors enable row level security;
alter table public.sidebar_promos enable row level security;
alter table public.blog_post_views enable row level security;
alter table public.blog_comments enable row level security;

drop policy if exists "Public can read site media" on storage.objects;
create policy "Public can read site media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "Authenticated users upload site media" on storage.objects;
create policy "Authenticated users upload site media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-media');

drop policy if exists "Authenticated users update site media" on storage.objects;
create policy "Authenticated users update site media"
on storage.objects for update
to authenticated
using (bucket_id = 'site-media')
with check (bucket_id = 'site-media');

drop policy if exists "Authenticated users delete site media" on storage.objects;
create policy "Authenticated users delete site media"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-media');

drop policy if exists "Public can read blog posts" on public.blog_posts;
create policy "Public can read blog posts"
on public.blog_posts for select
to anon
using (published_at is not null and published_at <= now());

drop policy if exists "Public can read blog authors" on public.blog_authors;
create policy "Public can read blog authors"
on public.blog_authors for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users manage blog authors" on public.blog_authors;
create policy "Authenticated users manage blog authors"
on public.blog_authors for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read sidebar promos" on public.sidebar_promos;
create policy "Public can read sidebar promos"
on public.sidebar_promos for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users manage sidebar promos" on public.sidebar_promos;
create policy "Authenticated users manage sidebar promos"
on public.sidebar_promos for all
to authenticated
using (true)
with check (true);

grant select on public.sidebar_promos to anon, authenticated;
grant insert, update, delete on public.sidebar_promos to authenticated;

drop policy if exists "Authenticated users manage blog posts" on public.blog_posts;
create policy "Authenticated users manage blog posts"
on public.blog_posts for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read approved blog comments" on public.blog_comments;
create policy "Public can read approved blog comments"
on public.blog_comments for select
to anon
using (status = 'approved');

drop policy if exists "Authenticated users manage blog comments" on public.blog_comments;
create policy "Authenticated users manage blog comments"
on public.blog_comments for all
to authenticated
using (true)
with check (true);

revoke all on public.blog_comments from anon;
grant select (id, post_slug, author_name, content, created_at) on public.blog_comments to anon;
grant all on public.blog_comments to authenticated;

