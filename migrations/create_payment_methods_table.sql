-- Create payment_methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(255) NOT NULL,
    provider_code VARCHAR(255) NOT NULL UNIQUE,
    image_url TEXT,
    description TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    display_order INTEGER NOT NULL DEFAULT 0,
    public_key TEXT,
    secret_key TEXT,
    merchant_id TEXT,
    callback_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE UNIQUE INDEX payment_methods_provider_code_unique ON payment_methods(provider_code);
CREATE INDEX payment_methods_status_idx ON payment_methods(status);
CREATE INDEX payment_methods_display_order_idx ON payment_methods(display_order);
