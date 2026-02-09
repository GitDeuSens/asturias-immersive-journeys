# Directus Database Setup Guide

## 🎯 Overview
This guide explains how to create and maintain a beautiful, informative Directus database using automated scripts. Based on the Asturias XR project experience.

## 📋 Prerequisites
- Node.js installed
- Directus instance running
- Admin credentials
- Environment variables configured

## 🔧 Core Script Patterns

### 1. **Authentication Pattern**
```javascript
const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';

async function getToken() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json();
  return json.data.access_token;
}

async function api(method, path, body) {
  const token = await getToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return await fetch(`${DIRECTUS_URL}${path}`, opts);
}
```

### 2. **Error Handling Pattern**
```javascript
function msg(error) {
  return error?.errors?.[0]?.message || error?.message || JSON.stringify(error);
}

async function safeOperation(operation, label) {
  try {
    await operation();
    console.log(`✅ ${label}`);
  } catch (e) {
    const errorMsg = msg(e);
    if (errorMsg.includes('already') || errorMsg.includes('exists')) {
      console.log(`⚠️ ${label} (already exists)`);
    } else {
      console.error(`❌ ${label}: ${errorMsg}`);
    }
  }
}
```

## 🏗️ Database Structure Setup

### 1. **Collections Creation**
```javascript
// Create main collections
const collections = [
  {
    collection: 'routes',
    meta: {
      note: 'Tourist immersive routes',
      icon: 'route',
      display_template: '{{route_code}} - {{title.es}}',
    }
  },
  {
    collection: 'pois',
    meta: {
      note: 'Points of interest',
      icon: 'place',
      display_template: '{{title.es}}',
    }
  }
];

for (const collection of collections) {
  await safeOperation(
    () => directus.request(createCollection(collection)),
    `Create collection: ${collection.collection}`
  );
}
```

### 2. **Fields Configuration**
```javascript
// Add fields with proper types and validation
const fields = [
  {
    collection: 'routes',
    field: 'title',
    type: 'json',
    meta: {
      interface: 'input-code',
      options: {
        language: 'json',
        template: `{
  "es": "",
  "en": "",
  "fr": ""
}`
      },
      required: true
    }
  },
  {
    collection: 'routes',
    field: 'polyline',
    type: 'json',
    meta: {
      interface: 'input-code',
      options: { language: 'json' },
      note: 'Array of {lat, lng} coordinates'
    }
  }
];

for (const field of fields) {
  await safeOperation(
    () => directus.request(createField(field.collection, field.field, field)),
    `Create field: ${field.collection}.${field.field}`
  );
}
```

### 3. **Relations Setup**
```javascript
// Many-to-many relations
const relations = [
  {
    collection: 'routes',
    field: 'categories',
    related_collection: 'categories',
    meta: {
      junction_field: 'routes_categories',
      many_collection: 'routes',
      many_field: 'categories',
      one_collection: 'categories',
      one_field: 'routes'
    }
  }
];

for (const relation of relations) {
  await safeOperation(
    () => directus.request(createRelation(relation)),
    `Create relation: ${relation.collection}.${relation.field}`
  );
}
```

## 📊 Data Import Patterns

### 1. **Structured Data Import**
```javascript
// Import routes with proper structure
const routes = [
  {
    route_code: 'AR-1',
    slug: 'ruta-minera',
    title: {
      es: 'Ruta Minera',
      en: 'Mining Route',
      fr: 'Route Minière'
    },
    polyline: [
      { lat: 43.245, lng: -5.78 },
      { lat: 43.257, lng: -5.77 }
    ],
    difficulty: 'easy',
    is_circular: false
  }
];

for (const route of routes) {
  const result = await api('POST', '/items/routes', route);
  if (result.status === 200) {
    console.log(`✅ Created route: ${route.route_code}`);
  }
}
```

### 2. **File Upload Pattern**
```javascript
import { readFileSync } from 'fs';
import { basename } from 'path';

async function uploadFile(filePath, collection, field) {
  const fileBuffer = readFileSync(filePath);
  const fileName = basename(filePath);
  
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), fileName);
  
  const upload = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getToken()}` },
    body: formData
  });
  
  const uploadResult = await upload.json();
  return uploadResult.data.id;
}

