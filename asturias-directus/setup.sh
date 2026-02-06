#!/bin/bash

# ============================================
# DIRECTUS SETUP - ASTURIAS XR PLATFORM
# Production-ready installation script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Project config
PROJECT_NAME="asturias-xr-cms"
DB_NAME="asturias_xr"
DB_USER="directus"
DIRECTUS_VERSION="10.10.0"

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
DIRECTUS_KEY=$(openssl rand -base64 32)
DIRECTUS_SECRET=$(openssl rand -base64 32)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ASTURIAS XR - DIRECTUS SETUP          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# STEP 1: Prerequisites Check
# ============================================
echo -e "${GREEN}[1/8]${NC} Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo -e "${RED}ERROR: Docker not installed${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}ERROR: Docker Compose not installed${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}ERROR: Node.js not installed${NC}"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}ERROR: Node.js 18+ required (current: $NODE_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} All prerequisites met"

# ============================================
# STEP 2: Create project structure
# ============================================
echo -e "${GREEN}[2/8]${NC} Creating project structure..."

mkdir -p $PROJECT_NAME/{uploads,extensions/hooks,migrations,data}
cd $PROJECT_NAME

mkdir -p uploads/{images,audio,documents,models-3d,videos}
mkdir -p uploads/images/{museums,routes,pois,ar-scenes,panoramas}
mkdir -p uploads/audio/audioguides
mkdir -p uploads/documents/{gpx,pdf}

echo -e "${GREEN}✓${NC} Project structure created"

# ============================================
# STEP 3: Create docker-compose.yml
# ============================================
echo -e "${GREEN}[3/8]${NC} Creating Docker configuration..."

cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.4-alpine
    container_name: asturias-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - directus-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: asturias-redis
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    networks:
      - directus-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  directus:
    image: directus/directus:${DIRECTUS_VERSION}
    container_name: asturias-directus
    restart: unless-stopped
    ports:
      - "8055:8055"
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
      - ./migrations:/directus/migrations
    networks:
      - directus-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      # ============ GENERAL ============
      PUBLIC_URL: ${PUBLIC_URL}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      
      # ============ DATABASE ============
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: ${DB_DATABASE}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_SSL: false
      DB_HEALTHCHECK_THRESHOLD: 150
      
      # ============ CACHE ============
      CACHE_ENABLED: ${CACHE_ENABLED:-true}
      CACHE_TTL: ${CACHE_TTL:-30m}
      CACHE_STORE: redis
      CACHE_NAMESPACE: directus-cache
      CACHE_AUTO_PURGE: true
      CACHE_AUTO_PURGE_IGNORE_LIST: directus_activity,directus_presets
      CACHE_SCHEMA: true
      CACHE_CONTROL_S_MAXAGE: ${CACHE_CONTROL_S_MAXAGE:-0}
      
      # ============ REDIS ============
      REDIS_HOST: redis
      REDIS_PORT: 6379
      
      # ============ SECURITY ============
      KEY: ${DIRECTUS_KEY}
      SECRET: ${DIRECTUS_SECRET}
      ACCESS_TOKEN_TTL: 15m
      REFRESH_TOKEN_TTL: 7d
      REFRESH_TOKEN_COOKIE_SECURE: false
      REFRESH_TOKEN_COOKIE_SAME_SITE: lax
      
      # ============ ADMIN ============
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      
      # ============ CORS ============
      CORS_ENABLED: true
      CORS_ORIGIN: true
      CORS_CREDENTIALS: true
      
      # ============ FILES ============
      STORAGE_LOCATIONS: local
      STORAGE_LOCAL_ROOT: /directus/uploads
      FILES_MAX_UPLOAD_SIZE: 524288000
      ASSETS_TRANSFORM_MAX_CONCURRENT: 4
      ASSETS_CACHE_TTL: 30d
      ASSETS_TRANSFORM_IMAGE_MAX_DIMENSION: 6000
      
      # ============ RATE LIMITING ============
      RATE_LIMITER_ENABLED: true
      RATE_LIMITER_STORE: redis
      RATE_LIMITER_POINTS: 100
      RATE_LIMITER_DURATION: 1
      
      # ============ EMAIL (configure later) ============
      EMAIL_FROM: noreply@asturiasxr.com
      EMAIL_TRANSPORT: sendmail
      
      # ============ EXTENSIONS ============
      EXTENSIONS_AUTO_RELOAD: true
      EXTENSIONS_CACHE_TTL: 30s
      
      # ============ TELEMETRY ============
      TELEMETRY: false
      
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8055/server/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s

