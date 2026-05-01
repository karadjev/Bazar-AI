package platform

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateUser(ctx context.Context, user User) (User, error) {
	row := r.db.QueryRow(ctx, `
		INSERT INTO users (phone, email, name, password_hash, role, status)
		VALUES ($1, $2, $3, $4, $5, 'active')
		RETURNING id::text, COALESCE(phone, ''), COALESCE(email, ''), COALESCE(name, ''), password_hash, role, status, created_at, updated_at
	`, nullString(user.Phone), nullString(user.Email), nullString(user.Name), user.PasswordHash, fallback(user.Role, "owner"))
	return scanUser(row)
}

func (r *Repository) UserByLogin(ctx context.Context, login string) (User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id::text, COALESCE(phone, ''), COALESCE(email, ''), COALESCE(name, ''), password_hash, role, status, created_at, updated_at
		FROM users
		WHERE deleted_at IS NULL AND (phone = $1 OR email = $1)
	`, login)
	return scanUser(row)
}

func (r *Repository) UserByID(ctx context.Context, id string) (User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id::text, COALESCE(phone, ''), COALESCE(email, ''), COALESCE(name, ''), password_hash, role, status, created_at, updated_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`, id)
	return scanUser(row)
}

func (r *Repository) SaveRefreshToken(ctx context.Context, userID, tokenHash, deviceID string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, device_id, expires_at)
		VALUES ($1, $2, nullif($3, ''), now() + interval '30 days')
	`, userID, tokenHash, deviceID)
	return err
}

func (r *Repository) RefreshTokenActive(ctx context.Context, tokenHash, deviceID string) (User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT u.id::text, COALESCE(u.phone, ''), COALESCE(u.email, ''), u.password_hash, u.role, u.status, u.created_at, u.updated_at
		FROM refresh_tokens rt
		JOIN users u ON u.id = rt.user_id
		WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > now()
		  AND ($2 = '' OR rt.device_id IS NULL OR rt.device_id = $2)
	`, tokenHash, deviceID)
	return scanUser(row)
}

func (r *Repository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := r.db.Exec(ctx, `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, tokenHash)
	return err
}

func (r *Repository) RotateRefreshToken(ctx context.Context, oldHash, newHash, deviceID string) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `
		UPDATE refresh_tokens
		SET revoked_at = now()
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
		  AND ($2 = '' OR device_id IS NULL OR device_id = $2)
	`, oldHash, deviceID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return pgx.ErrNoRows
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, device_id, expires_at)
		SELECT user_id, $2, nullif($3, ''), now() + interval '30 days'
		FROM refresh_tokens
		WHERE token_hash = $1
	`, oldHash, newHash, deviceID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) RevokeRefreshTokensByUser(ctx context.Context, userID string) error {
	_, err := r.db.Exec(ctx, `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, userID)
	return err
}

func (r *Repository) CreateStore(ctx context.Context, store Store) (Store, error) {
	contacts, _ := json.Marshal(store.Contacts)
	baseSlug := Slugify(store.Name)
	lastErr := errors.New("could not create store")
	for attempt := 0; attempt < 5; attempt++ {
		slug := baseSlug
		if attempt > 0 {
			slug = fmt.Sprintf("%s-%d", baseSlug, attempt+1)
		}
		row := r.db.QueryRow(ctx, `
		INSERT INTO stores (owner_id, name, slug, niche, description, region, city, currency, status, theme_code, style, contacts)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10, $11::jsonb)
		RETURNING id::text, owner_id::text, name, slug, COALESCE(niche, ''), COALESCE(description, ''), COALESCE(region, ''), COALESCE(city, ''), currency, status, COALESCE(theme_code, ''), COALESCE(style, ''), contacts, created_at, updated_at
	`, store.OwnerID, store.Name, slug, store.Niche, store.Description, store.Region, store.City, fallback(store.Currency, "RUB"), store.Theme, fallback(store.Style, store.Theme), string(contacts))
		created, err := scanStore(row)
		if err == nil {
			return created, nil
		}
		lastErr = err
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			continue
		}
		return Store{}, err
	}
	return Store{}, lastErr
}

func (r *Repository) StoreCountByOwner(ctx context.Context, ownerID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM stores WHERE owner_id = $1 AND deleted_at IS NULL`, ownerID).Scan(&count)
	return count, err
}

