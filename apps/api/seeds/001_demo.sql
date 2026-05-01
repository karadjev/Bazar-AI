INSERT INTO users (id, email, name, password_hash, role, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'guest@bazar.ai', 'Guest Owner', '$2a$10$zMlxmVklwVX4W6N4QxwQ3eYqiN7Q7M6fYB3Q7NQ7Q7NQ7Q7NQ7NQ7', 'owner', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (id, owner_id, name, slug, niche, description, region, city, currency, status, theme_code, style, contacts)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Amina Wear', 'amina-wear', 'Женская одежда', 'Женская одежда и аксессуары с быстрой доставкой по Ингушетии.', 'Ингушетия', 'Назрань', 'RUB', 'active', 'premium-fashion', 'premium-fashion', '{"phone":"+79001000001","whatsapp":"+79001000001","telegram":"@amina_wear"}'::jsonb),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Oud House', 'oud-house', 'Парфюм', 'Парфюм, масла и подарочные наборы для особых случаев.', 'Чечня', 'Грозный', 'RUB', 'active', 'perfume-luxury', 'perfume-luxury', '{"phone":"+79001000002","whatsapp":"+79001000002","telegram":"@oud_house"}'::jsonb),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Halal Basket', 'halal-basket', 'Халяль-продукты', 'Халяль-продукты и семейные наборы с доставкой сегодня.', 'Дагестан', 'Махачкала', 'RUB', 'active', 'halal-market', 'halal-market', '{"phone":"+79001000003","whatsapp":"+79001000003","telegram":"@halal_basket"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, store_id, title, slug, description, short_description, price, currency, stock_quantity, status, image, featured)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Платье Sofia', 'sofia-dress', 'Легкое платье для повседневного образа и семейных мероприятий.', 'Женское платье.', 690000, 'RUB', 9, 'active', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80', false),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Musk Rose 30ml', 'musk-rose-30', 'Мягкий мускусный аромат с розовыми нотами.', 'Парфюм 30ml.', 350000, 'RUB', 20, 'active', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80', true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Семейный халяль-бокс', 'family-halal-box', 'Набор продуктов на ужин для семьи.', 'Халяль-бокс.', 280000, 'RUB', 15, 'active', 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leads (id, store_id, customer_name, phone, message, status)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Амина', '+79001112233', 'Хочу оформить заказ', 'new')
ON CONFLICT (id) DO NOTHING;
