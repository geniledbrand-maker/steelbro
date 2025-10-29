# 🔧 SteelBro CSS Style Guide

> Современное руководство по CSS для высокопроизводительных веб-приложений с использованием нативных CSS фич 2025 года

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/steelbro-css-guide)
[![CSS](https://img.shields.io/badge/CSS-Modern-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Mobile First](https://img.shields.io/badge/Mobile--First-80%25-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 Содержание

- [О проекте](#о-проекте)
- [Ключевые принципы](#ключевые-принципы)
- [Быстрый старт](#быстрый-старт)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [CSS Архитектура](#css-архитектура)
    - [CSS Modules](#css-modules)
    - [CSS Custom Properties](#css-custom-properties)
    - [Cascade Layers](#cascade-layers)
    - [Container Queries](#container-queries)
- [Компоненты](#компоненты)
- [Mobile-First подход](#mobile-first-подход)
- [Доступность](#доступность)
- [Производительность](#производительность)
- [Чеклист разработчика](#чеклист-разработчика)
- [Примеры](#примеры)
- [Поддержка браузеров](#поддержка-браузеров)
- [FAQ](#faq)
- [Контрибьюция](#контрибьюция)
- [Лицензия](#лицензия)

## О проекте

**SteelBro CSS Style Guide** — это комплексное руководство по написанию современного, производительного и поддерживаемого CSS кода для коммерческих проектов в 2025 году. Руководство основано на нативных CSS технологиях без использования препроцессоров и фреймворков.

### Для кого это руководство?

- 🎯 Frontend разработчики, работающие с современным CSS
- 👥 Команды, стремящиеся к единообразию кода
- 🚀 Проекты с высокими требованиями к производительности
- 📱 Приложения с приоритетом на мобильные устройства (80%+ пользователей)

### Почему это руководство?

```
✅ Современные CSS фичи (2024-2025)
✅ Mobile-First архитектура
✅ Нативный CSS без препроцессоров
✅ Высокая производительность из коробки
✅ Готовые примеры компонентов
✅ Чеклисты и best practices
```

## Ключевые принципы

### 1. 📱 Mobile-First

80% пользователей на мобильных устройствах. Базовые стили для 320px+, затем адаптация вверх через `min-width`.

```css
/* ✅ Правильно: Mobile-First */
.component {
  padding: var(--spacing-4); /* 320px+ */
}

@media (min-width: 768px) {
  .component {
    padding: var(--spacing-6); /* 768px+ */
  }
}

/* ❌ Неправильно: Desktop-First */
.component {
  padding: var(--spacing-6);
}

@media (max-width: 767px) {
  .component {
    padding: var(--spacing-4);
  }
}
```

### 2. 🎨 Component-Scoped CSS

Каждый компонент изолирован через CSS Modules. Один компонент = один `.module.css` файл.

```css
/* ProductCard.module.css */
.card {
  container-type: inline-size;
  container-name: product-card;
  /* ... */
}
```

### 3. 📦 Container Queries

Адаптивность на уровне компонента, а не страницы. Компоненты адаптируются к своему контейнеру.

```css
.card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 140px 1fr;
  }
}
```

### 4. 🚫 Native CSS Only

Без препроцессоров (SASS/SCSS), без Tailwind, без CSS-in-JS. Только нативные CSS возможности 2025 года.

### 5. ⚡ Performance First

Оптимизация производительности на всех уровнях: CSS Containment, минимизация reflow/repaint, ленивая загрузка.

## Быстрый старт

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/steelbro-css-guide.git

# Перейти в директорию
cd steelbro-css-guide

# Открыть документацию
open index.html
```

### Использование в проекте

1. **Скопируйте базовые файлы:**
```bash
cp styles/variables.css your-project/styles/
cp styles/reset.css your-project/styles/
cp styles/layers.css your-project/styles/
```

2. **Подключите в HTML:**
```html
<link rel="stylesheet" href="styles/layers.css">
<link rel="stylesheet" href="styles/reset.css">
<link rel="stylesheet" href="styles/variables.css">
```

3. **Создайте первый компонент:**
```css
/* Button.module.css */
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
}
```

## Технологический стек

### ✅ Используем ТОЛЬКО

| Технология | Описание | Версия браузера |
|------------|----------|-----------------|
| **CSS Modules** | Изоляция стилей компонентов | All modern |
| **Container Queries** | Адаптивность компонентов | Chrome 105+, Safari 16+, Firefox 110+ |
| **Subgrid** | Выравнивание карточек в гриде | Chrome 117+, Safari 16+, Firefox 71+ |
| **CSS Nesting** | Вложенность без препроцессоров | Chrome 112+, Safari 16.5+, Firefox 117+ |
| **:has()** | Условная стилизация родителей | Chrome 105+, Safari 15.4+, Firefox 121+ |
| **CSS Custom Properties** | Переменные для дизайн-системы | All modern |
| **Cascade Layers** | Управление приоритетами | Chrome 99+, Safari 15.4+, Firefox 97+ |

### ❌ Запрещено

```diff
- Tailwind CSS
- SASS/SCSS/Less
- Styled-components / Emotion
- Inline styles (style="")
- !important (кроме @layer utilities)
```

## Структура проекта

```
steelbro-css-guide/
├── README.md                      # Главная документация
├── CONTRIBUTING.md                # Правила контрибьюции
├── CHANGELOG.md                   # История изменений
├── LICENSE                        # Лицензия MIT
│
├── docs/                          # Документация
│   ├── index.html                 # Style Guide (интерактивный)
│   ├── style-guide.css            # Стили для документации
│   ├── style-guide.js             # Интерактивность
│   └── assets/                    # Изображения и примеры
│
├── styles/                        # Базовые стили проекта
│   ├── variables.css              # CSS Custom Properties
│   ├── reset.css                  # CSS Reset
│   ├── layers.css                 # Cascade Layers
│   └── utilities.css              # Utility классы
│
├── components/                    # Примеры компонентов
│   ├── Button/
│   │   ├── Button.module.css
│   │   ├── Button.html
│   │   └── README.md
│   ├── ProductCard/
│   │   ├── ProductCard.module.css
│   │   ├── ProductCard.html
│   │   └── README.md
│   ├── Form/
│   │   ├── Form.module.css
│   │   ├── Form.html
│   │   └── README.md
│   └── Navigation/
│       ├── Navigation.module.css
│       ├── Navigation.html
│       └── README.md
│
├── examples/                      # Полные примеры страниц
│   ├── landing/
│   ├── catalog/
│   └── checkout/
│
├── templates/                     # Шаблоны для быстрого старта
│   ├── component.module.css       # Шаблон компонента
│   └── page.html                  # Шаблон страницы
│
├── tests/                         # Тесты
│   ├── accessibility/             # A11y тесты
│   ├── performance/               # Performance тесты
│   └── browser-support/           # Тесты совместимости
│
└── scripts/                       # Утилиты и скрипты
    ├── validate-css.js            # Валидация CSS
    └── generate-docs.js           # Генерация документации
```

## CSS Архитектура

### CSS Modules

**Принцип:** Один компонент = один `.module.css` файл.

```css
/* ProductCard.module.css */

/* 1. Container definition */
.card {
  container-type: inline-size;
  container-name: product-card;
  /* базовые стили для 320px+ */
}

/* 2. Вложенные элементы (CSS Nesting) */
.card {
  & .image {
    width: 100%;
    aspect-ratio: 1 / 1;
  }

  & .title {
    font-size: var(--font-size-lg);
    text-wrap: balance;
  }
}

/* 3. Модификаторы */
.card {
  &--featured {
    border: 2px solid var(--color-primary-600);
  }
}

/* 4. Container Queries */
@container product-card (min-width: 400px) {
  .card {
    grid-template-columns: 140px 1fr;
  }
}
```

### CSS Custom Properties

**Все значения через переменные.** Нет магических чисел!

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #eff6ff;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Spacing */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Effects */
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --radius-md: 0.5rem;
  --transition-base: 250ms ease-in-out;
  
  /* Touch Targets */
  --touch-target-min: 44px;
}
```

### Cascade Layers

**Управление приоритетом без `!important`.**

```css
/* Определение порядка слоёв */
@layer reset, base, layout, components, utilities;

/* Использование */
@layer components {
  .button {
    padding: var(--spacing-3);
  }
}

@layer utilities {
  .p-0 {
    padding: 0 !important; /* Только здесь разрешён !important */
  }
}
```

### Container Queries

**Адаптивность на уровне компонента.**

```css
.card {
  /* Определяем контейнер */
  container-type: inline-size;
  container-name: product-card;
}

/* Компонент адаптируется к своему размеру, а не к viewport */
@container product-card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 140px 1fr;
  }
}

@container product-card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

## Компоненты

### Button (Кнопка)

```css
/* Button.module.css */
.button {
  /* Touch target минимум 44px */
  min-height: var(--touch-target-min);
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);

  /* Интерактивные состояния */
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

  /* Focus для доступности */
  &:focus-visible {
    outline: 2px solid var(--color-primary-600);
    outline-offset: 2px;
  }
}
```

### Form (Формы)

```css
/* Form.module.css */
.formGroup {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);

  /* Условная стилизация через :has() */
  &:has(input:invalid:not(:placeholder-shown)) {
    & .label {
      color: var(--color-danger);
    }
    
    & .input {
      border-color: var(--color-danger);
    }
  }
}

.input {
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
}
```

### Product Card (Карточка товара)

```css
/* ProductCard.module.css */
.card {
  /* Container + Subgrid */
  container-type: inline-size;
  container-name: product-card;
  
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 5;
  gap: var(--spacing-3);
  
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);

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
    text-wrap: balance; /* Равномерное распределение текста */
  }

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-4px);
    
    & .image {
      transform: scale(1.05);
    }
  }
}

/* Container Query: горизонтальная раскладка */
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

## Mobile-First подход

### Breakpoints

```css
/* Mobile-first: базовые стили для 320px+ */
.component {
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
}

/* Планшет портрет - 640px */
@media (min-width: 640px) {
  .component {
    padding: var(--spacing-6);
  }
}

/* Планшет ландшафт - 768px */
@media (min-width: 768px) {
  .component {
    padding: var(--spacing-8);
    font-size: var(--font-size-lg);
  }
}

/* Ноутбук - 1024px */
@media (min-width: 1024px) {
  .component {
    max-width: 1024px;
    margin-inline: auto;
  }
}

/* Десктоп - 1280px */
@media (min-width: 1280px) {
  .component {
    max-width: 1280px;
  }
}
```

### Правила Mobile-First

```diff
+ Базовые стили для 320px+
+ Breakpoints только вверх (min-width)
+ Container Queries вместо Media Queries где возможно
+ Touch targets минимум 44×44px
+ Приоритет производительности на мобильных

- Никогда не используйте max-width
- Не начинайте с desktop стилей
- Избегайте фиксированных размеров в px
```

## Доступность

### Focus States

```css
/* Глобальные focus состояния */
:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

/* Убираем outline для мыши, оставляем для клавиатуры */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion

```css
/* Уважаем предпочтения пользователя */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ARIA и семантика

```html
<!-- ✅ Правильно: семантический HTML + ARIA -->
<button class="button" aria-label="Добавить в корзину">
  <span aria-hidden="true">🛒</span>
  Купить
</button>

<!-- ❌ Неправильно: div как кнопка -->
<div class="button" onclick="buy()">Купить</div>
```

## Производительность

### CSS Containment

```css
.card {
  /* Изолируем компонент для оптимизации рендеринга */
  contain: layout style paint;
  content-visibility: auto;
}
```

### Will-change (использовать осторожно)

```css
.button {
  /* Только для элементов, которые точно будут анимироваться */
  &:hover {
    will-change: transform;
    transform: translateY(-2px);
  }
}
```

### Оптимизация анимаций

```css
/* ✅ Правильно: анимация через transform/opacity */
.card {
  transition: transform var(--transition-base),
              opacity var(--transition-base);
}

.card:hover {
  transform: translateY(-4px);
  opacity: 0.9;
}

/* ❌ Неправильно: анимация через top/left */
.card {
  transition: top var(--transition-base);
}

.card:hover {
  top: -4px; /* Вызывает reflow */
}
```

## Чеклист разработчика

Перед коммитом проверьте:

### ✅ Обязательно

- [ ] Используется CSS Modules (`.module.css`)
- [ ] Стили написаны Mobile-First (базовые для 320px+)
- [ ] Используется Container Queries для адаптивности компонента
- [ ] Используется CSS Nesting для вложенных элементов
- [ ] Используется `:has()` для условной стилизации
- [ ] Все значения через CSS Custom Properties (нет магических чисел)
- [ ] Минимальный размер кнопок и touch targets 44×44px
- [ ] Переходы через `var(--transition-*)`
- [ ] Нет `!important` (кроме `@layer utilities`)
- [ ] Реализованы `:hover` и `:active` состояния
- [ ] `:focus-visible` для клавиатурной навигации
- [ ] `prefers-reduced-motion` учтён

### 🚨 Критические правила (НЕЛЬЗЯ НАРУШАТЬ)

```
❌ Desktop-First подход
❌ Использование max-width в media queries
❌ Магические числа (17px, 23px, etc.)
❌ Touch targets меньше 44px
❌ Глобальные стили в компонентах
❌ Tailwind, SASS, Styled-components
❌ Inline styles
```

## Примеры

### Landing Page

```html
<!-- examples/landing/index.html -->
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SteelBro - Металлопрокат</title>
  <link rel="stylesheet" href="../../styles/layers.css">
  <link rel="stylesheet" href="../../styles/variables.css">
  <link rel="stylesheet" href="landing.module.css">
</head>
<body>
  <header class="header">
    <!-- Navigation -->
  </header>
  
  <main class="main">
    <!-- Hero section -->
    <!-- Products grid -->
    <!-- CTA section -->
  </main>
  
  <footer class="footer">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

### Catalog Page

См. `examples/catalog/` для полного примера страницы каталога с:
- Фильтрами
- Сортировкой
- Сеткой товаров с Container Queries
- Пагинацией

## Поддержка браузеров

### Целевые браузеры (2025)

| Браузер | Минимальная версия | Доля рынка |
|---------|-------------------|------------|
| Chrome | 105+ | 65% |
| Safari | 16+ | 20% |
| Firefox | 110+ | 5% |
| Edge | 105+ | 5% |
| Samsung Internet | 20+ | 3% |

### Полифилы не требуются

Все используемые фичи поддерживаются в современных браузерах (2024-2025). Для старых браузеров рекомендуется progressive enhancement.

## FAQ

### Почему без Tailwind?

**Tailwind** отличный инструмент, но для этого проекта выбран нативный CSS по следующим причинам:

1. **Производительность**: Нет runtime утилит, меньше размер CSS
2. **Обучение**: Разработчики учат нативный CSS, а не фреймворк
3. **Гибкость**: Нет ограничений утилит Tailwind
4. **Современность**: Используем новейшие CSS фичи напрямую

### Почему без SASS/SCSS?

**SASS** был необходим 5-10 лет назад. В 2025 году нативный CSS имеет:

- CSS Nesting (вложенность)
- CSS Custom Properties (переменные)
- calc() для вычислений
- color-mix() для цветов
- И многое другое

SASS добавляет шаг билда без реальной пользы для современных проектов.

### Как использовать с React/Vue/Angular?

CSS Modules поддерживаются из коробки:

**React:**
```jsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click</button>;
}
```

**Vue:**
```vue
<template>
  <button :class="$style.button">Click</button>
</template>

<style module src="./Button.module.css"></style>
```

### Что делать со старыми браузерами?

**Progressive Enhancement:**

```css
/* Базовые стили для всех */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Улучшение для современных браузеров */
@supports (container-type: inline-size) {
  .grid {
    container-type: inline-size;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
```

### Можно ли использовать с существующим проектом?

Да! Начните постепенно:

1. Добавьте `variables.css` с переменными
2. Создавайте новые компоненты через CSS Modules
3. Постепенно рефакторите старые компоненты
4. Используйте `@layer` для контроля приоритетов

## Контрибьюция

Мы приветствуем контрибьюции! См. [CONTRIBUTING.md](CONTRIBUTING.md) для деталей.

### Как внести вклад

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Code Review Checklist

- [ ] Код соответствует Style Guide
- [ ] Все пункты чеклиста разработчика пройдены
- [ ] Добавлены примеры использования
- [ ] Обновлена документация
- [ ] Проверена кроссбраузерность

## Лицензия

MIT License - см. [LICENSE](LICENSE) файл для деталей.

---

## 📚 Дополнительные ресурсы

### Официальная документация

- [MDN: CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)
- [CSS :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers)

### Полезные статьи

- [Modern CSS Solutions](https://moderncss.dev/)
- [CSS Tricks](https://css-tricks.com/)
- [Smashing Magazine: CSS](https://www.smashingmagazine.com/category/css)
- [Web.dev: CSS](https://web.dev/learn/css/)

### Инструменты

- [Can I Use](https://caniuse.com/) - проверка поддержки браузерами
- [CSS Stats](https://cssstats.com/) - анализ CSS
- [Specificity Calculator](https://specificity.keegan.st/) - расчёт специфичности
- [Modern CSS Reset](https://piccalil.li/blog/a-more-modern-css-reset/)

---

**Создано с ❤️ командой SteelBro**

*Версия 1.0 | Октябрь 2025*