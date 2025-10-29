# 🌍 Обновление списка городов

## Изменения в списке городов:

### ✅ **Добавлены новые города:**
- **Тюмень** (value: `tyumen`)
- **Пермь** (value: `perm`) 
- **Челябинск** (value: `chelyabinsk`)

### ❌ **Удален город:**
- **Санкт-Петербург** (value: `spb`)

### 🏆 **Новый порядок и значение по умолчанию:**
1. **Екатеринбург** (value: `ekb`) - **ПО УМОЛЧАНИЮ**
2. Москва (value: `msk`)
3. Новосибирск (value: `nsk`)
4. Казань (value: `kzn`)
5. Тюмень (value: `tyumen`)
6. Пермь (value: `perm`)
7. Челябинск (value: `chelyabinsk`)

## Файлы, которые были изменены:

### 1. **`spy.html`** - обновлен HTML список
```html
<select id="regionSelect">
    <option value="ekb" selected>Екатеринбург</option>
    <option value="msk">Москва</option>
    <option value="nsk">Новосибирск</option>
    <option value="kzn">Казань</option>
    <option value="tyumen">Тюмень</option>
    <option value="perm">Пермь</option>
    <option value="chelyabinsk">Челябинск</option>
</select>
```

### 2. **`assets/js/app.js`** - обновлено значение по умолчанию
```javascript
this.currentRegion = 'ekb'; // Было: 'msk'
```

### 3. **`classes/Shared/TabManager.js`** - обновлено значение по умолчанию
```javascript
this.currentRegion = 'ekb'; // Было: 'msk'
setCurrentDomain(domain, region = 'ekb') // Было: 'msk'
```

## Результат:

✅ **Екатеринбург** теперь выбран по умолчанию  
✅ Добавлены **3 новых города** (Тюмень, Пермь, Челябинск)  
✅ Удален **Санкт-Петербург**  
✅ Обновлены все связанные JavaScript файлы  

## Новый список городов:

1. 🏆 **Екатеринбург** (по умолчанию)
2. 🏙️ Москва
3. 🏙️ Новосибирск  
4. 🏙️ Казань
5. 🆕 Тюмень
6. 🆕 Пермь
7. 🆕 Челябинск
