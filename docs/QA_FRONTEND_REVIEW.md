# BuildYourStore.ai Frontend QA Review

## 1. Краткий статус продукта

- Текущий статус: **frontend-only MVP** на Next.js App Router + Tailwind.
- Основные пользовательские сценарии (visitor/seller/buyer) проходят на уровне UI/UX.
- Приложение стабильно собирается, lint проходит без предупреждений.
- Backend/API логика частично мокается/фолбечится на demo-данные, что ожидаемо на этом этапе.

## 2. Проверенные routes

- `/`
- `/features`
- `/pricing`
- `/templates`
- `/onboarding`
- `/dashboard`
- `/store/[slug]` (проверка на `/store/oud-house`)
- `/editor` (базовый smoke-check маршрута)

## 3. Проверенные user flows

### Visitor flow

- Открытие `/` и понимание value proposition (hero + секции преимуществ).
- Переход на `/templates`.
- Открытие demo storefront (`/store/oud-house`) из шаблонов.
- Переход на создание магазина через CTA (`/onboarding`) с лендинга/шаблонов/storefront.

### Seller flow

- Прохождение шагов `/onboarding` (ниша, город, контакты, стиль, генерация, финал).
- Переход в `/dashboard`.
- Видимость магазина, метрик и списка заявок.
- Переход на storefront по ссылке магазина.

### Storefront buyer flow

- Открытие `/store/oud-house`.
- Просмотр hero, каталога, trust badges и отзывов.
- Добавление товаров в заказ (увеличение/уменьшение количества).
- Заполнение контактной формы и отправка заявки (UI-путь checkout).

## 4. P0 — критичные проблемы

На текущем frontend-этапе **P0-блокеров не выявлено**:

- Нет битых routes в ключевых сценариях.
- Нет dead-end кнопок без обратной связи.
- Нет ошибок сборки/линтинга.

## 5. P1 — важные улучшения

- [ ] Связать dashboard actions с реальными backend-операциями (вместо placeholder toast там, где логика еще не готова).
- [ ] Ввести единый обработчик ошибок API с пользовательскими состояниями (`retry`, `empty`, `offline`).
- [ ] Добавить явные loading/skeleton состояния для всех async-переходов между шагами onboarding.
- [ ] Уточнить copy в ключевых CTA под продуктовые KPI (activation: create store, publish, first lead).
- [ ] Добавить e2e smoke-набор для visitor/seller/buyer критического пути.

## 6. P2 — polish/визуальные улучшения

- [ ] Унифицировать micro-interactions (hover/focus/pressed) между dashboard/onboarding/storefront.
- [ ] Добавить более реалистичные storefront placeholders для шаблонов (сейчас часть превью упрощена).
- [ ] Улучшить доступность: aria-label для icon-only controls и навигационных элементов.
- [ ] Подчистить консистентность типографики и spacing на редких брейкпоинтах.

## 7. Что готово для backend/API

- Frontend готов к интеграции реальных сущностей:
  - stores
  - products
  - orders/leads
  - onboarding completion
- Есть стабильные точки входа UX:
  - wizard (`/onboarding`)
  - seller cockpit (`/dashboard`)
  - storefront checkout path (`/store/[slug]`)
- Роутинг и основные CTA уже выстроены, можно подключать настоящие API ответы и валидации.

## 8. Что нельзя начинать, пока не закрыто

- Нельзя запускать полноценный production rollout без:
  - [ ] server-side валидации заявок и контактов
  - [ ] устойчивой обработки API ошибок (timeout/5xx/unauthorized)
  - [ ] базовых e2e regression тестов по 3 ключевым флоу
- Нельзя обещать real-time seller automation, пока dashboard actions остаются частично placeholder.

## 9. Рекомендованный следующий sprint

Цель спринта: перейти от frontend-only MVP к рабочему end-to-end MVP с реальными заявками.

### Sprint checklist (actionable)

- [ ] Подключить реальные API для onboarding completion и сохранения store профиля.
- [ ] Подключить реальные API для списка/статусов заявок в dashboard.
- [ ] Подключить создание заказа из storefront checkout в устойчивом сценарии (success/error states).
- [ ] Добавить централизованный client API layer с typed error handling.
- [ ] Написать e2e smoke: visitor -> onboarding -> dashboard -> storefront -> checkout.
- [ ] Зафиксировать release criteria: lint/build/e2e green + ручной QA по чеклисту выше.

