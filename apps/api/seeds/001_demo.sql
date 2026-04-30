INSERT INTO stores (id, owner_id, name, slug, description, region, city, currency, status, theme_code, contacts) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Amina Wear', 'amina-wear', 'Женская одежда и аксессуары с быстрой доставкой по Ингушетии.', 'Ингушетия', 'Назрань', 'RUB', 'active', 'fashion', '{"phone":"+79001000001","whatsapp":"+79001000001","telegram":"@amina_wear"}'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Oud House', 'oud-house', 'Парфюм, масла и подарочные наборы для особых случаев.', 'Чечня', 'Грозный', 'RUB', 'active', 'premium', '{"phone":"+79001000002","whatsapp":"+79001000002","telegram":"@oud_house"}'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Halal Basket', 'halal-basket', 'Халяль-продукты и семейные наборы с доставкой сегодня.', 'Дагестан', 'Махачкала', 'RUB', 'active', 'food', '{"phone":"+79001000003","whatsapp":"+79001000003","telegram":"@halal_basket"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (store_id, title, slug, description, short_description, price, currency, stock_quantity, status) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Платье Sofia', 'sofia-dress', 'Легкое платье для повседневного образа и семейных мероприятий.', 'Женское платье.', 690000, 'RUB', 9, 'active'),
  ('20000000-0000-0000-0000-000000000002', 'Musk Rose 30ml', 'musk-rose-30', 'Мягкий мускусный аромат с розовыми нотами.', 'Парфюм 30ml.', 350000, 'RUB', 20, 'active'),
  ('20000000-0000-0000-0000-000000000003', 'Семейный халяль-бокс', 'family-halal-box', 'Набор продуктов на ужин для семьи.', 'Халяль-бокс.', 280000, 'RUB', 15, 'active')
ON CONFLICT DO NOTHING;