func (r *Repository) Stores(ctx context.Context) ([]Store, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, owner_id::text, name, slug, COALESCE(niche, ''), COALESCE(description, ''), COALESCE(region, ''), COALESCE(city, ''), currency, status, COALESCE(theme_code, ''), COALESCE(style, ''), contacts, created_at, updated_at
		FROM stores WHERE deleted_at IS NULL ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanStores(rows)
}

func (r *Repository) StoresByOwner(ctx context.Context, ownerID string, limit, offset int) ([]Store, int, error) {
	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM stores WHERE owner_id = $1 AND deleted_at IS NULL`, ownerID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(ctx, `
		SELECT id::text, owner_id::text, name, slug, COALESCE(niche, ''), COALESCE(description, ''), COALESCE(region, ''), COALESCE(city, ''), currency, status, COALESCE(theme_code, ''), COALESCE(style, ''), contacts, created_at, updated_at
		FROM stores WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3
	`, ownerID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	stores, err := scanStores(rows)
	return stores, total, err
}

func (r *Repository) StoreByID(ctx context.Context, id string) (Store, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id::text, owner_id::text, name, slug, COALESCE(niche, ''), COALESCE(description, ''), COALESCE(region, ''), COALESCE(city, ''), currency, status, COALESCE(theme_code, ''), COALESCE(style, ''), contacts, created_at, updated_at
		FROM stores WHERE id = $1 AND deleted_at IS NULL
	`, id)
	return scanStore(row)
}

func (r *Repository) StoreBySlug(ctx context.Context, slug string) (Store, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id::text, owner_id::text, name, slug, COALESCE(niche, ''), COALESCE(description, ''), COALESCE(region, ''), COALESCE(city, ''), currency, status, COALESCE(theme_code, ''), COALESCE(style, ''), contacts, created_at, updated_at
		FROM stores WHERE slug = $1 AND deleted_at IS NULL
	`, slug)
	return scanStore(row)
}

func (r *Repository) CreateProduct(ctx context.Context, product Product) (Product, error) {
	attrs, _ := json.Marshal(product.Attributes)
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Product{}, err
	}
	defer tx.Rollback(ctx)
	row := tx.QueryRow(ctx, `
		INSERT INTO products (store_id, category_id, title, slug, description, short_description, price, old_price, currency, stock_quantity, sku, status, attributes, seo_title, seo_description, image, featured)
		VALUES ($1, nullif($2, '')::uuid, $3, $4, $5, $6, $7, nullif($8, 0), $9, $10, $11, $12, $13::jsonb, $14, $15, nullif($16, ''), $17)
		RETURNING id::text, store_id::text, COALESCE(category_id::text, ''), title, slug, COALESCE(description, ''), COALESCE(short_description, ''), price, COALESCE(old_price, 0), currency, COALESCE(image, ''), featured, stock_quantity, COALESCE(sku, ''), status, attributes, COALESCE(seo_title, ''), COALESCE(seo_description, ''), created_at
	`, product.StoreID, product.CategoryID, product.Title, Slugify(product.Title), product.Description, product.ShortDescription, product.Price, product.OldPrice, fallback(product.Currency, "RUB"), product.StockQuantity, product.SKU, fallback(product.Status, "active"), string(attrs), product.SEOTitle, product.SEODescription, product.Image, product.Featured)
	created, err := scanProduct(row)
	if err != nil {
		return Product{}, err
	}
	for i, image := range product.Images {
		if _, err := tx.Exec(ctx, `INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)`, created.ID, image, i); err != nil {
			return Product{}, err
		}
	}
	return created, tx.Commit(ctx)
}

func (r *Repository) ProductCountByStore(ctx context.Context, storeID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM products WHERE store_id = $1 AND deleted_at IS NULL`, storeID).Scan(&count)
	return count, err
}

