# File: docs/COMPETITORS_ANALYSIS.md
# Created: 2025-01-22
# Modified: 2025-01-22

# Анализ конкурентов - Документация

## Обзор

Система анализа конкурентов SteelBro оптимизирована для работы с keys.so API и предоставляет мощные инструменты для:

- **Анализа конкурентов** по ключевым словам
- **Регионального анализа** конкуренции
- **Анализа ключевых слов** и их группировки
- **Экспорта данных** в различных форматах

## Быстрый доступ

### Горячие клавиши

- `Ctrl+Shift+S` - Аналитика (spy.html)
- `Ctrl+Shift+C` - Анализ конкурентов
- `Ctrl+Shift+K` - Анализ ключевых слов  
- `Ctrl+Shift+R` - Региональный анализ

## Компоненты системы

### 1. API для конкурентов (`src/api/competitors.js`)

Основной класс для работы с keys.so API:

```javascript
const competitorsAPI = new CompetitorsAPI();

// Анализ конкурентов по ключевым словам
const result = await competitorsAPI.analyzeDomainCompetitors(
    'steelbro.ru', 
    ['металлоконструкции', 'металлопрокат'], 
    'ekb'
);
```

**Основные методы:**

- `getCompetitorsByKeywords(keywords, region, page, perPage)` - Получение конкурентов
- `getCompetitorPages(keywords, region, page, perPage)` - Получение страниц конкурентов
- `analyzeDomainCompetitors(domain, keywords, region)` - Полный анализ домена
- `exportToCSV(data)` - Экспорт в CSV

### 2. Анализ ключевых слов (`src/utils/keywords.js`)

Утилита для анализа и обработки ключевых слов:

```javascript
const keywordsAnalyzer = new KeywordsAnalyzer();

// Очистка и нормализация
const cleaned = keywordsAnalyzer.cleanKeywords(keywords);

// Группировка по категориям
const groups = keywordsAnalyzer.groupKeywords(cleaned);

// Анализ частотности
const frequency = keywordsAnalyzer.analyzeFrequency(cleaned);
```

**Основные методы:**

- `cleanKeywords(keywords)` - Очистка и нормализация
- `groupKeywords(keywords)` - Группировка по категориям
- `analyzeFrequency(keywords)` - Анализ частотности
- `validateKeywords(keywords)` - Валидация ключевых слов
- `createSemanticGroups(keywords)` - Семантические группы

### 3. Региональный анализ (`src/utils/regions.js`)

Система для работы с региональными базами:

```javascript
const regionsAnalyzer = new RegionsAnalyzer();

// Получение информации о регионе
const regionInfo = regionsAnalyzer.getRegionInfo('ekb');

// Анализ по регионам
const results = await regionsAnalyzer.analyzeCompetitorsByRegions(
    'steelbro.ru',
    ['металлоконструкции'],
    ['msk', 'spb', 'ekb']
);
```

**Поддерживаемые регионы:**

- **Яндекс:** Москва, СПб, Екатеринбург, Новосибирск, Казань и др.
- **Google:** Москва, Киев, Минск, New York
- **Дзен:** Общероссийский охват

## Страницы интерфейса

### 1. Анализ конкурентов (`src/pages/competitors.html`)

**Функции:**
- Ввод домена и ключевых слов
- Выбор региона
- Анализ конкурентов через keys.so API
- Отображение метрик (трафик, позиции, общие ключевые слова)
- Анализ угроз и возможностей
- Экспорт в CSV

**Использование:**
1. Введите домен для анализа
2. Выберите регион (по умолчанию Екатеринбург)
3. Введите ключевые слова (по одному на строку)
4. Нажмите "Анализировать конкурентов"

### 2. Анализ ключевых слов (`src/pages/keywords.html`)

**Функции:**
- Ввод и анализ ключевых слов
- Группировка по категориям (продукты, услуги, материалы)
- Анализ частотности
- Валидация ключевых слов
- Семантические группы
- Экспорт в различных форматах

**Типы анализа:**
- **Полный анализ** - все функции
- **Группировка** - только группировка по категориям
- **Частотность** - анализ частоты использования
- **Валидация** - проверка корректности

### 3. Региональный анализ (`src/pages/regions.html`)

**Функции:**
- Выбор регионов для анализа
- Сравнение конкуренции по регионам
- Рекомендации по приоритетным регионам
- Статистика по регионам
- Экспорт результатов

**Использование:**
1. Введите домен и ключевые слова
2. Выберите регионы для анализа
3. Нажмите "Анализировать регионы"

## API Endpoints

### Keys.so API

Система использует следующие эндпоинты keys.so:

#### 1. Конкуренты по доменам
```
POST /tools/check-top-concurents-domains?base={region}
```

**Параметры:**
- `list` - массив ключевых слов
- `page` - номер страницы
- `perPage` - записей на странице

#### 2. Конкуренты по страницам
```
POST /tools/check-top-concurents-urls?base={region}
```

**Параметры:**
- `list` - массив ключевых слов
- `page` - номер страницы
- `perPage` - записей на странице

### Прокси API (`keys_proxy.php`)