// Usage
const coverImageId = await uploadFile('./assets/route-cover.jpg', 'routes', 'cover_image');
```

## 🎨 Best Practices

### 1. **Consistent Naming**
- Use snake_case for field names
- Use descriptive collection names
- Include display templates for better UX

### 2. **Data Validation**
```javascript
// Validate coordinates
function validatePolyline(polyline) {
  if (!Array.isArray(polyline)) return false;
  return polyline.every(point => 
    typeof point.lat === 'number' && 
    typeof point.lng === 'number' &&
    point.lat >= -90 && point.lat <= 90 &&
    point.lng >= -180 && point.lng <= 180
  );
}
```

### 3. **Batch Operations**
```javascript
// Process in batches to avoid timeouts
async function batchImport(items, batchSize = 10) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)}`);
    
    for (const item of batch) {
      await safeOperation(
        () => api('POST', `/items/${item.collection}`, item.data),
        `Import ${item.collection}: ${item.data.name || item.data.id}`
      );
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

### 4. **Progress Tracking**
```javascript
function showProgress(current, total, label) {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  process.stdout.write(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);
  
  if (current === total) {
    console.log(); // New line when complete
  }
}
```

## 🛠️ Maintenance Scripts

### 1. **Data Validation Script**
```javascript
async function validateDatabase() {
  console.log('🔍 Validating database integrity...');
  
  // Check for orphaned records
  const orphanedRelations = await findOrphanedRelations();
  if (orphanedRelations.length > 0) {
    console.log(`⚠️ Found ${orphanedRelations.length} orphaned records`);
  }
  
  // Validate coordinate data
  const invalidPolylines = await findInvalidPolylines();
  if (invalidPolylines.length > 0) {
    console.log(`⚠️ Found ${invalidPolylines.length} invalid polylines`);
  }
  
  console.log('✅ Database validation complete');
}
```

### 2. **Backup Script**
```javascript
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}`;
  
  // Export data
  const collections = ['routes', 'pois', 'categories'];
  for (const collection of collections) {
    const data = await api('GET', `/items/${collection}?limit=-1`);
    await fs.writeFile(
      `./backups/${backupName}-${collection}.json`,
      JSON.stringify(data.data, null, 2)
    );
  }
  
  console.log(`✅ Backup created: ${backupName}`);
}
```

## 📈 Analytics Setup

### 1. **Create Analytics Fields**
```javascript
const analyticsFields = [
  { collection: 'routes', field: 'view_count', type: 'integer' },
  { collection: 'routes', field: 'completion_count', type: 'integer' },
  { collection: 'pois', field: 'visit_count', type: 'integer' }
];

for (const field of analyticsFields) {
  await safeOperation(
    () => directus.request(createField(field.collection, field.field, {
      type: field.type,
      meta: { interface: 'input', readonly: true }
    })),
    `Add analytics field: ${field.collection}.${field.field}`
  );
}
```

### 2. **Create Dashboards**
```javascript
const dashboards = [
  {
    name: 'Route Analytics',
    icon: 'route',
    panels: [
      {
        type: 'metric',
        name: 'Total Routes',
        options: {
          collection: 'routes',
          field: 'id',
          function: 'count'
        }
      },
      {
        type: 'bar-chart',
        name: 'Routes by Difficulty',
        options: {
          collection: 'routes',
          xAxis: 'difficulty',
          yAxis: 'id',
          function: 'count'
        }
      }
    ]
  }
];

for (const dashboard of dashboards) {
  // Create dashboard
  const dashboardResult = await api('POST', '/dashboards', {
    name: dashboard.name,
    icon: dashboard.icon
  });
  
  // Add panels
  for (const panel of dashboard.panels) {
    await api('POST', '/panels', {
      dashboard: dashboardResult.data.data.id,
      name: panel.name,
      type: panel.type,
      options: panel.options,
      position_x: 0,
      position_y: 0,
      width: 6,
      height: 4
    });
  }
}
```

## 🎯 Key Takeaways

1. **Structure First**: Plan your data model before implementation
2. **Validate Early**: Add validation rules and constraints
3. **Batch Operations**: Process data in manageable chunks
4. **Error Handling**: Graceful error handling prevents data corruption
5. **Progress Tracking**: Provide clear feedback during long operations
6. **Backup Regularly**: Always backup before major changes
7. **Test Thoroughly**: Validate data integrity after operations

## 🚀 Quick Start Template

```javascript
#!/usr/bin/env node
import { createDirectus, rest, authentication } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const directus = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

async function main() {
  console.log('🚀 Starting database setup...');
  
  // Login
  await directus.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('✅ Logged in');
  
  // Your setup logic here
  
  console.log('🎉 Database setup complete!');
}

main().catch(console.error);
```

This pattern ensures clean, maintainable, and robust database operations for your Directus projects.
