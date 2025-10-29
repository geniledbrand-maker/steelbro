# 📁 Структура проекта SteelBro CSS Style Guide

## Обязательные файлы для запуска проекта

### 1. 📄 Корневые файлы

```
steelbro-css-guide/
├── README.md                    ✅ Главная документация (создан)
├── CONTRIBUTING.md              📝 Правила контрибьюции
├── CHANGELOG.md                 📝 История изменений
├── LICENSE                      📝 MIT License
├── .gitignore                   📝 Git ignore файл
├── package.json                 📝 NPM dependencies (опционально)
└── .editorconfig               📝 Настройки редактора
```

---

## 2. 🎨 Базовые CSS файлы (styles/)

### variables.css
**Приоритет: КРИТИЧНЫЙ**
```css
/* Все CSS переменные проекта */
:root {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-600: #2563eb;
  /* ... остальные переменные */
  
  /* Spacing */
  --spacing-1: 0.25rem;
  /* ... */
  
  /* Typography */
  --font-size-base: 1rem;
  /* ... */
  
  /* Effects */
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --transition-base: 250ms ease-in-out;
  /* ... */
}
```

### reset.css
**Приоритет: КРИТИЧНЫЙ**
```css
/* Modern CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

/* ... остальной reset */
```

### layers.css
**Приоритет: КРИТИЧНЫЙ**
```css
/* Определение порядка cascade layers */
@layer reset, base, layout, components, utilities;

/* Reset layer */
@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

/* Base layer */
@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.5;
  }
}
```

### utilities.css
**Приоритет: СРЕДНИЙ**
```css
/* Utility классы с !important */
@layer utilities {
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border-width: 0 !important;
  }
  
  .hidden {
    display: none !important;
  }
  
  .visually-hidden {
    position: absolute !important;
    overflow: hidden !important;
    clip: rect(0 0 0 0) !important;
    width: 1px !important;
    height: 1px !important;
    margin: -1px !important;
    padding: 0 !important;
    border: 0 !important;
  }
}
```

---

## 3. 📦 Компоненты (components/)

### Button/
```
components/Button/
├── Button.module.css           ✅ CSS модуль кнопки
├── Button.html                 📝 HTML пример
├── Button.test.css            📝 Тесты стилей
└── README.md                   📝 Документация компонента
```

**Button.module.css:**
```css
.button {
  min-height: var(--touch-target-min);
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-primary-700);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-600);
    outline-offset: 2px;
  }
}

.button--secondary {
  background: var(--color-gray-600);
  
  &:hover {
    background: var(--color-gray-700);
  }
}

.button--outline {
  background: transparent;
  border: 2px solid var(--color-primary-600);
  color: var(--color-primary-600);
  
  &:hover {
    background: var(--color-primary-50);
  }
}
```

### ProductCard/
```
components/ProductCard/
├── ProductCard.module.css      ✅ CSS модуль карточки
├── ProductCard.html            📝 HTML пример
└── README.md                   📝 Документация
```

**ProductCard.module.css:**
```css
.card {
  container-type: inline-size;
  container-name: product-card;
  
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 5;
  gap: var(--spacing-3);

  & .image {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: var(--radius-md);
    transition: transform var(--transition-base);
  }

  & .title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-semibold);
    text-wrap: balance;
  }

  & .price {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-primary-600);
  }

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-4px);
    
    & .image {
      transform: scale(1.05);
    }
  }
}

@container product-card (min-width: 400px) {
  .card {
    grid-template-columns: 140px 1fr;
    
    & .image {
      grid-row: 1 / -1;
      aspect-ratio: 3 / 4;
    }
  }
}
```

### Form/
```
components/Form/
├── Form.module.css             ✅ CSS модуль форм
├── Form.html                   📝 HTML пример
└── README.md                   📝 Документация
```

### Navigation/
```
components/Navigation/
├── Navigation.module.css       ✅ CSS модуль навигации
├── Navigation.html             📝 HTML пример
└── README.md                   📝 Документация
```

---

## 4. 📖 Документация (docs/)

```
docs/
├── index.html                  ✅ Интерактивный Style Guide
├── style-guide.css             ✅ Стили для документации
├── style-guide.js              ✅ Интерактивность
├── assets/
│   ├── images/                 📸 Скриншоты и примеры
│   ├── icons/                  🎨 Иконки
│   └── fonts/                  🔤 Шрифты (если нужны)
└── examples/
    ├── buttons.html            📝 Примеры кнопок
    ├── forms.html              📝 Примеры форм
    └── cards.html              📝 Примеры карточек
```

---

## 5. 📝 Шаблоны (templates/)

### component.module.css
**Шаблон для создания новых компонентов**
```css
/* ComponentName.module.css */

/* 1. Container definition (если нужен) */
.componentName {
  container-type: inline-size;
  container-name: component-name;
}

/* 2. Base styles (mobile-first: 320px+) */
.componentName {
  /* Base styles here */
}

/* 3. Nested elements (CSS Nesting) */
.componentName {
  & .element {
    /* Nested element styles */
  }
}

/* 4. Modifiers and states */
.componentName {
  &--variant {
    /* Modifier styles */
  }
  
  &:hover {
    /* Hover styles */
  }
  
  &:focus-visible {
    /* Focus styles for accessibility */
  }
  
  &:has(.child) {
    /* Conditional styling with :has() */
  }
}

/* 5. Container Queries (если нужны) */
@container component-name (min-width: 400px) {
  .componentName {
    /* Responsive adaptation */
  }
}

/* 6. Media Queries (если Container Queries недостаточно) */
@media (min-width: 768px) {
  .componentName {
    /* Tablet and above */
  }
}
```

