# 🔧 Отладка клика по плашке домена

## 📋 Проблема
- **❌ При клике на плашку домена** домен не переносится в поисковую строку
- **❌ Событие `domainSelected`** не срабатывает или не обрабатывается

## 🔍 Диагностика
Добавлена отладочная информация для выявления проблемы:

### 1. В `DomainUI.js`
```javascript
selectDomain(domainId) {
    console.log('DomainUI.selectDomain() - клик по домену ID:', domainId);
    this.emit('domainSelect', domainId);
}
```

### 2. В `DomainManager.js`
```javascript
handleDomainSelect(domainId) {
    console.log('DomainManager.handleDomainSelect() - выбран домен ID:', domainId);
    
    const domain = this.storage.getDomainById(domainId);
    if (!domain) {
        console.warn('Домен не найден:', domainId);
        return;
    }

    console.log('DomainManager.handleDomainSelect() - домен найден:', domain);
    this.currentDomain = domain;
    this.ui.renderDomainList(this.storage.getAllDomains(), domain.id);

    console.log('DomainManager.handleDomainSelect() - отправляем событие domainSelected');
    this.emit('domainSelected', domain);
}
```

### 3. В `app.js`
```javascript
handleDomainSelection(domain) {
    console.log('App.handleDomainSelection() - получен домен:', domain);
    
    const domainInput = document.getElementById('domainInput');
    if (domainInput) {
        domainInput.value = domain.domain;
        console.log('App.handleDomainSelection() - домен подставлен в поле:', domain.domain);
    } else {
        console.error('App.handleDomainSelection() - поле domainInput не найдено');
    }

    this.loadAllData(domain.domain, this.currentRegion);
    this.showNotification('success', `Выбран домен: ${domain.domain}`);
}
```

## 🔍 Проверка в консоли
Откройте консоль браузера (F12) и кликните на плашку домена. Должны появиться логи:

1. **Клик по домену:**
   ```
   DomainUI.selectDomain() - клик по домену ID: [ID]
   ```

2. **Обработка в DomainManager:**
   ```
   DomainManager.handleDomainSelect() - выбран домен ID: [ID]
   DomainManager.handleDomainSelect() - домен найден: [объект домена]
   DomainManager.handleDomainSelect() - отправляем событие domainSelected
   ```

3. **Обработка в App:**
   ```
   App.handleDomainSelection() - получен домен: [объект домена]
   App.handleDomainSelection() - домен подставлен в поле: [название домена]
   ```

## 🚨 Возможные проблемы

### 1. Событие не генерируется
- **Причина:** `DomainUI.selectDomain()` не вызывается
- **Решение:** Проверить HTML и обработчики кликов

### 2. Событие не передается
- **Причина:** `DomainManager.handleDomainSelect()` не вызывается
- **Решение:** Проверить связь между `DomainUI` и `DomainManager`

### 3. Событие не обрабатывается
- **Причина:** `App.handleDomainSelection()` не вызывается
- **Решение:** Проверить подписку на событие `domainSelected`

## 🎯 Следующие шаги
1. **Откройте консоль** и кликните на плашку домена
2. **Сообщите результаты** - какие логи видны
3. **Исправим проблему** на основе диагностики

## 📝 Файлы изменены
- `assets/js/app.js` - добавлена отладка в `handleDomainSelection`
- `classes/DomainManager/DomainManager.js` - добавлена отладка в `handleDomainSelect`
- `classes/DomainManager/DomainUI.js` - добавлена отладка в `selectDomain`
