# VelikTur Landing Page

Одностраничный сайт на Node.js + Express + EJS с каталогом велосипедов, фильтрацией и поиском.

## Технологии

- Node.js
- Express
- EJS
- SQLite
- HTML5, CSS3, Vanilla JS

## Структура

- `app.js` - точка входа сервера
- `routes/` - маршруты (`/`, `/api/products`, `/contact`)
- `controllers/` - обработчики роутов
- `services/` - бизнес-логика работы с товарами
- `db/` - схема, инициализация и файл SQLite-базы
- `views/` - EJS-шаблоны
- `public/css`, `public/js`, `public/images` - статика

## Быстрый старт

```bash
npm install
npm run db:init
npm run dev
```

Сайт: `http://localhost:3000`

## Проверка

```bash
npm test
```

Smoke test поднимает сервер и проверяет:
- `GET /`
- `GET /api/products`

