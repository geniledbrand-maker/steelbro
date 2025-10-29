# 🔧 Keys.so API - Руководство по интеграции

## 📋 Обзор

Данное руководство описывает правильную интеграцию с Keys.so API через прокси-сервер для анализа доменов и получения SEO-данных.

## 🏗️ Архитектура системы

```
Frontend (JavaScript) → Proxy (PHP) → Keys.so API
     ↓                    ↓              ↓
  api.js            keys_proxy.php    https://api.keys.so
```

## 📁 Структура файлов

```
Spy/
├── keys_proxy.php              # Прокси-сервер для API
├── config/
│   └── keys.env               # Файл с токеном API
├── assets/js/
│   └── api.js                 # JavaScript API клиент
└── spy.html                   # Основное приложение
```

## 🔑 Настройка токена API

### 1. Получение токена
1. Зарегистрируйтесь на [keys.so](https://keys.so)
2. Получите API токен в личном кабинете
3. Скопируйте токен

### 2. Настройка токена
Создайте файл `config/keys.env`:
```env
KEYSO_TOKEN=ваш_токен_здесь
```

**Пример:**
```env
KEYSO_TOKEN=68f901d59104e7.54090033d9642a220c8fc82cc162e7d83cc8b57a
```

## 🔧 Настройка прокси-сервера

### Файл: `keys_proxy.php`

Прокси-сервер обрабатывает запросы и перенаправляет их к Keys.so API:

```php
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Получаем данные запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Загружаем токен
$token = getenv('KEYSO_TOKEN');
if (!$token) {
    $envPath = __DIR__ . '/config/keys.env';
    if (file_exists($envPath)) {
        $env = parse_ini_file($envPath, false, INI_SCANNER_RAW);
        if (isset($env['KEYSO_TOKEN'])) {
            $token = trim($env['KEYSO_TOKEN']);
        }
    }
}

// Обработка различных действий
switch ($data['action'] ?? '') {
    case 'get_domain_dashboard':
        // Обработка запроса дашборда
        break;
    // ... другие действия
}
?>
```

## 📱 JavaScript API клиент

### Файл: `assets/js/api.js`

**⚠️ ВАЖНО:** API теперь использует **GET запросы** вместо POST!

```javascript
class KeysAPI {
    constructor(proxyUrl = 'keys_proxy.php') {
        this.proxyUrl = proxyUrl;
        this.isChecking = false;
        this.isAvailable = false;
    }

    // Проверка статуса API
    async checkAPIStatus() {
        if (this.isChecking) return this.isAvailable;
        this.isChecking = true;
        
        try {
            await this.makeGet('/report/simple/domain_dashboard', {
                domain: 'yandex.ru',
                base: 'msk'
            });
            this.isAvailable = true;
        } catch (error) {
            this.isAvailable = false;
        } finally {
            this.isChecking = false;
        }
        
        return this.isAvailable;
    }

    // Основной метод для GET запросов
    async makeGet(endpoint, params = {}) {
        try {
            const usp = new URLSearchParams({ endpoint, ...params });
            const url = `${this.proxyUrl}?${usp.toString()}`;

            console.log('Отправляем GET запрос через прокси:', {
                url: this.proxyUrl,
                endpoint: endpoint,
                params: params,
                fullUrl: url
            });

            const response = await fetch(url, {
                method: 'GET'
            });

            console.log('Ответ сервера:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Текст ошибки:', errorText);
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка API запроса:', error);
            throw error;
        }
    }

    // Очистка домена от протокола и слэшей
    cleanDomain(domain) {
        return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    async getDomainDashboard(domain, region = 'msk') {
        const cleanDomain = this.cleanDomain(domain);
        return await this.makeGet('/report/simple/domain_dashboard', {
            domain: cleanDomain,
            base: region
        });
    }

    async getOrganicKeywords(domain, region = 'msk', perPage = 100) {
        const cleanDomain = this.cleanDomain(domain);
        return await this.makeGet('/report/simple/organic/keywords', {
            domain: cleanDomain,
            base: region,
            per_page: perPage
        });
    }

    async getSitePages(domain, region = 'msk', perPage = 100) {
        const cleanDomain = this.cleanDomain(domain);
        return await this.makeGet('/report/simple/organic/sitepages', {
            domain: cleanDomain,
            base: region,
            per_page: perPage
        });
    }

    async getContextAds(domain, region = 'msk', perPage = 50) {
        const cleanDomain = this.cleanDomain(domain);
        return await this.makeGet('/report/simple/context/ads', {
            domain: cleanDomain,
            base: region,
            per_page: perPage
        });
    }

    async getCompetitors(domain, region = 'msk', perPage = 50) {
        const cleanDomain = this.cleanDomain(domain);
        return await this.makeGet('/report/simple/organic/concurents', {
            domain: cleanDomain,
            base: region,
            per_page: perPage
        });
    }

    // Получение всех данных домена
    async getAllDomainData(domain, region = 'msk') {
        const cleanDomain = this.cleanDomain(domain);
        
        try {
            const [dashboard, keywords, pages, ads, competitors] = await Promise.all([
                this.getDomainDashboard(cleanDomain, region),
                this.getOrganicKeywords(cleanDomain, region),
                this.getSitePages(cleanDomain, region),
                this.getContextAds(cleanDomain, region),
                this.getCompetitors(cleanDomain, region)
            ]);

            return {
                dashboard,
                keywords,
                pages,
                ads,
                competitors,
                domain: cleanDomain,
                region
            };
        } catch (error) {
            console.error('Ошибка получения данных домена:', error);
            throw error;
        }
    }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeysAPI;
}
```

## 🌐 Доступные API методы

### 1. Получение дашборда домена
```javascript
const api = new KeysAPI();
const data = await api.getDomainDashboard('example.com', 'msk');
```

**Параметры:**
- `domain` - домен для анализа
- `region` - регион (msk, spb, ekat, nsk, kzn)

**Ответ:**
```json
{
  "it10": 15,
  "it50": 45,
  "vis": 25000,
  "adscnt": 8,
  "adkeyscnt": 25,
  "adcost": 150000,
  "keys": [...]
}
```

### 2. Получение органических ключевых слов
```javascript
const keywords = await api.getOrganicKeywords('example.com', 'msk', 100);
```

**Параметры:**
- `domain` - домен для анализа
- `region` - регион
- `per_page` - количество результатов (по умолчанию 100)

### 3. Получение страниц сайта
```javascript
const pages = await api.getSitePages('example.com', 'msk', 100);
```

### 4. Получение контекстной рекламы
```javascript
const ads = await api.getContextAds('example.com', 'msk', 50);
```

### 5. Получение конкурентов
```javascript
const competitors = await api.getCompetitors('example.com', 'msk', 50);
```

## 🔧 Интеграция в приложение

### ⚠️ КРИТИЧЕСКИ ВАЖНО: Проверка файлов

**Перед использованием API обязательно проверьте эти файлы:**

#### 1. Файл `assets/js/app.js` - ОБЯЗАТЕЛЬНО ПРОВЕРИТЬ!

```javascript
// Строка 60 - ПРАВИЛЬНЫЙ путь к прокси:
this.api = new KeysAPI('keys_proxy.php');

// ❌ НЕПРАВИЛЬНО (вызовет ошибку 404):
this.api = new KeysAPI('/Spy/config/keys_proxy.php');
this.api = new KeysAPI('config/keys_proxy.php');
```

**Что проверить в `app.js`:**
- ✅ Путь к прокси: `'keys_proxy.php'` (без слэшей и папок)
- ✅ Используется класс `KeysAPI` из `api.js`
- ✅ Нет дублирования API кода

#### 2. Файл `spy.html` - ОБЯЗАТЕЛЬНО ПРОВЕРИТЬ!

```html
<!-- ПРАВИЛЬНОЕ подключение API с версией для обновления кэша: -->
<script src="assets/js/api.js?v=2.0"></script>

<!-- ❌ НЕПРАВИЛЬНО (может использовать старый кэш): -->
<script src="assets/js/api.js"></script>
```

**Что проверить в `spy.html`:**
- ✅ Подключен `api.js` с версией `?v=2.0`
- ✅ Подключен `app.js` после `api.js`
- ✅ Нет встроенного API кода (должен быть только в `api.js`)

### 2. Подключение API клиента
```html
<!DOCTYPE html>
<html>
<head>
    <title>Keys.so Spy</title>
</head>
<body>
    <!-- Ваш HTML код -->
    
    <script src="assets/js/api.js"></script>
    <script>
        // Инициализация API
        const api = new KeysAPI();
        
        // Использование API
        async function analyzeDomain(domain) {
            try {
                const data = await api.getDomainDashboard(domain);
                console.log('Данные получены:', data);
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }
    </script>
</body>
</html>
```

### 2. Обработка ошибок
```javascript
async function safeApiCall(apiMethod, ...args) {
    try {
        const result = await apiMethod.apply(api, args);
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        return { 
            success: false, 
            error: error.message,
            details: error
        };
    }
}

// Использование
const result = await safeApiCall(api.getDomainDashboard, 'example.com');
if (result.success) {
    console.log('Данные:', result.data);
} else {
    console.error('Ошибка:', result.error);
}
```

## 🚨 Обработка ошибок

### Типичные ошибки и их решения

#### 1. "Endpoint is required" (400)
**Причина:** API использует старый POST метод вместо GET
**Решение:** 
- Проверьте `app.js` - должен использовать `KeysAPI` из `api.js`
- Обновите кэш браузера (Ctrl+F5)
- Убедитесь, что в `spy.html` подключен `api.js?v=2.0`

#### 2. "HTTP Error: 404" 
**Причина:** Неправильный путь к прокси в `app.js`
**Решение:** 
```javascript
// В app.js строка 60 должна быть:
this.api = new KeysAPI('keys_proxy.php');
// НЕ: this.api = new KeysAPI('/Spy/config/keys_proxy.php');
```

#### 3. "HTTP Error: 301"
**Причина:** Лишний слэш в endpoint
**Решение:** Убедитесь, что endpoint `/report/simple/context/ads` без слэша в конце

#### 4. "Нет данных запроса" (400)
**Причина:** Прокси не получает GET параметры
**Решение:** Проверьте, что используется `makeGet` вместо `makePost`

#### 5. "Unauthorized" (401)
**Причина:** Неверный или отсутствующий токен
**Решение:** Проверьте токен в `config/keys.env`

#### 6. "Too Many Requests" (429)
**Причина:** Превышен лимит запросов
**Решение:** Добавьте задержки между запросами

#### 7. Кэширование браузера
**Причина:** Браузер использует старую версию API
**Решение:** 
- Жесткая перезагрузка: Ctrl+F5
- Очистка кэша браузера
- Использование версии в `api.js?v=2.0`

### 🚀 Быстрое решение проблем

**Если API не работает, выполните по порядку:**

1. **Проверьте `app.js` строка 60:**
   ```javascript
   this.api = new KeysAPI('keys_proxy.php');
   ```

2. **Проверьте `spy.html` строка 146:**
   ```html
   <script src="assets/js/api.js?v=2.0"></script>
   ```

3. **Обновите кэш браузера:**
   - Нажмите Ctrl+F5
   - Или откройте DevTools → Network → Disable cache

4. **Проверьте консоль браузера:**
   - Должны быть GET запросы, не POST
   - URL должен быть `keys_proxy.php?endpoint=...`

5. **Проверьте токен:**
   ```bash
   # Файл должен существовать и содержать токен
   cat config/keys.env
   ```

## ⚡ Оптимизация производительности

### 1. Кэширование результатов
```javascript
class CachedKeysAPI extends KeysAPI {
    constructor(proxyUrl) {
        super(proxyUrl);
        this.cache = new Map();
    }

    async getDomainDashboard(domain, region = 'msk') {
        const cacheKey = `${domain}_${region}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const result = await super.getDomainDashboard(domain, region);
        this.cache.set(cacheKey, result);
        
        return result;
    }
}
```

### 2. Очередь запросов
```javascript
class QueuedKeysAPI extends KeysAPI {
    constructor(proxyUrl) {
        super(proxyUrl);
        this.queue = [];
        this.processing = false;
    }

