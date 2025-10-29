# 🚀 Быстрый старт — 5 минут до запуска

## Что создать первым делом

### Минимальный набор для запуска (СЕЙЧАС)

```bash
# 1. Создайте структуру директорий
mkdir -p styles components/Button docs

# 2. Создайте критические файлы
touch styles/{variables,reset,layers}.css
touch components/Button/Button.module.css
touch docs/index.html
touch .gitignore
```

---

## 📁 Шаг 1: Базовые CSS файлы (10 минут)

### styles/variables.css
```css
:root {
  /* Colors - Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Colors - Gray */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-300: #d1d5db;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-900: #111827;
  
  /* Colors - Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* Spacing */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  
  /* Typography */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Border Radius */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  
  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-popover: 1050;
  --z-tooltip: 1060;
  
  /* Touch Targets */
  --touch-target-min: 44px;
  
  /* Breakpoints (для reference в JS) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### styles/reset.css
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
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-base);
  line-height: var(--leading-normal);
  color: var(--color-gray-900);
  background: var(--color-gray-50);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
  height: auto;
}

input,
button,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

ul,
ol {
  list-style: none;
}

/* Remove default focus outline, we'll add our own */
:focus {
  outline: none;
}

/* Add focus-visible styles */
:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### styles/layers.css
```css
/* Define cascade layers order */
@layer reset, base, layout, components, utilities;

/* Reset layer */
@layer reset {
  /* Import reset.css here or inline */
}

/* Base layer - typography, colors, etc. */
@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-gray-900);
    background: var(--color-gray-50);
  }
  
  h1 { font-size: var(--font-size-3xl); }
  h2 { font-size: var(--font-size-2xl); }
  h3 { font-size: var(--font-size-xl); }
  h4 { font-size: var(--font-size-lg); }
}

/* Layout layer - grid, flex, containers */
@layer layout {
  .container {
    width: 100%;
    margin-inline: auto;
    padding-inline: var(--spacing-4);
  }
  
  @media (min-width: 640px) {
    .container {
      max-width: 640px;
    }
  }
  
  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
      padding-inline: var(--spacing-6);
    }
  }
  
  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }
}

/* Components layer - imported component styles */
@layer components {
  /* Component styles will be here */
}

/* Utilities layer - override everything */
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
}
```

---

## 🎨 Шаг 2: Первый компонент — Button (5 минут)

### components/Button/Button.module.css
```css
/* Button component - Mobile-First */
.button {
  /* Base styles for 320px+ */
  min-height: var(--touch-target-min);
  padding: var(--spacing-3) var(--spacing-6);
  
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  text-align: center;
  
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  
  cursor: pointer;
  transition: all var(--transition-base);
  
  /* Prevent text selection */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  /* States */
  &:hover {
    background: var(--color-primary-700);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary-600);
    outline-offset: 2px;
  }
}

/* Variants */
.button--secondary {
  background: var(--color-gray-600);
  
  &:hover {
    background: var(--color-gray-700);
  }
}

.button--outline {
  background: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
  
  &:hover {
    background: var(--color-primary-50);
  }
}

.button--danger {
  background: var(--color-danger);
  
  &:hover {
    background: #dc2626;
  }
}

/* Sizes */
.button--sm {
  min-height: calc(var(--touch-target-min) * 0.8);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
}

.button--lg {
  min-height: calc(var(--touch-target-min) * 1.2);
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-lg);
}

/* Full width */
.button--full {
  width: 100%;
}

/* With icon */
.button--with-icon {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Loading state */
.button--loading {
  position: relative;
  color: transparent;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    margin-left: -8px;
    margin-top: -8px;
    border: 2px solid white;
    border-radius: 50%;
    border-top-color: transparent;
    animation: button-spin 0.6s linear infinite;
  }
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}
```

### components/Button/Button.html
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Button Component</title>
  <link rel="stylesheet" href="../../styles/variables.css">
  <link rel="stylesheet" href="../../styles/reset.css">
  <link rel="stylesheet" href="Button.module.css">
  <style>
    body { 
      padding: var(--spacing-8); 
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }
    .demo-section {
      padding: var(--spacing-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .demo-section h2 {
      margin-bottom: var(--spacing-4);
      color: var(--color-gray-900);
    }
    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-3);
    }
  </style>
</head>
<body>
  <div class="demo-section">
    <h2>Default Buttons</h2>
    <div class="button-group">
      <button class="button">Primary</button>
      <button class="button button--secondary">Secondary</button>
      <button class="button button--outline">Outline</button>
      <button class="button button--danger">Danger</button>
    </div>
  </div>

  <div class="demo-section">
    <h2>Sizes</h2>
    <div class="button-group">
      <button class="button button--sm">Small</button>
      <button class="button">Medium</button>
      <button class="button button--lg">Large</button>
    </div>
  </div>

  <div class="demo-section">
    <h2>States</h2>
    <div class="button-group">
      <button class="button">Normal</button>
      <button class="button" disabled>Disabled</button>
      <button class="button button--loading">Loading</button>
    </div>
  </div>

  <div class="demo-section">
    <h2>Full Width</h2>
    <button class="button button--full">Full Width Button</button>
  </div>

  <div class="demo-section">
    <h2>With Icons</h2>
    <div class="button-group">
      <button class="button button--with-icon">
        <span>🛒</span>
        <span>Add to Cart</span>
      </button>
      <button class="button button--with-icon button--outline">
        <span>❤️</span>
        <span>Like</span>
      </button>
    </div>
  </div>
</body>
</html>
```