func (r *Repository) AddProductImage(ctx context.Context, productID, url string) error {
	var sortOrder int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM product_images WHERE product_id = $1`, productID).Scan(&sortOrder)
	_, err := r.db.Exec(ctx, `INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)`, productID, url, sortOrder)
	return err
}

func (r *Repository) ProductsByStore(ctx context.Context, storeID string, limit, offset int) ([]Product, int, error) {
	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM products WHERE store_id = $1 AND deleted_at IS NULL`, storeID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(ctx, productSelect()+` WHERE p.store_id = $1 AND p.deleted_at IS NULL ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`, storeID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	products, err := scanProducts(rows)
	if err != nil {
		return nil, 0, err
	}
	for i := range products {
		products[i].Images, _ = r.productImages(ctx, products[i].ID)
	}
	return products, total, nil
}

func (r *Repository) ProductByID(ctx context.Context, id string) (Product, error) {
	row := r.db.QueryRow(ctx, productSelect()+` WHERE p.id = $1 AND p.deleted_at IS NULL`, id)
	product, err := scanProduct(row)
	if err != nil {
		return Product{}, err
	}
	product.Images, _ = r.productImages(ctx, product.ID)
	return product, nil
}

func (r *Repository) CreateOrder(ctx context.Context, order Order) (Order, error) {
	if len(order.Items) == 0 {
		return Order{}, errors.New("order requires at least one item")
	}
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx)
	if order.IdempotencyKey != "" {
		existing := tx.QueryRow(ctx, `
			SELECT id::text, store_id::text, status, payment_status, delivery_status, customer_name, customer_phone, COALESCE(customer_city, ''), COALESCE(customer_address, ''), COALESCE(comment, ''), total_amount, created_at
			FROM orders
			WHERE store_id = $1 AND idempotency_key = $2 AND deleted_at IS NULL
		`, order.StoreID, order.IdempotencyKey)
		if found, err := scanOrder(existing); err == nil {
			found.Items, _ = r.orderItems(ctx, tx, found.ID)
			return found, nil
		}
	}
	var customerID string
	err = tx.QueryRow(ctx, `
		INSERT INTO customers (store_id, name, phone, city)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (store_id, phone) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city
		RETURNING id::text
	`, order.StoreID, order.CustomerName, order.CustomerPhone, order.CustomerCity).Scan(&customerID)
	if err != nil {
		return Order{}, err
	}
	var total int64
	for i := range order.Items {
		if order.Items[i].Quantity <= 0 {
			order.Items[i].Quantity = 1
		}
		if order.Items[i].ProductID != "" {
			var title string
			var price int64
			tag, err := tx.Exec(ctx, `
				UPDATE products
				SET stock_quantity = stock_quantity - $2, updated_at = now()
				WHERE id = $1 AND store_id = $3 AND deleted_at IS NULL AND status = 'active' AND stock_quantity >= $2
			`, order.Items[i].ProductID, order.Items[i].Quantity, order.StoreID)
			if err != nil {
				return Order{}, err
			}
			if tag.RowsAffected() != 1 {
				return Order{}, errors.New("product is unavailable or stock is not enough")
			}
			if err := tx.QueryRow(ctx, `SELECT title, price FROM products WHERE id = $1`, order.Items[i].ProductID).Scan(&title, &price); err != nil {
				return Order{}, err
			}
			order.Items[i].Title = title
			order.Items[i].Price = price
		}
		if order.Items[i].Price <= 0 {
			return Order{}, errors.New("order item price must be positive")
		}
		order.Items[i].Total = order.Items[i].Price * int64(order.Items[i].Quantity)
		total += order.Items[i].Total
	}
	row := tx.QueryRow(ctx, `
		INSERT INTO orders (store_id, customer_id, idempotency_key, status, total_amount, payment_status, delivery_status, customer_name, customer_phone, customer_city, customer_address, comment)
		VALUES ($1, $2, nullif($3, ''), 'new', $4, 'pending', 'new', $5, $6, $7, $8, $9)
		RETURNING id::text, store_id::text, status, payment_status, delivery_status, customer_name, customer_phone, COALESCE(customer_city, ''), COALESCE(customer_address, ''), COALESCE(comment, ''), total_amount, created_at
	`, order.StoreID, customerID, order.IdempotencyKey, total, order.CustomerName, order.CustomerPhone, order.CustomerCity, order.CustomerAddress, order.Comment)
	created, err := scanOrder(row)
	if err != nil {
		return Order{}, err
	}
	for _, item := range order.Items {
		_, err = tx.Exec(ctx, `INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES ($1, nullif($2, '')::uuid, $3, $4, $5)`, created.ID, item.ProductID, item.Quantity, item.Price, item.Total)
		if err != nil {
			return Order{}, err
		}
	}
	if _, err := tx.Exec(ctx, `INSERT INTO order_events (order_id, event, metadata) VALUES ($1, 'created', '{}'::jsonb)`, created.ID); err != nil {
		return Order{}, err
	}
	created.Items = order.Items
	return created, tx.Commit(ctx)
}