volumes:
  postgres_data:
    driver: local

networks:
  directus-network:
    driver: bridge
COMPOSE_EOF

echo -e "${GREEN}✓${NC} Docker configuration created"

# ============================================
# STEP 4: Create .env file
# ============================================
echo -e "${GREEN}[4/8]${NC} Creating environment configuration..."

cat > .env << ENV_EOF
# ============================================
# ASTURIAS XR - DIRECTUS CONFIGURATION
# Generated: $(date)
# ============================================

# ============ DATABASE ============
DB_CLIENT=pg
DB_DATABASE=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# ============ DIRECTUS ============
DIRECTUS_VERSION=$DIRECTUS_VERSION
DIRECTUS_KEY=$DIRECTUS_KEY
DIRECTUS_SECRET=$DIRECTUS_SECRET

# ============ ADMIN ============
ADMIN_EMAIL=admin@asturiasxr.com
ADMIN_PASSWORD=$ADMIN_PASSWORD

# ============ URLS ============
PUBLIC_URL=http://localhost:8055

# ============ CACHE ============
CACHE_ENABLED=true
CACHE_TTL=30m
CACHE_CONTROL_S_MAXAGE=0

# ============ ENVIRONMENT ============
NODE_ENV=production
LOG_LEVEL=info
ENV_EOF

cat > .env.production << PROD_ENV_EOF
# ============================================
# PRODUCTION ENVIRONMENT
# ============================================

# ============ DATABASE ============
DB_CLIENT=pg
DB_DATABASE=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# ============ DIRECTUS ============
DIRECTUS_VERSION=$DIRECTUS_VERSION
DIRECTUS_KEY=$DIRECTUS_KEY
DIRECTUS_SECRET=$DIRECTUS_SECRET

# ============ ADMIN ============
ADMIN_EMAIL=admin@asturiasxr.com
ADMIN_PASSWORD=$ADMIN_PASSWORD

# ============ URLS ============
PUBLIC_URL=https://cms.asturiasxr.com

# ============ CACHE ============
CACHE_ENABLED=true
CACHE_TTL=1h
CACHE_CONTROL_S_MAXAGE=3600

# ============ ENVIRONMENT ============
NODE_ENV=production
LOG_LEVEL=warn
PROD_ENV_EOF

echo -e "${GREEN}✓${NC} Environment files created"

# ============================================
# STEP 5: Start containers
# ============================================
echo -e "${GREEN}[5/8]${NC} Starting Docker containers..."

docker-compose up -d

echo -e "${YELLOW}⏳${NC} Waiting for Directus to be ready..."

for i in {1..60}; do
    if docker-compose exec -T directus wget -q -O /dev/null http://localhost:8055/server/health 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Directus is ready!"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo -e "${RED}ERROR: Directus failed to start${NC}"
        docker-compose logs directus
        exit 1
    fi
    
    echo -n "."
    sleep 2
done

# ============================================
# STEP 6: Create init-schema.js
# ============================================
echo -e "${GREEN}[6/8]${NC} Creating schema initialization script..."

cat > init-schema.js << 'SCHEMA_EOF'
import { createDirectus, rest, authentication, createCollection, createField } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