    async makePost(action, params = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({ action, params, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        const { action, params, resolve, reject } = this.queue.shift();
        
        try {
            const result = await super.makePost(action, params);
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.processing = false;
            setTimeout(() => this.processQueue(), 1000); // Задержка 1 сек
        }
    }
}
```

## 🧪 Тестирование

### 1. Создание тестового файла
```html
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
</head>
<body>
    <h1>Keys.so API Test</h1>
    <button onclick="testAPI()">Test API</button>
    <div id="results"></div>

    <script src="assets/js/api.js"></script>
    <script>
        async function testAPI() {
            const api = new KeysAPI();
            const results = document.getElementById('results');
            
            try {
                const data = await api.getDomainDashboard('yandex.ru', 'msk');
                results.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            } catch (error) {
                results.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
```

### 2. Проверка статуса API
```javascript
async function checkAPIStatus() {
    const api = new KeysAPI();
    try {
        await api.getDomainDashboard('yandex.ru', 'msk');
        console.log('✅ API работает');
        return true;
    } catch (error) {
        console.log('❌ API не работает:', error.message);
        return false;
    }
}
```

## 📊 Мониторинг и логирование

### 1. Логирование запросов
```javascript
class LoggedKeysAPI extends KeysAPI {
    async makePost(action, params = {}) {
        console.log(`[API] ${action}:`, params);
        const startTime = Date.now();
        
        try {
            const result = await super.makePost(action, params);
            console.log(`[API] ${action} success (${Date.now() - startTime}ms)`);
            return result;
        } catch (error) {
            console.error(`[API] ${action} error:`, error);
            throw error;
        }
    }
}
```

### 2. Метрики производительности
```javascript
class MetricsKeysAPI extends KeysAPI {
    constructor(proxyUrl) {
        super(proxyUrl);
        this.metrics = {
            requests: 0,
            errors: 0,
            totalTime: 0
        };
    }

    async makePost(action, params = {}) {
        this.metrics.requests++;
        const startTime = Date.now();
        
        try {
            const result = await super.makePost(action, params);
            this.metrics.totalTime += Date.now() - startTime;
            return result;
        } catch (error) {
            this.metrics.errors++;
            throw error;
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            averageTime: this.metrics.totalTime / this.metrics.requests,
            errorRate: this.metrics.errors / this.metrics.requests
        };
    }
}
```

## 🔒 Безопасность

### 1. Валидация входных данных
```javascript
function validateDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
}

function validateRegion(region) {
    const validRegions = ['msk', 'spb', 'ekat', 'nsk', 'kzn'];
    return validRegions.includes(region);
}
```

### 2. Ограничение запросов
```javascript
class RateLimitedKeysAPI extends KeysAPI {
    constructor(proxyUrl, maxRequestsPerMinute = 10) {
        super(proxyUrl);
        this.maxRequests = maxRequestsPerMinute;
        this.requests = [];
    }

    async makePost(action, params = {}) {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < 60000);
        
        if (this.requests.length >= this.maxRequests) {
            throw new Error('Rate limit exceeded');
        }
        
        this.requests.push(now);
        return await super.makePost(action, params);
    }
}
```

## 📚 Дополнительные ресурсы

### 1. Документация Keys.so API
- [Официальная документация](https://keys.so/api)
- [Примеры запросов](https://keys.so/api/examples)

### 2. Полезные ссылки
- [Регистрация на Keys.so](https://keys.so/register)
- [Личный кабинет](https://keys.so/dashboard)
- [Поддержка](https://keys.so/support)

### 3. Инструменты разработки
- [Postman коллекция](https://keys.so/api/postman)
- [OpenAPI спецификация](https://keys.so/api/openapi.json)

## 🎯 Заключение

Правильная интеграция с Keys.so API включает:

1. ✅ **Настройку токена** в `config/keys.env`
2. ✅ **Использование прокси** для обхода CORS
3. ✅ **GET запросы** вместо POST (обновлено!)
4. ✅ **Правильные пути** в `app.js` и `spy.html`
5. ✅ **Обновление кэша** браузера
6. ✅ **Обработку ошибок** и валидацию данных
7. ✅ **Очистку доменов** от протоколов и слэшей
8. ✅ **Мониторинг** и логирование
9. ✅ **Тестирование** всех компонентов

### 🔍 Чек-лист перед запуском:

- [ ] Токен настроен в `config/keys.env`
- [ ] В `app.js` правильный путь: `new KeysAPI('keys_proxy.php')`
- [ ] В `spy.html` подключен `api.js?v=2.0`
- [ ] Прокси поддерживает GET запросы
- [ ] API использует `makeGet` вместо `makePost`
- [ ] Домены очищаются от протоколов
- [ ] Endpoints без лишних слэшей
- [ ] Кэш браузера обновлен (Ctrl+F5)

Следуя данному руководству, вы сможете успешно интегрировать Keys.so API в ваше приложение.

---

**Дата создания:** 23.10.2025  
**Дата обновления:** 23.10.2025  
**Версия:** 2.0  
**Статус:** ✅ API работает, все исправления применены