func (r *Repository) OrdersByStore(ctx context.Context, storeID string, limit, offset int) ([]Order, int, error) {
	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM orders WHERE store_id = $1 AND deleted_at IS NULL`, storeID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(ctx, `
		SELECT id::text, store_id::text, status, payment_status, delivery_status, customer_name, customer_phone, COALESCE(customer_city, ''), COALESCE(customer_address, ''), COALESCE(comment, ''), total_amount, created_at
		FROM orders WHERE store_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3
	`, storeID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	orders := []Order{}
	for rows.Next() {
		order, err := scanOrder(rows)
		if err != nil {
			return nil, 0, err
		}
		orders = append(orders, order)
	}
	return orders, total, rows.Err()
}

func (r *Repository) CreateLead(ctx context.Context, lead Lead) (Lead, error) {
	row := r.db.QueryRow(ctx, `
		INSERT INTO leads (store_id, customer_name, phone, message, status)
		VALUES ($1, $2, $3, $4, COALESCE(nullif($5, ''), 'new'))
		RETURNING id::text, store_id::text, customer_name, phone, COALESCE(message, ''), status, created_at
	`, lead.StoreID, lead.CustomerName, lead.Phone, lead.Message, lead.Status)
	return scanLead(row)
}

func (r *Repository) LeadsByStore(ctx context.Context, storeID string, limit, offset int) ([]Lead, int, error) {
	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*)::int FROM leads WHERE store_id = $1`, storeID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(ctx, `
		SELECT id::text, store_id::text, customer_name, phone, COALESCE(message, ''), status, created_at
		FROM leads
		WHERE store_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, storeID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	leads := []Lead{}
	for rows.Next() {
		lead, scanErr := scanLead(rows)
		if scanErr != nil {
			return nil, 0, scanErr
		}
		leads = append(leads, lead)
	}
	return leads, total, rows.Err()
}

func (r *Repository) AddGeneration(ctx context.Context, generation AIGeneration) (AIGeneration, error) {
	row := r.db.QueryRow(ctx, `
		INSERT INTO ai_generations (user_id, store_id, type, input, output, tokens_used, provider, status, cost)
		VALUES (nullif($1, '')::uuid, nullif($2, '')::uuid, $3, to_jsonb($4::text), to_jsonb($5::text), $6, $7, $8, $9)
		RETURNING id::text, COALESCE(user_id::text, ''), COALESCE(store_id::text, ''), type, input::text, output::text, tokens_used, provider, status, cost::float8, created_at
	`, generation.UserID, generation.StoreID, generation.Type, generation.Input, generation.Output, generation.TokensUsed, generation.Provider, generation.Status, generation.Cost)
	return scanGeneration(row)
}

func (r *Repository) AIGenerationCountThisMonth(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM ai_generations
		WHERE user_id = $1 AND created_at >= date_trunc('month', now())
	`, userID).Scan(&count)
	return count, err
}

