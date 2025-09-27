-- Subscription Management Application Database Schema
-- This migration creates all necessary tables for subscription detection and management

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connected_accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    credentials JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_services table
CREATE TABLE IF NOT EXISTS subscription_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    cancellation_url TEXT,
    cancellation_steps JSONB,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
    service_id UUID REFERENCES subscription_services(id),
    service_name VARCHAR(100) NOT NULL,
    monthly_cost DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    next_billing_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cancellation_attempts table
CREATE TABLE IF NOT EXISTS cancellation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'initiated',
    tracking_id VARCHAR(100) UNIQUE,
    notes TEXT,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_cancellation_attempts_user_id ON cancellation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_attempts_status ON cancellation_attempts(status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Connected accounts policies
CREATE POLICY "Users can view own connected accounts" ON connected_accounts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own connected accounts" ON connected_accounts
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM connected_accounts ca 
            WHERE ca.id = subscriptions.account_id 
            AND ca.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own subscriptions" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM connected_accounts ca 
            WHERE ca.id = subscriptions.account_id 
            AND ca.user_id::text = auth.uid()::text
        )
    );

-- Cancellation attempts policies
CREATE POLICY "Users can view own cancellation attempts" ON cancellation_attempts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own cancellation attempts" ON cancellation_attempts
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Grant permissions to roles
GRANT SELECT ON subscription_services TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON connected_accounts TO authenticated;
GRANT ALL PRIVILEGES ON subscriptions TO authenticated;
GRANT ALL PRIVILEGES ON cancellation_attempts TO authenticated;
GRANT ALL PRIVILEGES ON subscription_services TO authenticated;

-- Insert initial subscription services data
INSERT INTO subscription_services (name, logo_url, cancellation_url, difficulty_rating, category, cancellation_steps) VALUES
('Netflix', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Netflix%20logo%20red%20background%20streaming%20service&image_size=square', 'https://www.netflix.com/cancelplan', 2, 'streaming', 
    '{"steps": ["Sign in to Netflix", "Go to Account settings", "Click Cancel Membership", "Confirm cancellation"], "estimated_time": "5 minutes"}'),
('Spotify', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Spotify%20logo%20green%20music%20streaming&image_size=square', 'https://www.spotify.com/account/subscription/', 2, 'music',
    '{"steps": ["Log into Spotify", "Go to Account Overview", "Click Change or cancel", "Follow cancellation steps"], "estimated_time": "3 minutes"}'),
('Adobe Creative Cloud', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Adobe%20Creative%20Cloud%20logo%20red%20software&image_size=square', 'https://account.adobe.com/plans', 4, 'software',
    '{"steps": ["Sign in to Adobe Account", "Go to Plans & Products", "Find your plan", "Click Cancel plan", "Complete cancellation process"], "estimated_time": "10 minutes"}'),
('Microsoft 365', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Microsoft%20365%20logo%20blue%20office%20software&image_size=square', 'https://account.microsoft.com/services/', 3, 'software',
    '{"steps": ["Sign in to Microsoft Account", "Go to Services & subscriptions", "Find Microsoft 365", "Click Cancel", "Confirm cancellation"], "estimated_time": "7 minutes"}'),
('Amazon Prime', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Amazon%20Prime%20logo%20blue%20shopping%20delivery&image_size=square', 'https://www.amazon.com/gp/help/customer/display.html', 3, 'shopping',
    '{"steps": ["Go to Amazon Account", "Click Prime membership", "Click End membership", "Confirm cancellation"], "estimated_time": "5 minutes"}');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();