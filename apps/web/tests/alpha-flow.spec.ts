import { expect, request, test } from "@playwright/test";

test("register -> onboarding -> product -> public store -> checkout -> notification queued", async () => {
  const api = await request.newContext({ baseURL: process.env.E2E_API_URL || "http://127.0.0.1:8080" });
  const suffix = Date.now();
  const email = `alpha-${suffix}@bazar.ai`;

  const register = await api.post("/api/v1/auth/register", { data: { email, password: "alpha-password" } });
  expect(register.ok()).toBeTruthy();
  const auth = await register.json();
  const headers = { Authorization: `Bearer ${auth.access_token}` };

  const onboarding = await api.post("/api/v1/onboarding/complete", {
    headers,
    data: {
      niche: "Парфюм",
      name: `Alpha Oud ${suffix}`,
      region: "Ингушетия",
      city: "Магас",
      style: "premium",
      contacts: { phone: "+79000000000", whatsapp: "+79000000000", telegram: "@alpha_demo" }
    }
  });
  expect(onboarding.ok()).toBeTruthy();
  const onboarded = await onboarding.json();
  const store = onboarded.store;

  const product = await api.post(`/api/v1/stores/${store.id}/products`, {
    headers,
    data: {
      title: "Alpha Oud 50ml",
      description: "Демо-парфюм для alpha e2e.",
      short_description: "Alpha аромат.",
      price: 450000,
      currency: "RUB",
      stock_quantity: 5
    }
  });
  expect(product.ok()).toBeTruthy();
  const createdProduct = await product.json();

  const publicStore = await api.get(`/api/v1/public/stores/${store.slug}`);
  expect(publicStore.ok()).toBeTruthy();
  const publicData = await publicStore.json();
  expect(publicData.products.length).toBeGreaterThan(0);

  const checkout = await api.post(`/api/v1/public/stores/${store.slug}/orders`, {
    data: {
      customer_name: "Адам",
      customer_phone: "+79001112233",
      customer_city: "Магас",
      items: [{ product_id: createdProduct.id, title: createdProduct.title, quantity: 1, price: createdProduct.price }]
    }
  });
  expect(checkout.ok()).toBeTruthy();
  const order = await checkout.json();
  expect(order.id).toBeTruthy();

  const orders = await api.get(`/api/v1/stores/${store.id}/orders`, { headers });
  expect(orders.ok()).toBeTruthy();
  const crmOrders = await orders.json();
  expect(crmOrders.some((item: { id: string }) => item.id === order.id)).toBeTruthy();

  const notifications = await api.get(`/api/v1/orders/${order.id}/notifications`, { headers });
  expect(notifications.ok()).toBeTruthy();
  const jobs = await notifications.json();
  expect(jobs.some((job: { channel: string; status: string }) => job.channel === "telegram" && job.status === "queued")).toBeTruthy();
});
