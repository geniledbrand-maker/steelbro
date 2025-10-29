# 🔧 Убрать автоматическую загрузку при инициализации

## Проблема:
При открытии программы по умолчанию показывался спиннер "Загрузка данных..." вместо статичного состояния покоя.

## Причины:
1. **Автоматическая инициализация OverviewTab** - вызывался `render()` при загрузке
2. **Автоматическая проверка API** - вызывался `checkAPI()` при инициализации
3. **Отсутствие начального состояния** - не было статичного состояния покоя

## Исправления:

### 1. **Убрана автоматическая инициализация OverviewTab**
```javascript
// БЫЛО:
this.tabManager.tabs.overview.handler = new OverviewTab();
this.tabManager.tabs.overview.handler.render();

// СТАЛО:
const overviewContent = document.getElementById('overviewContent');
if (overviewContent) {
    overviewContent.innerHTML = '<div class="empty-state"><p>Выберите домен и нажмите "Анализировать" для загрузки данных</p></div>';
}
```

### 2. **Убрана автоматическая проверка API**
```javascript
// БЫЛО:
await this.checkAPI();

// СТАЛО:
this.setInitialAPIStatus();
```

### 3. **Добавлено начальное состояние API**
```javascript
setInitialAPIStatus() {
    const indicator = document.getElementById('apiIndicator');
    const statusText = document.getElementById('apiStatusText');

    if (indicator) indicator.className = 'api-indicator unknown';
    if (statusText) statusText.textContent = 'API статус';
}
```

## Результат:

✅ **Программа теперь в покое** при загрузке  
✅ **Нет автоматических спиннеров**  
✅ **Показывается статичное состояние** с инструкцией  
✅ **API статус** показывает "API статус" вместо "Проверка..."  

## Новое поведение при загрузке:

1. **Загружается интерфейс** без анимаций
2. **Показывается пустое состояние** вкладки "Обзор"
3. **API статус** в неизвестном состоянии
4. **Пользователь должен** явно нажать "Анализировать"

## Файлы, которые были изменены:

1. **`assets/js/app.js`** - убрана автоматическая загрузка и проверка API