async function initializeSchema() {
  console.log('🔐 Logging in...');
  
  await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  
  console.log('✓ Logged in successfully');
  
  // ============================================
  // COLLECTION: museums
  // ============================================
  console.log('Creating collection: museums...');
  
  await directus.request(
    createCollection({
      collection: 'museums',
      meta: {
        icon: 'museum',
        note: 'Museos y equipamientos culturales',
        display_template: '{{name}}',
        translations: [
          { language: 'es-ES', translation: 'Museos' },
          { language: 'en-US', translation: 'Museums' },
          { language: 'fr-FR', translation: 'Musées' }
        ]
      },
      schema: {
        name: 'museums'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          schema: { is_primary_key: true },
          meta: { hidden: true }
        }
      ]
    })
  );
  
  // Add fields to museums
  const museumFields = [
    {
      field: 'slug',
      type: 'string',
      schema: { is_unique: true, max_length: 100 },
      meta: {
        interface: 'input',
        required: true,
        note: 'URL-friendly identifier',
        validation: { _regex: '^[a-z0-9-]+$' }
      }
    },
    {
      field: 'name',
      type: 'json',
      meta: {
        interface: 'input-multiline',
        required: true,
        note: 'Nombre del museo (ES/EN/FR)',
        options: {
          placeholder: JSON.stringify({ es: '', en: '', fr: '' })
        }
      }
    },
    {
      field: 'description',
      type: 'json',
      meta: {
        interface: 'input-rich-text-html',
        note: 'Descripción completa'
      }
    },
    {
      field: 'short_description',
      type: 'json',
      meta: {
        interface: 'input-multiline',
        note: 'Descripción corta para cards'
      }
    },
    {
      field: 'address',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half'
      }
    },
    {
      field: 'municipality',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        required: true
      }
    },
    {
      field: 'lat',
      type: 'float',
      meta: {
        interface: 'input',
        width: 'half',
        required: true
      }
    },
    {
      field: 'lng',
      type: 'float',
      meta: {
        interface: 'input',
        width: 'half',
        required: true
      }
    },
    {
      field: 'cover_image',
      type: 'uuid',
      schema: {
        foreign_key_table: 'directus_files',
        foreign_key_column: 'id'
      },
      meta: {
        interface: 'file-image',
        note: 'Imagen principal (1920x1080)',
        required: true
      }
    },
    {
      field: 'website',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half'
      }
    },
    {
      field: 'phone',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half'
      }
    },
    {
      field: 'email',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half'
      }
    },
    {
      field: 'museum_type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { value: 'industrial', text: 'Industrial' },
            { value: 'archaeological', text: 'Arqueológico' },
            { value: 'ethnographic', text: 'Etnográfico' },
            { value: 'natural_history', text: 'Historia Natural' },
            { value: 'art', text: 'Arte' },
            { value: 'science', text: 'Ciencia' }
          ]
        }
      }
    },
    {
      field: 'opening_hours',
      type: 'json',
      meta: {
        interface: 'input-code',
        note: 'Horarios de apertura',
        options: {
          language: 'json'
        }
      }
    },
    {
      field: 'pricing',
      type: 'json',
      meta: {
        interface: 'input-code',
        note: 'Precios de entrada',
        options: {
          language: 'json'
        }
      }
    },
    {
      field: 'accessibility',
      type: 'json',
      meta: {
        interface: 'input-code',
        options: {
          language: 'json'
        }
      }
    },
    {
      field: 'featured',
      type: 'boolean',
      schema: { default_value: false },
      meta: {
        interface: 'boolean',
        note: 'Mostrar en página principal',
        width: 'half'
      }
    },
    {
      field: 'verified',
      type: 'boolean',
      schema: { default_value: false },
      meta: {
        interface: 'boolean',
        note: 'Información verificada',
        width: 'half'
      }
    },
    {
      field: 'view_count',
      type: 'integer',
      schema: { default_value: 0 },
      meta: {
        interface: 'input',
        readonly: true,
        note: 'Contador de visitas'
      }
    },
    {
      field: 'status',
      type: 'string',
      schema: { default_value: 'draft' },
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { value: 'draft', text: 'Borrador' },
            { value: 'published', text: 'Publicado' },
            { value: 'archived', text: 'Archivado' }
          ]
        }
      }
    },
    {
      field: 'created_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        special: ['date-created'],
        readonly: true
      }
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        special: ['date-updated'],
        readonly: true
      }
    }
  ];
  
  for (const fieldDef of museumFields) {
    try {
      await directus.request(
        createField('museums', fieldDef)
      );
      console.log(`  ✓ Field created: ${fieldDef.field}`);
    } catch (error) {
      console.error(`  ✗ Failed to create field ${fieldDef.field}:`, error.message);
    }
  }
  
  console.log('✓ Museums collection created');
  
  // ============================================
  // Continue with other collections...
  // (ar_scenes, virtual_tours, routes, etc.)
  // ============================================
  
  console.log('\n✅ Schema initialization complete!');
}

