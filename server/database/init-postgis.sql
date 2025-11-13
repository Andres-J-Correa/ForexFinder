-- Enable PostGIS extension for geospatial queries
-- This script should be run once on the database before starting the application

CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS is installed
SELECT PostGIS_version();

-- Create spatial index on shops coordinates (GIST index for geography type)
-- This will be created automatically after the shops table is created by TypeORM
-- Run this after the first application startup if synchronize is enabled
CREATE INDEX IF NOT EXISTS idx_shops_coordinates ON shops USING GIST(coordinates);

-- Create additional indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_rates_shop_currency ON rates(shop_id, from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_rates_currency_time ON rates(from_currency, to_currency, created_at);
CREATE INDEX IF NOT EXISTS idx_location_tokens_hash ON location_tokens(jwt_hash);
CREATE INDEX IF NOT EXISTS idx_location_tokens_unique_id ON location_tokens(unique_id);
CREATE INDEX IF NOT EXISTS idx_location_tokens_used_at ON location_tokens(used_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_user_id);

