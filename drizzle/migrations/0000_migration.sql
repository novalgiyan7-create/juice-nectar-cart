-- Roles
create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- First account ever created becomes the store admin
create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_grant_admin after insert on auth.users
for each row execute function public.grant_first_admin();

-- Products
create table public.products (
  id bigserial primary key,
  name text not null,
  category text not null default 'Detox',
  price integer not null default 30000,
  tag text not null default '',
  description text not null default '',
  image text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage, select on sequence public.products_id_seq to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Anyone can view products" on public.products for select to anon, authenticated using (true);
create policy "Admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.products (name, category, price, tag, description, image) values
('Green Glow Detox','Detox',35000,'Organic','Kale, spinach, green apple, cucumber, lemon, and ginger for ultimate cleansing.','https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80'),
('Tropical Sunrise','Tropical',32000,'Bestseller','Fresh mango, pineapple, passion fruit, and a hint of mint.','https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'),
('Power Protein Banana','Protein Booster',40000,'High Protein','Whey protein, banana, peanut butter, oat milk, and chia seeds.','https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80'),
('Berry Immunity Blast','Detox',38000,'Sugar-Free','Strawberry, blueberry, raspberry, beet, and coconut water.','https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80');

-- Orders (created only by the server; read/updated by admins)
create table public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  payment text not null,
  items jsonb not null default '[]'::jsonb,
  items_summary text not null default '',
  total integer not null default 0,
  status text not null default 'Order Placed',
  created_at timestamptz not null default now()
);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins view orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Juice matcher options
create table public.matcher_options (
  id bigserial primary key,
  kind text not null check (kind in ('taste','dietary','goal')),
  label text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.matcher_options to anon, authenticated;
grant insert, update, delete on public.matcher_options to authenticated;
grant usage, select on sequence public.matcher_options_id_seq to authenticated;
grant all on public.matcher_options to service_role;
alter table public.matcher_options enable row level security;
create policy "Anyone can view options" on public.matcher_options for select to anon, authenticated using (true);
create policy "Admins insert options" on public.matcher_options for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update options" on public.matcher_options for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete options" on public.matcher_options for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.matcher_options (kind, label, sort) values
('taste','Sweet',1),('taste','Sour / Tangy',2),('taste','Fruity',3),('taste','Green / Earthy',4),('taste','Creamy',5),('taste','Refreshing',6),
('taste','Citrusy',7),('taste','Berry',8),('taste','Tropical',9),('taste','Spicy / Ginger',10),('taste','Minty',11),('taste','Nutty',12),('taste','Chocolatey',13),('taste','Light / Not too sweet',14),
('dietary','Vegan',1),('dietary','Dairy-Free',2),('dietary','Nut Allergy',3),('dietary','Low Sugar',4),('dietary','Gluten-Free',5),('dietary','High Protein',6),
('dietary','Diabetic-Friendly',7),('dietary','Keto / Low Carb',8),('dietary','Low Calorie',9),('dietary','Pregnancy-Safe',10),('dietary','Soy-Free',11),('dietary','Caffeine-Free',12),('dietary','Halal',13),
('goal','Detox',1),('goal','Energy Boost',2),('goal','Post-Workout',3),('goal','Immunity',4),('goal','Just Delicious',5),
('goal','Weight Loss',6),('goal','Glowing Skin',7),('goal','Better Digestion',8),('goal','Hydration',9),('goal','Meal Replacement',10),('goal','Stress Relief',11),('goal','Hangover Recovery',12);

-- Store settings (single row)
create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Giant Juice',
  whatsapp_number text not null default '',
  address text not null default '',
  eta_placed_mins integer not null default 30,
  eta_preparing_mins integer not null default 20,
  eta_on_the_way_mins integer not null default 12,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "Anyone can view settings" on public.store_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
insert into public.store_settings (id, store_name) values (1, 'Giant Juice');