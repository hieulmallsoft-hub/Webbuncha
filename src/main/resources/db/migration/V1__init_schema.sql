CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    age INTEGER,
    address VARCHAR(255),
    role VARCHAR(20),
    gender VARCHAR(255),
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_phone UNIQUE (phone)
);

CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE SEQUENCE IF NOT EXISTS public.products_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT NOT NULL DEFAULT nextval('public.products_seq') PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE SEQUENCE IF NOT EXISTS public.orders_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.orders (
    id BIGINT NOT NULL DEFAULT nextval('public.orders_seq') PRIMARY KEY,
    description VARCHAR(255),
    receiver_name VARCHAR(255),
    order_type VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20),
    delivery_address VARCHAR(255),
    table_number VARCHAR(50),
    reservation_time TIMESTAMP,
    payment_method VARCHAR(20),
    status VARCHAR(20),
    user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE SEQUENCE IF NOT EXISTS public.order_items_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGINT NOT NULL DEFAULT nextval('public.order_items_seq') PRIMARY KEY,
    product VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description VARCHAR(255),
    order_id BIGINT NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL,
    CONSTRAINT uk_refresh_tokens_token UNIQUE (token),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.auth_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    requested_ip VARCHAR(64),
    requested_user_agent VARCHAR(512),
    CONSTRAINT uk_auth_tokens_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_email_type_created ON public.auth_tokens (email, type, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_type_created ON public.auth_tokens (user_id, type, created_at);

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(1024) NOT NULL,
    platform VARCHAR(30) NOT NULL,
    user_agent VARCHAR(1000),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_device_tokens_token UNIQUE (token),
    CONSTRAINT fk_device_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON public.device_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_enabled ON public.device_tokens (enabled);