func (r *Repository) CustomersByStore(ctx context.Context, storeID string) ([]Customer, error) {
	rows, err := r.db.Query(ctx, `
		SELECT c.id::text, c.store_id::text, c.name, c.phone, COALESCE(c.email, ''), COALESCE(c.telegram_id, ''), COALESCE(c.whatsapp, ''), COALESCE(c.city, ''),
		       COUNT(o.id)::int, COALESCE(SUM(o.total_amount), 0)::bigint, c.created_at
		FROM customers c
		LEFT JOIN orders o ON o.customer_id = c.id AND o.deleted_at IS NULL
		WHERE c.store_id = $1 AND c.deleted_at IS NULL
		GROUP BY c.id
		ORDER BY c.created_at DESC
	`, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	customers := []Customer{}
	for rows.Next() {
		var customer Customer
		if err := rows.Scan(&customer.ID, &customer.StoreID, &customer.Name, &customer.Phone, &customer.Email, &customer.TelegramID, &customer.WhatsApp, &customer.City, &customer.OrdersCount, &customer.TotalSpent, &customer.CreatedAt); err != nil {
			return nil, err
		}
		customers = append(customers, customer)
	}
	return customers, rows.Err()
}

func (r *Repository) Themes(ctx context.Context) ([]Theme, error) {
	rows, err := r.db.Query(ctx, `SELECT id::text, code, title, config::text, created_at FROM themes ORDER BY title`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	themes := []Theme{}
	for rows.Next() {
		var theme Theme
		if err := rows.Scan(&theme.ID, &theme.Code, &theme.Title, &theme.Config, &theme.CreatedAt); err != nil {
			return nil, err
		}
		themes = append(themes, theme)
	}
	return themes, rows.Err()
}

func (r *Repository) CreateTelegramConnectCode(ctx context.Context, userID, storeID string) (TelegramConnection, error) {
	code := shortCode()
	row := r.db.QueryRow(ctx, `
		INSERT INTO telegram_connections (code, user_id, store_id, status, expires_at)
		VALUES ($1, $2, $3, 'pending', now() + interval '15 minutes')
		RETURNING code, user_id::text, store_id::text, COALESCE(telegram_id, ''), status, expires_at, created_at
	`, code, userID, storeID)
	return scanTelegramConnection(row)
}

func (r *Repository) BindTelegramCode(ctx context.Context, code, telegramID string) (TelegramConnection, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return TelegramConnection{}, err
	}
	defer tx.Rollback(ctx)
	row := tx.QueryRow(ctx, `
		UPDATE telegram_connections
		SET telegram_id = $2, status = 'connected', connected_at = now()
		WHERE code = $1 AND status = 'pending' AND expires_at > now()
		RETURNING code, user_id::text, store_id::text, COALESCE(telegram_id, ''), status, expires_at, created_at
	`, code, telegramID)
	connection, err := scanTelegramConnection(row)
	if err != nil {
		return TelegramConnection{}, err
	}
	if _, err := tx.Exec(ctx, `UPDATE stores SET contacts = jsonb_set(contacts, '{telegram}', to_jsonb($1::text), true), updated_at = now() WHERE id = $2`, telegramID, connection.StoreID); err != nil {
		return TelegramConnection{}, err
	}
	return connection, tx.Commit(ctx)
}

func (r *Repository) TelegramStatus(ctx context.Context, storeID string) (TelegramConnection, error) {
	row := r.db.QueryRow(ctx, `
		SELECT code, user_id::text, store_id::text, COALESCE(telegram_id, ''), status, expires_at, created_at
		FROM telegram_connections
		WHERE store_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`, storeID)
	return scanTelegramConnection(row)
}

func (r *Repository) AddAuditLog(ctx context.Context, log AuditLog) error {
	metadata := log.Metadata
	if metadata == "" {
		metadata = "{}"
	}
	_, err := r.db.Exec(ctx, `
		INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
		VALUES (nullif($1, '')::uuid, $2, $3, $4, $5::jsonb)
	`, log.UserID, log.Action, log.EntityType, log.EntityID, metadata)
	return err
}

func (r *Repository) AddNotificationJob(ctx context.Context, job NotificationJob) (NotificationJob, error) {
	row := r.db.QueryRow(ctx, `
		INSERT INTO notification_jobs (store_id, order_id, channel, status, payload)
		VALUES ($1, $2, $3, $4, $5::jsonb)
		RETURNING id::text, store_id::text, order_id::text, channel, status, payload::text, created_at
	`, job.StoreID, job.OrderID, job.Channel, fallback(job.Status, "queued"), fallback(job.Payload, "{}"))
	return scanNotificationJob(row)
}

func (r *Repository) NotificationJobsByOrder(ctx context.Context, orderID string) ([]NotificationJob, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, store_id::text, order_id::text, channel, status, payload::text, created_at
		FROM notification_jobs
		WHERE order_id = $1
		ORDER BY created_at DESC
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	jobs := []NotificationJob{}
	for rows.Next() {
		job, err := scanNotificationJob(rows)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, rows.Err()
}

func (r *Repository) TariffLimitsByStore(ctx context.Context, storeID string) (TariffLimits, error) {
	var limits TariffLimits
	err := r.db.QueryRow(ctx, `
		SELECT COALESCE(t.code, 'free'), COALESCE(t.store_limit, 1), COALESCE(t.product_limit, 10), COALESCE(t.ai_generation_limit, 20)
		FROM stores s
		LEFT JOIN tariffs t ON t.id = s.tariff_id
		WHERE s.id = $1
	`, storeID).Scan(&limits.Code, &limits.StoreLimit, &limits.ProductLimit, &limits.AIGenerationLimit)
	if err != nil {
		return TariffLimits{Code: "free", StoreLimit: 1, ProductLimit: 10, AIGenerationLimit: 20}, err
	}
	return limits, nil
}

func DefaultFreeLimits() TariffLimits {
	return TariffLimits{Code: "free", StoreLimit: 1, ProductLimit: 10, AIGenerationLimit: 20}
}

func scanUser(row pgx.Row) (User, error) {
	var user User
	err := row.Scan(&user.ID, &user.Phone, &user.Email, &user.Name, &user.PasswordHash, &user.Role, &user.Status, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

func scanStore(row pgx.Row) (Store, error) {
	var store Store
	var contacts []byte
	err := row.Scan(&store.ID, &store.OwnerID, &store.Name, &store.Slug, &store.Niche, &store.Description, &store.Region, &store.City, &store.Currency, &store.Status, &store.Theme, &store.Style, &contacts, &store.CreatedAt, &store.UpdatedAt)
	if len(contacts) > 0 {
		_ = json.Unmarshal(contacts, &store.Contacts)
	}
	return store, err
}

func scanStores(rows pgx.Rows) ([]Store, error) {
	stores := []Store{}
	for rows.Next() {
		store, err := scanStore(rows)
		if err != nil {
			return nil, err
		}
		stores = append(stores, store)
	}
	return stores, rows.Err()
}

func productSelect() string {
	return `SELECT p.id::text, p.store_id::text, COALESCE(p.category_id::text, ''), p.title, p.slug, COALESCE(p.description, ''), COALESCE(p.short_description, ''), p.price, COALESCE(p.old_price, 0), p.currency, COALESCE(p.image, ''), p.featured, p.stock_quantity, COALESCE(p.sku, ''), p.status, p.attributes, COALESCE(p.seo_title, ''), COALESCE(p.seo_description, ''), p.created_at FROM products p`
}

func scanProduct(row pgx.Row) (Product, error) {
	var product Product
	var attrs []byte
	err := row.Scan(&product.ID, &product.StoreID, &product.CategoryID, &product.Title, &product.Slug, &product.Description, &product.ShortDescription, &product.Price, &product.OldPrice, &product.Currency, &product.Image, &product.Featured, &product.StockQuantity, &product.SKU, &product.Status, &attrs, &product.SEOTitle, &product.SEODescription, &product.CreatedAt)
	if len(attrs) > 0 {
		_ = json.Unmarshal(attrs, &product.Attributes)
	}
	return product, err
}

func scanProducts(rows pgx.Rows) ([]Product, error) {
	products := []Product{}
	for rows.Next() {
		product, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}
	return products, rows.Err()
}

func (r *Repository) productImages(ctx context.Context, productID string) ([]string, error) {
	rows, err := r.db.Query(ctx, `SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	images := []string{}
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			return nil, err
		}
		images = append(images, url)
	}
	return images, rows.Err()
}

type queryer interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

func (r *Repository) orderItems(ctx context.Context, q queryer, orderID string) ([]OrderItem, error) {
	rows, err := q.Query(ctx, `
		SELECT COALESCE(oi.product_id::text, ''), COALESCE(p.title, ''), oi.quantity, oi.price, oi.total
		FROM order_items oi
		LEFT JOIN products p ON p.id = oi.product_id
		WHERE oi.order_id = $1
		ORDER BY oi.id
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []OrderItem{}
	for rows.Next() {
		var item OrderItem
		if err := rows.Scan(&item.ProductID, &item.Title, &item.Quantity, &item.Price, &item.Total); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func scanOrder(row pgx.Row) (Order, error) {
	var order Order
	err := row.Scan(&order.ID, &order.StoreID, &order.Status, &order.PaymentStatus, &order.DeliveryStatus, &order.CustomerName, &order.CustomerPhone, &order.CustomerCity, &order.CustomerAddress, &order.Comment, &order.TotalAmount, &order.CreatedAt)
	return order, err
}

func scanGeneration(row pgx.Row) (AIGeneration, error) {
	var generation AIGeneration
	err := row.Scan(&generation.ID, &generation.UserID, &generation.StoreID, &generation.Type, &generation.Input, &generation.Output, &generation.TokensUsed, &generation.Provider, &generation.Status, &generation.Cost, &generation.CreatedAt)
	return generation, err
}

func scanTelegramConnection(row pgx.Row) (TelegramConnection, error) {
	var connection TelegramConnection
	err := row.Scan(&connection.Code, &connection.UserID, &connection.StoreID, &connection.TelegramID, &connection.Status, &connection.ExpiresAt, &connection.CreatedAt)
	return connection, err
}

func scanNotificationJob(row pgx.Row) (NotificationJob, error) {
	var job NotificationJob
	err := row.Scan(&job.ID, &job.StoreID, &job.OrderID, &job.Channel, &job.Status, &job.Payload, &job.CreatedAt)
	return job, err
}

func scanLead(row pgx.Row) (Lead, error) {
	var lead Lead
	err := row.Scan(&lead.ID, &lead.StoreID, &lead.CustomerName, &lead.Phone, &lead.Message, &lead.Status, &lead.CreatedAt)
	return lead, err
}

func nullString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func fallback(value, fallbackValue string) string {
	if value == "" {
		return fallbackValue
	}
	return value
}

func StoreURL(baseURL, slug string) string {
	return fmt.Sprintf("%s/store/%s", stringsTrimRight(baseURL, "/"), slug)
}

func stringsTrimRight(value, cutset string) string {
	for len(value) > 0 && contains(cutset, value[len(value)-1]) {
		value = value[:len(value)-1]
	}
	return value
}

func contains(value string, b byte) bool {
	for i := 0; i < len(value); i++ {
		if value[i] == b {
			return true
		}
	}
	return false
}

func shortCode() string {
	alphabet := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	bytes := make([]byte, 6)
	for i := range bytes {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			bytes[i] = alphabet[i%len(alphabet)]
			continue
		}
		bytes[i] = alphabet[n.Int64()]
	}
	return string(bytes)
}
