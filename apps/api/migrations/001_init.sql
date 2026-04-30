CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  monthly_price INTEGER NOT NULL DEFAULT 0,
  store_limit INTEGER NOT NULL DEFAULT 1,
  product_limit INTEGER NOT NULL,
  ai_generation_limit INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  region TEXT,
  city TEXT,
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'draft',
  tariff_id UUID REFERENCES tariffs(id),
  theme_id UUID REFERENCES themes(id),
  theme_code TEXT,
  contacts JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price INTEGER NOT NULL,
  old_price INTEGER,
  cost_price INTEGER,
  currency TEXT NOT NULL DEFAULT 'RUB',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  attributes JSONB NOT NULL DEFAULT '{}',
  variants JSONB NOT NULL DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  telegram_id TEXT,
  whatsapp TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (store_id, phone)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'new',
  total_amount INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  delivery_status TEXT NOT NULL DEFAULT 'new',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT,
  customer_address TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  total INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  type TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NOT NULL DEFAULT '{}',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  provider TEXT,
  status TEXT NOT NULL,
  cost NUMERIC(12, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tariff_id UUID NOT NULL REFERENCES tariffs(id),
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS telegram_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  telegram_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL DEFAULT '{}',
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

INSERT INTO tariffs (code, title, monthly_price, store_limit, product_limit, ai_generation_limit) VALUES
  ('free', 'Free', 0, 1, 10, 20),
  ('start', 'Start', 190000, 1, 50, 150),
  ('business', 'Business', 590000, 1, 500, 1000)
ON CONFLICT (code) DO NOTHING;

INSERT INTO themes (code, title, config) VALUES
  ('classic', 'Classic', '{}'),
  ('premium', 'Premium', '{}'),
  ('fashion', 'Fashion', '{}'),
  ('food', 'Food', '{}'),
  ('islamic', 'Islamic', '{}'),
  ('beauty', 'Beauty', '{}'),
  ('local-market', 'Local Market', '{}')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (id, phone, email, password_hash, role, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '+79000000000', 'demo@bazar.ai', '$2a$10$X3bZ1v3wq7k8nX7n4d7u0e9y1i2o3p4a5s6d7f8g9h0j1k2l3z4x5', 'owner', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (id, owner_id, name, slug, description, region, city, currency, status, theme_code, contacts) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Kavkaz Style', 'kavkaz-style', 'Одежда и аксессуары с доставкой по Кавказу.', 'Ингушетия', 'Магас', 'RUB', 'active', 'premium', '{"phone":"+79000000000","whatsapp":"+79000000000","telegram":"@bazar_demo"}'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Safiya Beauty', 'safiya-beauty', 'Косметика и уход для ежедневного образа.', 'Чечня', 'Грозный', 'RUB', 'active', 'beauty', '{"phone":"+79000000001","whatsapp":"+79000000001"}'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Halal Food Market', 'halal-food-market', 'Халяль-продукты с понятной доставкой.', 'Дагестан', 'Махачкала', 'RUB', 'active', 'food', '{"phone":"+79000000002","whatsapp":"+79000000002"}'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Oud Parfum', 'oud-parfum', 'Парфюм, масла и подарочные наборы.', 'КБР', 'Нальчик', 'RUB', 'active', 'premium', '{"phone":"+79000000003","whatsapp":"+79000000003"}'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Torty Kavkaza', 'torty-kavkaza', 'Торты на заказ для семейных событий.', 'Северная Осетия', 'Владикавказ', 'RUB', 'active', 'classic', '{"phone":"+79000000004","whatsapp":"+79000000004"}'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Iman Store', 'iman-store', 'Исламские товары, книги и подарки.', 'КЧР', 'Черкесск', 'RUB', 'active', 'islamic', '{"phone":"+79000000005","whatsapp":"+79000000005"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (store_id, title, slug, description, short_description, price, currency, stock_quantity, status, seo_title, seo_description) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Премиальный платок', 'premium-platok', 'Мягкий платок спокойного оттенка для повседневного и праздничного образа.', 'Платок с мягкой посадкой.', 290000, 'RUB', 12, 'active', 'Купить премиальный платок', 'Платок с доставкой по Кавказу'),
  ('10000000-0000-0000-0000-000000000002', 'Набор ухода Glow', 'glow-care-set', 'Базовый набор ухода для сияющей кожи.', 'Уходовый набор.', 390000, 'RUB', 18, 'active', 'Купить косметику Glow', 'Косметика с доставкой'),
  ('10000000-0000-0000-0000-000000000003', 'Халяль набор', 'halal-box', 'Набор продуктов для семьи с быстрой доставкой.', 'Семейный продуктовый набор.', 250000, 'RUB', 30, 'active', 'Халяль продукты купить', 'Халяль продукты с доставкой'),
  ('10000000-0000-0000-0000-000000000004', 'Oud Classic 50ml', 'oud-classic-50', 'Теплый восточный аромат в подарочной упаковке.', 'Парфюм Oud.', 450000, 'RUB', 14, 'active', 'Купить Oud парфюм', 'Парфюм с доставкой'),
  ('10000000-0000-0000-0000-000000000005', 'Торт Медовый', 'honey-cake', 'Домашний медовый торт на заказ.', 'Торт на заказ.', 320000, 'RUB', 8, 'active', 'Торт на заказ', 'Торты с доставкой'),
  ('10000000-0000-0000-0000-000000000006', 'Подарочный набор Iman', 'iman-gift-box', 'Книга, четки и аромат в аккуратной коробке.', 'Исламский подарочный набор.', 520000, 'RUB', 11, 'active', 'Исламский подарок купить', 'Исламские товары с доставкой')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_slug_unique ON products(store_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_generations_store ON ai_generations(store_id);
CREATE INDEX IF NOT EXISTS idx_telegram_connections_code ON telegram_connections(code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_order ON notification_jobs(order_id);
