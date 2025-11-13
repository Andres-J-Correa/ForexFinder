# Database Setup

## PostGIS Extension

This project uses PostgreSQL with PostGIS extension for geospatial queries. Follow these steps to set up the database:

### 1. Install PostGIS

Make sure PostGIS is installed on your PostgreSQL server:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-postgis

# macOS (via Homebrew)
brew install postgis

# Windows
# Install via PostgreSQL installer or Stack Builder
```

### 2. Enable PostGIS Extension

Run the initialization script to enable PostGIS and create necessary indexes:

```bash
psql -U your_username -d your_database -f init-postgis.sql
```

Or connect to your database and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Verify PostGIS Installation

Check if PostGIS is properly installed:

```sql
SELECT PostGIS_version();
```

### 4. Database Synchronization

The application uses TypeORM's `synchronize` mode (controlled by `DB_SYNCHRONIZE` environment variable). When enabled, TypeORM will automatically create/update the database schema based on entity definitions.

**Important**: After the first startup, run the index creation statements from `init-postgis.sql` to ensure optimal performance for spatial queries.

### 5. Manual Index Creation

If you prefer to create indexes manually or after TypeORM synchronization, run:

```sql
-- Spatial index for shops coordinates
CREATE INDEX IF NOT EXISTS idx_shops_coordinates ON shops USING GIST(coordinates);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_rates_shop_currency ON rates(shop_id, from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_rates_currency_time ON rates(from_currency, to_currency, created_at);
CREATE INDEX IF NOT EXISTS idx_location_tokens_hash ON location_tokens(jwt_hash);
CREATE INDEX IF NOT EXISTS idx_location_tokens_used_at ON location_tokens(used_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_user_id);
```

## Schema Overview

### Tables

- **users**: User accounts with roles (user, admin)
- **shops**: Currency exchange shops with geospatial coordinates
- **rates**: Exchange rates (buy/sell) for currency pairs
- **location_tokens**: JWT tokens for shop location registration

### Relationships

- `shops.owner_user_id` → `users.id` (Many-to-One)
- `rates.shop_id` → `shops.id` (Many-to-One)
- `location_tokens.created_by_admin_id` → `users.id` (Many-to-One)
- `location_tokens.shop_id` → `shops.id` (Many-to-One, nullable)

## Environment Variables

Make sure these environment variables are set in your `.env` file:

```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_SYNCHRONIZE=1  # 1 for development, 0 for production
```

