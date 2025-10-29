# 📝 Система заметок с Markdown

Полнофункциональная система заметок с поддержкой Markdown, тегов, поиска и подсветки синтаксиса кода.

## 📁 Структура директории

```
Notes/
├── index.html              # Главная страница (редирект или standalone)
├── notes-system.js         # JavaScript логика заметок
├── notes-system.css        # Стили системы заметок
├── api.php                 # API для сохранения/загрузки
├── check-notes.php         # Диагностика системы
├── view-notes.php          # Просмотр заметок в JSON
├── example-notes.json      # Примеры заметок для начала
├── data/                   # Директория для хранения данных
│   └── notes.json          # Файл с заметками (создается автоматически)
└── README.md               # Этот файл
```

## 🚀 Быстрый старт

### 1. Установка

Скопируйте все файлы из этой директории на ваш сервер.

```bash
# Убедитесь что директория data/ существует и доступна для записи
mkdir -p data
chmod 777 data
```

### 2. Проверка системы

Откройте в браузере:
```
http://ваш-сайт.com/Notes/check-notes.php
```

Скрипт проверит:
- ✅ Существует ли папка `data/`
- ✅ Есть ли права на запись
- ✅ Работает ли API

### 3. Начало работы

#### Вариант A: Standalone (отдельное приложение)

Откройте `index.html` в браузере:
```
http://ваш-сайт.com/Notes/index.html
```

#### Вариант B: Интеграция в существующее приложение

Добавьте в ваш HTML:

```html
<!-- В <head> -->
<link rel="stylesheet" href="Notes/notes-system.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- В <body> где нужна система заметок -->
<div id="noteTab">
    <!-- Содержимое из index.html -->
</div>

<!-- Перед </body> -->
<script src="Notes/notes-system.js"></script>
```

## ✨ Возможности

### 📝 Markdown поддержка
- **Жирный**, *курсив*, `код`
- Заголовки (H1-H6)
- Списки (упорядоченные и неупорядоченные)
- Цитаты
- Ссылки
- Изображения
- Таблицы

### 🎨 Подсветка синтаксиса кода
Поддерживается 190+ языков программирования:
````markdown
```javascript
function hello() {
  console.log('Hello World!');
}
```
````

### 🏷️ Теги
- Организация заметок по категориям
- Множественные теги на заметку
- Поиск по тегам

### 🔍 Поиск
- Поиск по названию
- Поиск по содержимому
- Поиск по тегам

### 💾 Автосохранение
- Заметки сохраняются автоматически через 1 секунду после изменения
- Как в Google Docs!

### 📱 Responsive дизайн
- Работает на десктопе и мобильных устройствах
- Адаптивная верстка

## 📋 API Endpoints

### Загрузка заметок
```
GET api.php?action=loadNotes
```

**Ответ:**
```json
{
  "success": true,
  "notes": [...],
  "count": 5
}
```

### Сохранение заметок
```
POST api.php?action=saveNotes
Content-Type: application/json

{
  "notes": [...]
}
```

**Ответ:**
```json
{
  "success": true,
  "saved": 5,
  "bytes": 1234
}
```

## 📦 Формат данных

Заметки хранятся в `data/notes.json`:

```json
[
  {
    "id": 1729596234567,
    "title": "Заголовок заметки",
    "content": "Содержимое с **Markdown**",
    "tags": ["тег1", "тег2"],
    "createdAt": "2025-01-23T10:00:00.000Z",
    "updatedAt": "2025-01-23T10:15:00.000Z"
  }
]
```

### Поля заметки:
- `id` - уникальный идентификатор (timestamp)
- `title` - название заметки
- `content` - содержимое в формате Markdown
- `tags` - массив тегов
- `createdAt` - дата создания (ISO 8601)
- `updatedAt` - дата последнего изменения (ISO 8601)

## 🔧 Настройка

### Изменение темы подсветки кода

В `index.html` замените:
```html
<!-- github-dark (по умолчанию) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">

<!-- Другие темы: -->
<!-- monokai -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai.min.css">

<!-- atom-one-dark -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
```

[Все темы →](https://highlightjs.org/demo)

### Изменение пути к данным

В `api.php` измените:
```php
$notesFile = 'data/notes.json'; // По умолчанию
$notesFile = '/path/to/your/notes.json'; // Кастомный путь
```

## 🛠️ Утилиты

### check-notes.php
Диагностика системы:
- Проверка папки `data/`
- Проверка прав доступа
- Проверка JSON файла
- Тест API

### view-notes.php
Просмотр заметок:
- Визуализация всех заметок
- Скачать JSON резервную копию
- Экспорт в TXT формат
- Статистика

### example-notes.json
Примеры заметок для начала работы:
```bash
cp example-notes.json data/notes.json
chmod 666 data/notes.json
```

## 🔒 Безопасность

### Закрыть доступ к data/

Создайте `data/.htaccess`:
```apache
Order deny,allow
Deny from all
```

### Валидация данных

API автоматически валидирует:
- Наличие обязательных полей
- Корректность JSON
- Права на запись

## 🐛 Устранение неполадок

### Заметки не сохраняются

1. Запустите `check-notes.php`
2. Проверьте права: `chmod 777 data/`
3. Проверьте консоль браузера (F12)

### Заметки исчезают после перезагрузки

1. Откройте консоль (F12)
2. Проверьте логи `saveNotes`
3. Убедитесь что `data/notes.json` создается

### Подсветка кода не работает

1. Проверьте что Highlight.js загружен
2. Используйте правильный синтаксис:
````markdown
```язык
код
```
````

## 📊 Системные требования

- **PHP:** 7.0 или выше
- **Веб-сервер:** Apache/Nginx
- **Браузер:** Chrome, Firefox, Safari, Edge (современные версии)
- **JavaScript:** Должен быть включен
- **Права на запись:** Директория `data/` должна быть доступна для записи

## 📞 Поддержка

### Полезные ссылки:
- `check-notes.php` - диагностика
- `view-notes.php` - просмотр заметок
- `data/notes.json` - файл с данными

### Логи для отладки:

Откройте консоль (F12) и проверьте:
```javascript
// При создании заметки
saveNotes: начало сохранения...
saveNotes: ✅ успешно сохранено

// При загрузке страницы
loadNotes: загружено заметок: 5
```

## 🎉 Обновления

### Версия 7.0 (текущая)
- ✅ Standalone директория Notes/
- ✅ Подсветка синтаксиса кода (190+ языков)
- ✅ Автосохранение
- ✅ Улучшенное логирование
- ✅ Просмотрщик JSON (view-notes.php)
- ✅ Диагностика (check-notes.php)
- ✅ Примеры заметок

## 📝 Лицензия

MIT License - Свободно используйте в своих проектах!

---

**Создано с ❤️ для удобной работы с заметками**

*Версия: 7.0*  
*Дата: 22 октября 2025*
