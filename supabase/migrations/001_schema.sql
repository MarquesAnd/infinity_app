-- ══════════════════════════════════════════
-- INFINITY APP — Schema Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- ══════════════════════════════════════════

-- Empresas
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  created_at timestamptz default now()
);

-- Perfis de usuário (extensão do auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'viewer' check (role in ('admin','editor','viewer')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Transações financeiras
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  created_by uuid references auth.users(id),
  description text not null,
  category text,
  type text not null check (type in ('entrada','saida')),
  value numeric not null check (value > 0),
  date date not null,
  status text not null default 'pendente' check (status in ('pendente','pago','recebido','atrasado')),
  created_at timestamptz default now()
);

-- Compras
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  created_by uuid references auth.users(id),
  item text not null,
  supplier text,
  qty integer not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  date date not null,
  status text not null default 'em_transito' check (status in ('em_transito','entregue','ativo','cancelado')),
  created_at timestamptz default now()
);

-- ── Row Level Security ──────────────────────

alter table companies enable row level security;
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table purchases enable row level security;

-- Companies: membros podem ver sua empresa
create policy "Membros veem sua empresa"
  on companies for select
  using (id in (select company_id from profiles where id = auth.uid()));

create policy "Admin atualiza empresa"
  on companies for update
  using (id in (select company_id from profiles where id = auth.uid() and role = 'admin'));

-- Profiles: todos da empresa veem, admin gerencia
create policy "Membros veem perfis da empresa"
  on profiles for select
  using (company_id in (select company_id from profiles where id = auth.uid()));

create policy "Próprio usuário atualiza perfil"
  on profiles for update
  using (id = auth.uid());

create policy "Admin insere perfis"
  on profiles for insert
  with check (
    company_id in (select company_id from profiles where id = auth.uid() and role = 'admin')
    or id = auth.uid()
  );

create policy "Admin exclui perfis (não a si mesmo)"
  on profiles for delete
  using (
    id != auth.uid() and
    company_id in (select company_id from profiles where id = auth.uid() and role = 'admin')
  );

-- Transactions
create policy "Membros veem transações da empresa"
  on transactions for select
  using (company_id in (select company_id from profiles where id = auth.uid()));

create policy "Admin/Editor inserem transações"
  on transactions for insert
  with check (company_id in (
    select company_id from profiles where id = auth.uid() and role in ('admin','editor')
  ));

create policy "Admin/Editor atualizam transações"
  on transactions for update
  using (company_id in (
    select company_id from profiles where id = auth.uid() and role in ('admin','editor')
  ));

create policy "Admin exclui transações"
  on transactions for delete
  using (company_id in (
    select company_id from profiles where id = auth.uid() and role = 'admin'
  ));

-- Purchases
create policy "Membros veem compras da empresa"
  on purchases for select
  using (company_id in (select company_id from profiles where id = auth.uid()));

create policy "Admin/Editor inserem compras"
  on purchases for insert
  with check (company_id in (
    select company_id from profiles where id = auth.uid() and role in ('admin','editor')
  ));

create policy "Admin/Editor atualizam compras"
  on purchases for update
  using (company_id in (
    select company_id from profiles where id = auth.uid() and role in ('admin','editor')
  ));

create policy "Admin exclui compras"
  on purchases for delete
  using (company_id in (
    select company_id from profiles where id = auth.uid() and role = 'admin'
  ));

-- ── Storage: bucket avatars ─────────────────
-- Execute manualmente no Dashboard > Storage > New Bucket
-- Nome: avatars | Public: true

-- Políticas Storage (rodar depois de criar o bucket)
/*
create policy "Avatar público"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Usuário faz upload do próprio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuário atualiza próprio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
*/