### page.html
**Шаблон HTML страницы**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Описание страницы">
  <title>Заголовок страницы - SteelBro</title>
  
  <!-- Базовые стили -->
  <link rel="stylesheet" href="/styles/layers.css">
  <link rel="stylesheet" href="/styles/reset.css">
  <link rel="stylesheet" href="/styles/variables.css">
  
  <!-- Стили страницы -->
  <link rel="stylesheet" href="page.module.css">
</head>
<body>
  <!-- Навигация -->
  <header class="header">
    <!-- Navigation component -->
  </header>
  
  <!-- Основной контент -->
  <main class="main">
    <!-- Page content -->
  </main>
  
  <!-- Подвал -->
  <footer class="footer">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

---

## 6. 🧪 Тесты (tests/)

```
tests/
├── accessibility/
│   ├── focus-states.test.html
│   ├── keyboard-nav.test.html
│   └── screen-reader.test.html
├── performance/
│   ├── render-performance.test.html
│   └── css-containment.test.html
└── browser-support/
    ├── container-queries.test.html
    ├── css-nesting.test.html
    └── has-selector.test.html
```

---

## 7. 🔧 Конфигурационные файлы

### .gitignore
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.css.map

# IDE
.vscode/
.idea/
*.sublime-*

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
*.tmp
```

### .editorconfig
```ini
# EditorConfig для консистентности кода
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.css]
indent_size = 2
```

### package.json (опционально)
```json
{
  "name": "steelbro-css-style-guide",
  "version": "1.0.0",
  "description": "Modern CSS Style Guide with native CSS features",
  "keywords": [
    "css",
    "style-guide",
    "css-modules",
    "container-queries",
    "mobile-first",
    "modern-css"
  ],
  "author": "SteelBro Team",
  "license": "MIT",
  "scripts": {
    "validate": "stylelint '**/*.css'",
    "test": "echo 'Tests coming soon'",
    "docs": "open docs/index.html"
  },
  "devDependencies": {
    "stylelint": "^15.0.0",
    "stylelint-config-standard": "^35.0.0"
  }
}
```

### stylelint.config.js (опционально)
```javascript
module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]*(__[a-z][a-zA-Z0-9]*)?(--[a-z][a-zA-Z0-9]*)?$',
    'custom-property-pattern': '^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$',
    'declaration-no-important': [true, {
      severity: 'warning'
    }],
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global']
    }]
  }
};
```

---

## 8. 📚 Документация проекта

### CONTRIBUTING.md
```markdown
# Правила контрибьюции

## Как внести вклад

1. Fork репозитория
2. Создайте feature branch
3. Сделайте изменения
4. Проверьте чеклист разработчика
5. Создайте Pull Request

## Code Style

- Используйте CSS Modules
- Mobile-First подход обязателен
- Все значения через CSS переменные
- БЭМ методология для именования

## Pull Request Process

- Опишите изменения
- Добавьте примеры
- Проверьте на всех breakpoints
- Тест на доступность
```

### CHANGELOG.md
```markdown
# Changelog

## [1.0.0] - 2025-10-28

### Added
- Начальная версия Style Guide
- CSS Modules для всех компонентов
- Container Queries примеры
- Mobile-First подход
- Документация и примеры
```

### LICENSE
```
MIT License

Copyright (c) 2025 SteelBro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 9. 🚀 Примеры страниц (examples/)

```
examples/
├── landing/
│   ├── index.html
│   ├── landing.module.css
│   └── README.md
├── catalog/
│   ├── index.html
│   ├── catalog.module.css
│   └── README.md
└── checkout/
    ├── index.html
    ├── checkout.module.css
    └── README.md
```

---

## Приоритеты создания файлов

### 🔴 Критично (создать первым делом)
1. `README.md` ✅
2. `styles/variables.css`
3. `styles/reset.css`
4. `styles/layers.css`
5. `docs/index.html` (главный Style Guide)

### 🟡 Важно (создать далее)
6. `components/Button/Button.module.css`
7. `components/ProductCard/ProductCard.module.css`
8. `components/Form/Form.module.css`
9. `templates/component.module.css`
10. `.gitignore`

### 🟢 Опционально (при необходимости)
11. `package.json`
12. `tests/*`
13. `CONTRIBUTING.md`
14. `CHANGELOG.md`
15. `examples/*`

---

## Следующие шаги

1. **Создайте базовые CSS файлы** (variables, reset, layers)
2. **Создайте первый компонент** (Button) как reference
3. **Настройте документацию** (docs/index.html)
4. **Добавьте примеры** использования
5. **Настройте CI/CD** (опционально)

## Команды для быстрого старта

```bash
# Создать структуру директорий
mkdir -p styles components/{Button,ProductCard,Form,Navigation} docs/assets/{images,icons} templates tests/{accessibility,performance,browser-support} examples/{landing,catalog,checkout}

# Создать базовые файлы
touch styles/{variables,reset,layers,utilities}.css
touch components/Button/Button.module.css
touch templates/component.module.css
touch .gitignore .editorconfig
```

---

**Готово! Теперь у вас есть полная структура проекта с правильной организацией файлов.**