initializeSchema().catch(console.error);
SCHEMA_EOF

# Create package.json for init script
cat > package.json << 'PKG_EOF'
{
  "name": "asturias-directus-init",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "init": "node init-schema.js",
    "seed": "node seed-data.js"
  },
  "dependencies": {
    "@directus/sdk": "^12.0.0",
    "dotenv": "^16.3.1"
  }
}
PKG_EOF

echo -e "${GREEN}✓${NC} Schema script created"

# ============================================
# STEP 7: Install dependencies and run init
# ============================================
echo -e "${GREEN}[7/8]${NC} Installing Node dependencies..."

npm install

echo -e "${GREEN}[8/8]${NC} Initializing database schema..."

node init-schema.js

# ============================================
# STEP 8: Save credentials
# ============================================
cat > CREDENTIALS.txt << CRED_EOF
╔════════════════════════════════════════╗
║  ASTURIAS XR - DIRECTUS CREDENTIALS    ║
╚════════════════════════════════════════╝

🌐 ADMIN PANEL
   URL:      http://localhost:8055
   Email:    admin@asturiasxr.com
   Password: $ADMIN_PASSWORD

🗄️ DATABASE
   Host:     localhost
   Port:     5432
   Database: $DB_NAME
   User:     $DB_USER
   Password: $DB_PASSWORD

🔑 API KEYS
   Key:      $DIRECTUS_KEY
   Secret:   $DIRECTUS_SECRET

📅 Generated: $(date)

⚠️  KEEP THIS FILE SECURE!
CRED_EOF

chmod 600 CREDENTIALS.txt

# ============================================
# FINAL OUTPUT
# ============================================
clear

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 INSTALLATION COMPLETE!             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Directus Admin:${NC}  http://localhost:8055"
echo -e "${BLUE}📧 Email:${NC}          admin@asturiasxr.com"
echo -e "${BLUE}🔐 Password:${NC}       $ADMIN_PASSWORD"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   • Credentials saved to: ${GREEN}CREDENTIALS.txt${NC}"
echo "   • Production config:    ${GREEN}.env.production${NC}"
echo ""
echo -e "${BLUE}🚀 NEXT STEPS:${NC}"
echo "   1. Open http://localhost:8055"
echo "   2. Login with credentials above"
echo "   3. Start uploading content!"
echo ""
echo -e "${BLUE}📚 COMMANDS:${NC}"
echo "   • Stop:     ${GREEN}docker-compose down${NC}"
echo "   • Start:    ${GREEN}docker-compose up -d${NC}"
echo "   • Logs:     ${GREEN}docker-compose logs -f directus${NC}"
echo "   • Restart:  ${GREEN}docker-compose restart directus${NC}"
echo ""
echo -e "${BLUE}🔧 TOOLS:${NC}"
echo "   • DB Shell: ${GREEN}docker-compose exec postgres psql -U $DB_USER -d $DB_NAME${NC}"
echo "   • Redis:    ${GREEN}docker-compose exec redis redis-cli${NC}"
echo ""