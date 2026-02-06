# Asturias XR - Directus CMS

Directus CMS для проекта Asturias Immersive Journeys.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Файл `.env` уже настроен. Проверьте учетные данные администратора:

```bash
ADMIN_EMAIL=admin@asturias-xr.com
ADMIN_PASSWORD=your-secure-password
PUBLIC_URL=http://localhost:8055
```

### 3. Запуск Directus

```bash
docker-compose up -d
```

Directus будет доступен по адресу: http://localhost:8055

### 4. Создание схемы базы данных

```bash
npm run init
```

Этот скрипт создаст все необходимые коллекции:
- museums (Музеи)
- virtual_tours (Виртуальные туры 360°)
- ar_scenes (AR-сцены)
- immersive_routes (Маршруты)
- route_points (Точки маршрутов)
- pois (Точки интереса)
- vr_experiences (VR-опыты)
- categories (Категории)
- analytics_events (События аналитики)

### 5. Мигрировать реальные данные

```bash
# Опция A: Мигрировать все данные из mockData.ts (Рекомендовано)
npm run migrate

# Опция B: Заполнить примерными данными для тестирования
npm run seed
```

**Скрипт миграции включает:**
- ✅ 5 categories (Naturaleza, Patrimonio, Aventura, Gastronomía, Cultura)
- ✅ 11 museums (MUMI, MUJA, LABoral, Museo Sidra, etc.)
- ✅ 11 virtual tours con Kuula URLs
- ✅ 3 AR scenes (Covadonga, MUMI, Valduno)
- ✅ Validación de traducciones (ES/EN/FR)
- ✅ Validación de coordenadas (Asturias: ~43.N, -5.W)
- ✅ Validación de URLs (Kuula, Needle Engine)

### 6. Verificar sincronización

```bash
npm run verify
```

Este comando verifica:
- Cantidad de registros en cada colección
- Traducciones completas (ES/EN/FR)
- Coordenadas válidas para Asturias
- URLs correctas (kuula_embed_url, needle_scene_url)
- Campos requeridos (opening_hours, pricing, etc.)
- Status = 'published'

## 📝 Доступные команды

```bash
npm run init     # Создать схему базы данных (9 коллекций)
npm run migrate  # Мигрировать данные из mockData.ts (11 museums, 11 tours, 3 AR scenes)
npm run verify   # Проверить синхронизацию данных с валидацией
npm run seed     # Заполнить примерными данными (альтернатива migrate)
npm run reset    # Сбросить схему (будет создан позже)
```

## 🔑 Вход в админ-панель

1. Откройте http://localhost:8055
2. Войдите с учетными данными из `.env`:
   - Email: `admin@asturias-xr.com`
   - Password: `your-secure-password`

## 📦 Структура коллекций

### Museums (Музеи)
- Мультиязычные названия и описания (ES, EN, FR)
- Координаты и адреса
- Изображения обложек
- Часы работы и цены
- Типы музеев

### Virtual Tours (Виртуальные туры)
- Интеграция с Kuula
- Связь с музеями
- Превью изображения
- Количество панорам

### AR Scenes (AR-сцены)
- Интеграция с Needle Engine
- Типы AR: SLAM, Image Tracking, Geo
- Превью и инструкции
- Сложность и продолжительность

### Immersive Routes (Маршруты)
- ID маршрутов (AR-1, AR-2, и т.д.)
- Расстояние, продолжительность, сложность
- GPX файлы
- Polyline координаты

### Route Points (Точки маршрутов)
- Порядок на маршруте
- Координаты и адреса
- Аудиогиды (ES, EN, FR)
- Связь с AR-сценами

## 🔧 Настройка публичного доступа

Для доступа к данным без аутентификации:

1. Settings → Roles & Permissions
2. Выберите роль "Public"
3. Дайте права на чтение (Read) для всех коллекций

## 📚 Документация

Подробная документация доступна в корне проекта:
- `../../DIRECTUS_INTEGRATION.md` - Полная документация по интеграции

## 🐛 Troubleshooting

### Directus не запускается
```bash
docker-compose down
docker-compose up -d
```

### Ошибка при создании схемы
Убедитесь, что:
1. Directus запущен
2. Учетные данные в `.env` верны
3. База данных доступна

### Сброс базы данных
```bash
docker-compose down -v
docker-compose up -d
npm run init
npm run seed
```

## 🌐 Полезные ссылки

- [Directus Documentation](https://docs.directus.io/)
- [Directus SDK](https://docs.directus.io/guides/sdk/)
- [Docker Compose](https://docs.docker.com/compose/)
