ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'manager', 'support'));

ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS device_id TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_store_idempotency_key
  ON orders(store_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('created', 'paid', 'accepted', 'shipped', 'delivered', 'cancelled', 'returned')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_generations ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE ai_generations ADD COLUMN IF NOT EXISTS input_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_generations ADD COLUMN IF NOT EXISTS output_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_generations ADD COLUMN IF NOT EXISTS latency_ms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_generations ADD COLUMN IF NOT EXISTS prompt_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS dead_lettered_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  monthly_price INTEGER NOT NULL DEFAULT 0 CHECK (monthly_price >= 0),
  trial_days INTEGER NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  limit_value INTEGER NOT NULL CHECK (limit_value >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, feature)
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'void', 'overdue')),
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  external_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_store_phone ON customers(store_id, phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_pending ON notification_jobs(status, available_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_invoices_store ON invoices(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_store ON payments(store_id, created_at DESC);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_positive;
ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price > 0);
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_non_negative;
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock_quantity >= 0);
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0);
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_price_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_price_positive CHECK (price > 0);
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_non_negative;
ALTER TABLE orders ADD CONSTRAINT orders_total_non_negative CHECK (total_amount >= 0);

INSERT INTO plans (code, title, monthly_price, trial_days) VALUES
  ('free', 'Free', 0, 0),
  ('start', 'Start', 190000, 7),
  ('business', 'Business', 590000, 14)
ON CONFLICT (code) DO NOTHING;

INSERT INTO feature_limits (plan_id, feature, limit_value)
SELECT id, 'stores', CASE code WHEN 'free' THEN 1 ELSE 1 END FROM plans
ON CONFLICT (plan_id, feature) DO NOTHING;

INSERT INTO feature_limits (plan_id, feature, limit_value)
SELECT id, 'products', CASE code WHEN 'free' THEN 10 WHEN 'start' THEN 50 ELSE 500 END FROM plans
ON CONFLICT (plan_id, feature) DO NOTHING;

INSERT INTO feature_limits (plan_id, feature, limit_value)
SELECT id, 'ai_generations', CASE code WHEN 'free' THEN 20 WHEN 'start' THEN 150 ELSE 1000 END FROM plans
ON CONFLICT (plan_id, feature) DO NOTHING;
