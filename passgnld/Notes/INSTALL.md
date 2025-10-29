# 📦 Установка системы заметок Notes

## 🚀 Быстрая установка (3 шага)

### 1. Загрузите директорию Notes на сервер

Скопируйте всю папку `Notes/` в ваш веб-корень:
```
/home/web/vm-1d0be1a6.na4u.ru/www/local/tools/passgnld/Notes/
```

### 2. Установите права доступа

```bash
cd /home/web/vm-1d0be1a6.na4u.ru/www/local/tools/passgnld/Notes/
chmod 777 data/
```

### 3. Откройте в браузере

```
http://ваш-сайт.com/local/tools/passgnld/Notes/
```

Или прямая ссылка:
```
http://ваш-сайт.com/local/tools/passgnld/Notes/index.html
```

---

## ✅ Проверка установки

### Откройте диагностику:
```
http://ваш-сайт.com/local/tools/passgnld/Notes/check-notes.php
```

**Скрипт проверит:**
- ✅ Папка `data/` существует
- ✅ Права на запись (777)
- ✅ API работает

---

## 📝 Начало работы

### Вариант A: Пустая система

Просто откройте `index.html` и создайте первую заметку!

### Вариант B: С примерами

```bash
cd Notes/
cp example-notes.json data/notes.json
chmod 666 data/notes.json
```

Теперь при открытии увидите 2 примера заметок с инструкциями!

---

## 🔍 Полезные ссылки

После установки доступны:

- **Основное приложение:** `index.html`
- **Просмотр JSON:** `view-notes.php`
- **Диагностика:** `check-notes.php`
- **Полная документация:** `README.md`

---

## 🐛 Проблемы?

### Заметки не сохраняются

```bash
chmod 777 data/
```

### Ошибка API

Откройте:
```
http://ваш-сайт.com/local/tools/passgnld/Notes/api.php?action=loadNotes
```

Должен вернуть:
```json
{"success":true,"notes":[]}
```

### Подробная диагностика

```
http://ваш-сайт.com/local/tools/passgnld/Notes/check-notes.php
```

---

## 📂 Структура после установки

```
Notes/
├── index.html ← Откройте это
├── notes-system.js
├── notes-system.css
├── api.php
├── check-notes.php ← Для диагностики
├── view-notes.php ← Для просмотра JSON
├── example-notes.json ← Примеры
├── README.md ← Полная документация
└── data/
    ├── .htaccess ← Защита
    └── notes.json ← Создается автоматически
```

---

**Готово! Начните создавать заметки! 📝✨**

*Если нужна помощь - откройте README.md*
