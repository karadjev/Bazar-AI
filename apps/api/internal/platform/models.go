package platform

import "time"

type User struct {
	ID           string    `json:"id"`
	Phone        string    `json:"phone,omitempty"`
	Email        string    `json:"email,omitempty"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Store struct {
	ID          string    `json:"id"`
	OwnerID     string    `json:"owner_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Region      string    `json:"region"`
	City        string    `json:"city"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	Tariff      string    `json:"tariff"`
	Theme       string    `json:"theme"`
	Contacts    Contacts  `json:"contacts"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Contacts struct {
	Phone     string `json:"phone,omitempty"`
	WhatsApp  string `json:"whatsapp,omitempty"`
	Telegram  string `json:"telegram,omitempty"`
	Instagram string `json:"instagram,omitempty"`
	Address   string `json:"address,omitempty"`
	Schedule  string `json:"schedule,omitempty"`
}

type Product struct {
	ID               string            `json:"id"`
	StoreID          string            `json:"store_id"`
	CategoryID       string            `json:"category_id,omitempty"`
	Title            string            `json:"title"`
	Slug             string            `json:"slug"`
	Description      string            `json:"description"`
	ShortDescription string            `json:"short_description"`
	Price            int64             `json:"price"`
	OldPrice         int64             `json:"old_price,omitempty"`
	Currency         string            `json:"currency"`
	Images           []string          `json:"images"`
	StockQuantity    int               `json:"stock_quantity"`
	SKU              string            `json:"sku"`
	Status           string            `json:"status"`
	Attributes       map[string]string `json:"attributes"`
	SEOTitle         string            `json:"seo_title"`
	SEODescription   string            `json:"seo_description"`
	CreatedAt        time.Time         `json:"created_at"`
}

type Order struct {
	ID              string      `json:"id"`
	StoreID         string      `json:"store_id"`
	IdempotencyKey  string      `json:"idempotency_key,omitempty"`
	Status          string      `json:"status"`
	PaymentStatus   string      `json:"payment_status"`
	DeliveryStatus  string      `json:"delivery_status"`
	CustomerName    string      `json:"customer_name"`
	CustomerPhone   string      `json:"customer_phone"`
	CustomerCity    string      `json:"customer_city"`
	CustomerAddress string      `json:"customer_address"`
	Comment         string      `json:"comment"`
	Items           []OrderItem `json:"items"`
	TotalAmount     int64       `json:"total_amount"`
	CreatedAt       time.Time   `json:"created_at"`
}

type OrderItem struct {
	ProductID string `json:"product_id"`
	Title     string `json:"title"`
	Quantity  int    `json:"quantity"`
	Price     int64  `json:"price"`
	Total     int64  `json:"total"`
}

type Customer struct {
	ID          string    `json:"id"`
	StoreID     string    `json:"store_id"`
	Name        string    `json:"name"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email,omitempty"`
	TelegramID  string    `json:"telegram_id,omitempty"`
	WhatsApp    string    `json:"whatsapp,omitempty"`
	City        string    `json:"city,omitempty"`
	OrdersCount int       `json:"orders_count"`
	TotalSpent  int64     `json:"total_spent"`
	CreatedAt   time.Time `json:"created_at"`
}

type AIGeneration struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	StoreID    string    `json:"store_id"`
	Type       string    `json:"type"`
	Input      string    `json:"input"`
	Output     string    `json:"output"`
	TokensUsed int       `json:"tokens_used"`
	Provider   string    `json:"provider"`
	Status     string    `json:"status"`
	Cost       float64   `json:"cost"`
	CreatedAt  time.Time `json:"created_at"`
}

type Theme struct {
	ID        string    `json:"id"`
	Code      string    `json:"code"`
	Title     string    `json:"title"`
	Config    string    `json:"config"`
	CreatedAt time.Time `json:"created_at"`
}

type TelegramConnection struct {
	Code       string    `json:"code"`
	UserID     string    `json:"user_id"`
	StoreID    string    `json:"store_id"`
	TelegramID string    `json:"telegram_id,omitempty"`
	Status     string    `json:"status"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
}

type AuditLog struct {
	UserID     string `json:"user_id,omitempty"`
	Action     string `json:"action"`
	EntityType string `json:"entity_type,omitempty"`
	EntityID   string `json:"entity_id,omitempty"`
	Metadata   string `json:"metadata,omitempty"`
}

type NotificationJob struct {
	ID        string    `json:"id"`
	StoreID   string    `json:"store_id"`
	OrderID   string    `json:"order_id"`
	Channel   string    `json:"channel"`
	Status    string    `json:"status"`
	Payload   string    `json:"payload"`
	CreatedAt time.Time `json:"created_at"`
}

type TariffLimits struct {
	Code              string `json:"code"`
	StoreLimit        int    `json:"store_limit"`
	ProductLimit      int    `json:"product_limit"`
	AIGenerationLimit int    `json:"ai_generation_limit"`
}

type OrderEvent struct {
	ID        string    `json:"id"`
	OrderID   string    `json:"order_id"`
	Event     string    `json:"event"`
	Metadata  string    `json:"metadata"`
	CreatedAt time.Time `json:"created_at"`
}