---

## 📄 Шаг 3: .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Build outputs
dist/
build/
.cache/
*.css.map
.parcel-cache/

# IDE / Editor
.vscode/
.idea/
*.sublime-project
*.sublime-workspace
.DS_Store
.AppleDouble
.LSOverride

# OS
Thumbs.db
Desktop.ini
._*

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
*.tmp
.temp/

# Testing
coverage/
.nyc_output/

# Environment
.env
.env.local
.env.*.local

# Debug
.debug/
debug.log
```

---

## ✅ Проверка установки

### Откройте Button.html в браузере

```bash
# Если у вас есть Python
python -m http.server 8000

# Или Node.js с npx
npx serve .

# Затем откройте
open http://localhost:8000/components/Button/Button.html
```

Вы должны увидеть все варианты кнопок с правильными стилями!

---

## 📝 Шаг 4: Создайте README.md

Скопируйте содержимое из файла `/home/claude/README.md`, который я создал выше.

---

## 🚀 Шаг 5: Git init и первый commit

```bash
# Инициализация репозитория
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Setup SteelBro CSS Style Guide

- Add CSS variables system
- Add modern CSS reset
- Add cascade layers
- Add Button component with all variants
- Add project documentation"

# Создать репозиторий на GitHub и залить
git remote add origin https://github.com/yourusername/steelbro-css-guide.git
git branch -M main
git push -u origin main
```

---

## 🎯 Следующие шаги (порядок приоритетов)

### Неделя 1: Базовые компоненты
- [ ] ProductCard компонент
- [ ] Form компонент (Input, Textarea, Select)
- [ ] Navigation компонент

### Неделя 2: Документация
- [ ] Создать docs/index.html (интерактивный Style Guide)
- [ ] Добавить примеры использования
- [ ] Написать CONTRIBUTING.md

### Неделя 3: Примеры страниц
- [ ] Landing page пример
- [ ] Catalog page пример
- [ ] GitHub Pages для демо

### Неделя 4: Финализация
- [ ] Тесты доступности
- [ ] Проверка кроссбраузерности
- [ ] SEO оптимизация
- [ ] Релиз v1.0

---

## 💡 Быстрые команды

### Создать новый компонент

```bash
# Создать структуру
mkdir -p components/ComponentName
touch components/ComponentName/{ComponentName.module.css,ComponentName.html,README.md}

# Скопировать шаблон
cp templates/component.module.css components/ComponentName/ComponentName.module.css
```

### Проверить CSS

```bash
# Если установлен stylelint
npx stylelint "**/*.css"

# Автоматически исправить
npx stylelint "**/*.css" --fix
```

### Запустить локальный сервер

```bash
# Python
python -m http.server 8000

# Node.js
npx serve -p 8000

# PHP
php -S localhost:8000
```

---

## 🆘 Частые проблемы

### CSS переменные не работают
```css
/* ❌ Неправильно */
.button {
  color: color-primary-600; /* Забыли var() */
}

/* ✅ Правильно */
.button {
  color: var(--color-primary-600);
}
```

### Container Queries не работают
```css
/* ❌ Забыли определить container */
.card {
  display: grid;
}

@container (min-width: 400px) { /* Не работает! */
  .card { grid-template-columns: 1fr 1fr; }
}

/* ✅ Правильно - сначала определить container */
.card {
  container-type: inline-size;
  container-name: card;
  display: grid;
}

@container card (min-width: 400px) {
  .card { grid-template-columns: 1fr 1fr; }
}
```

### CSS Nesting не работает
Убедитесь, что используете современный браузер:
- Chrome 112+
- Safari 16.5+
- Firefox 117+

---

## 📚 Полезные ссылки

### Созданные файлы
- [README.md](/home/claude/README.md) - Главная документация
- [PROJECT_STRUCTURE.md](/home/claude/PROJECT_STRUCTURE.md) - Структура проекта
- [SEO_GEO_OPTIMIZATION.md](/home/claude/SEO_GEO_OPTIMIZATION.md) - Оптимизация

### Внешние ресурсы
- [MDN: CSS](https://developer.mozilla.org/docs/Web/CSS)
- [Can I Use](https://caniuse.com/)
- [CSS Tricks](https://css-tricks.com/)

---

**🎉 Поздравляю! Вы готовы к работе!**

Теперь у вас есть:
- ✅ Базовые CSS файлы (variables, reset, layers)
- ✅ Первый компонент (Button со всеми вариантами)
- ✅ Рабочий пример (Button.html)
- ✅ Git репозиторий
- ✅ Понимание следующих шагов

**Время начать создавать!** 🚀