Прокси для работы с keys.so API:

```
GET keys_proxy.php?endpoint=/path&other_params
```

**Функции:**
- Авторизация через X-Keyso-TOKEN
- Rate limiting (10 запросов в 10 секунд)
- Обработка ошибок
- CORS поддержка

## Структура данных

### Результат анализа конкурентов

```javascript
{
    success: true,
    domain: "steelbro.ru",
    region: "Яндекс: Екатеринбург",
    keywords: ["металлоконструкции", "металлопрокат"],
    competitors: {
        total: 150,
        data: [
            {
                domain: "competitor.ru",
                traffic: 1000,
                keywords: 50,
                top1: 5,
                top3: 10,
                top10: 25,
                common_keywords: 15
            }
        ]
    },
    analysis: {
        totalCompetitors: 150,
        topCompetitors: [...],
        threats: [...],
        opportunities: [...]
    }
}
```

### Результат анализа ключевых слов

```javascript
{
    original: ["металлоконструкции", "металлопрокат"],
    cleaned: ["металлоконструкции", "металлопрокат"],
    groups: {
        products: ["металлоконструкции"],
        services: ["изготовление"],
        materials: ["металл"]
    },
    frequency: {
        total: 2,
        unique: 2,
        top10: [...]
    },
    validation: {
        valid: true,
        errors: [],
        warnings: []
    }
}
```

## Экспорт данных

### Поддерживаемые форматы

1. **CSV** - для таблиц и анализа в Excel
2. **JSON** - для программной обработки
3. **TXT** - для простого текстового экспорта

### Пример экспорта

```javascript
// CSV экспорт конкурентов
const csvContent = competitorsAPI.exportToCSV(analysisData);

// Экспорт ключевых слов
const keywordsTxt = keywordsAnalyzer.exportKeywords(keywords, 'txt');
const keywordsCsv = keywordsAnalyzer.exportKeywords(keywords, 'csv');
```

## Настройка и развертывание

### Требования

- PHP 7.4+
- Веб-сервер (Apache/Nginx)
- Доступ к keys.so API
- Токен авторизации keys.so

### Установка

1. Скопируйте файлы в корень проекта
2. Настройте токен в `keys_proxy.php`
3. Убедитесь в доступности keys.so API
4. Откройте `index.html` в браузере

### Конфигурация

#### Токен keys.so

В файле `keys_proxy.php`:

```php
$token = 'your-keys-so-token-here';
```

#### Региональные настройки

В файле `src/utils/regions.js` можно добавить новые регионы:

```javascript
'new_region': {
    name: 'Новый регион',
    type: 'yandex',
    country: 'ru',
    city: 'Город',
    population: 1000000,
    priority: 26
}
```

## Примеры использования

### 1. Анализ конкурентов для металлоконструкций

```javascript
const keywords = [
    'металлоконструкции',
    'металлопрокат',
    'балки стальные',
    'трубы профильные',
    'изготовление металлоконструкций'
];

const result = await competitorsAPI.analyzeDomainCompetitors(
    'steelbro.ru',
    keywords,
    'ekb'
);
```

### 2. Региональный анализ

```javascript
const regions = ['msk', 'spb', 'ekb', 'nsk', 'kzn'];
const results = await regionsAnalyzer.analyzeCompetitorsByRegions(
    'steelbro.ru',
    keywords,
    regions
);
```

### 3. Анализ ключевых слов

```javascript
const keywords = ['металлоконструкции', 'металлопрокат'];
const cleaned = keywordsAnalyzer.cleanKeywords(keywords);
const groups = keywordsAnalyzer.groupKeywords(cleaned);
const frequency = keywordsAnalyzer.analyzeFrequency(cleaned);
```

## Troubleshooting

### Частые проблемы

1. **Ошибка 401/403** - проверьте токен keys.so
2. **Ошибка 429** - превышен лимит запросов
3. **Пустые результаты** - проверьте ключевые слова и регион
4. **CORS ошибки** - проверьте настройки прокси

### Логирование

Все операции логируются в консоль браузера:

```javascript
console.log('🔍 Анализируем конкурентов...');
console.log('📊 Данные получены:', data);
console.error('❌ Ошибка:', error);
```

## Обновления и развитие

### Планируемые функции

- [ ] Кэширование результатов
- [ ] Уведомления об изменениях
- [ ] Интеграция с Google Analytics
- [ ] Автоматические отчеты
- [ ] API для внешних систем

### Версионирование

- **v1.0** - Базовая функциональность
- **v1.1** - Региональный анализ
- **v1.2** - Анализ ключевых слов
- **v1.3** - Экспорт и отчеты

## Поддержка

При возникновении проблем:

1. Проверьте консоль браузера
2. Убедитесь в корректности токена
3. Проверьте доступность keys.so API
4. Обратитесь к документации keys.so

---

**SteelBro Competitors Analysis System v1.3**  
*Оптимизированная система анализа конкурентов на базе keys.so API*

<!-- End of file: docs/COMPETITORS_ANALYSIS.md -->
<!-- Last modified: 2025-01-22 -->
