/**
 * DomainManager - Управление доменами и координация работы
 * Файл: /classes/DomainManager/DomainManager.js
 * Требует: DomainStorage.js, DomainUI.js
 */

class DomainManager {
    constructor(storage, ui) {
        this.storage = storage;
        this.ui = ui;
        this.currentDomain = null;
        this.eventHandlers = {};

        this.setupEventListeners();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Подписка на события из UI
        this.ui.on('domainSelect', (domainId) => this.handleDomainSelect(domainId));
        this.ui.on('domainEdit', (domainId) => this.handleDomainEdit(domainId));
        this.ui.on('domainDelete', (domainId) => this.handleDomainDelete(domainId));
        this.ui.on('domainAdd', () => this.handleDomainAdd());
        this.ui.on('domainSave', (data) => this.handleDomainSave(data));
        this.ui.on('domainsExport', () => this.handleDomainsExport());
        this.ui.on('domainsImport', (fileData) => this.handleDomainsImport(fileData));
        this.ui.on('filterByTag', (tag) => this.handleFilterByTag(tag));
        this.ui.on('showAllDomains', () => this.handleShowAllDomains());
        this.ui.on('getAllTags', () => this.handleGetAllTags());
        this.ui.on('removeAvailableTag', (tag) => this.handleRemoveAvailableTag(tag));
        this.ui.on('removeTagFromDomain', (data) => this.handleRemoveTagFromDomain(data));
        this.ui.on('getDomainsWithTag', (tag) => this.handleGetDomainsWithTag(tag));
        this.ui.on('getDomainInfo', (domainId) => this.handleGetDomainInfo(domainId));
        this.ui.on('createTag', (tagName) => this.handleCreateTag(tagName));
        this.ui.on('updateTagColor', (data) => this.handleUpdateTagColor(data));
        this.ui.on('getTagColor', (tag) => this.handleGetTagColor(tag));
        this.ui.on('saveCustomColor', (color) => this.handleSaveCustomColor(color));
        this.ui.on('getSavedColors', () => this.handleGetSavedColors());
        this.ui.on('removeSavedColor', (index) => this.handleRemoveSavedColor(index));
        this.ui.on('clearSavedColors', () => this.handleClearSavedColors());
        this.ui.on('searchDomains', (searchTerm) => this.handleSearchDomains(searchTerm));
        this.ui.on('loadDefaultDomains', (domains) => this.handleLoadDefaultDomains(domains));
        this.ui.on('syncData', () => this.handleSyncData());
    }

    /**
     * Инициализация менеджера
     */
    init() {
        const domains = this.storage.getAllDomains();
        console.log('DomainManager.init() - загружено доменов:', domains.length);
        console.log('DomainManager.init() - домены:', domains);
        
        // Загружаем цвета тегов
        const tagColors = this.storage.getTagColors();
        console.log('DomainManager.init() - загружено цветов тегов:', Object.keys(tagColors).length);
        this.ui.setTagColors(tagColors);
        
        // Проверяем, есть ли домены с тегами
        const domainsWithTags = domains.filter(d => d.tags && d.tags.length > 0);
        console.log('DomainManager.init() - доменов с тегами:', domainsWithTags.length);
        
        this.ui.renderDomainList(domains);
        this.ui.updateCounter(domains.length);
    }

    /**
     * Регистрация обработчика событий
     * @param {string} event
     * @param {Function} handler
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    /**
     * Вызов обработчиков событий
     * @param {string} event
     * @param {*} data
     */
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }

    /**
     * Обработка выбора домена
     * @param {string} domainId
     */
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

        // Отправка события для внешних обработчиков
        console.log('DomainManager.handleDomainSelect() - отправляем событие domainSelected');
        this.emit('domainSelected', domain);
    }

    /**
     * Обработка редактирования домена
     * @param {string} domainId
     */
    handleDomainEdit(domainId) {
        const domain = this.storage.getDomainById(domainId);
        if (!domain) {
            console.warn('Домен не найден:', domainId);
            return;
        }

        this.ui.showDomainModal(domain);
    }

    /**
     * Обработка удаления домена
     * @param {string} domainId
     */
    handleDomainDelete(domainId) {
        const domain = this.storage.getDomainById(domainId);
        if (!domain) {
            console.warn('Домен не найден:', domainId);
            return;
        }

        const confirmed = confirm(`Удалить домен "${domain.domain}" из сохранённых?`);
        if (!confirmed) return;

        const success = this.storage.deleteDomain(domainId);
        if (success) {
            const domains = this.storage.getAllDomains();
            this.ui.renderDomainList(domains);
            this.ui.updateCounter(domains.length);

            if (this.currentDomain && this.currentDomain.id === domainId) {
                this.currentDomain = null;
            }

            this.emit('domainDeleted', domainId);
            this.emit('notification', { type: 'success', message: 'Домен удалён' });
        } else {
            this.emit('notification', { type: 'error', message: 'Ошибка удаления домена' });
        }
    }

    /**
     * Обработка добавления нового домена
     */
    handleDomainAdd() {
        this.ui.showDomainModal(null);
    }

    /**
     * Обработка сохранения домена
     * @param {Object} data
     */
    handleDomainSave(data) {
        if (!data.domain || !data.domain.trim()) {
            this.emit('notification', { type: 'error', message: 'Введите домен' });
            return;
        }

        const domainName = data.domain.trim().replace(/^https?:\/\//, '');

        let result;
        if (data.id) {
            // Обновление существующего домена
            result = this.storage.updateDomain(data.id, {
                domain: domainName,
                description: data.description,
                tags: data.tags
            });

            if (result) {
                this.emit('notification', { type: 'success', message: 'Домен обновлён' });
            } else {
                this.emit('notification', { type: 'error', message: 'Ошибка обновления домена' });
                return;
            }
        } else {
            // Создание нового домена
            if (this.storage.domainExists(domainName)) {
                this.emit('notification', { type: 'error', message: 'Домен уже существует' });
                return;
            }

            result = this.storage.addDomain({
                domain: domainName,
                description: data.description,
                tags: data.tags
            });

            this.emit('notification', { type: 'success', message: 'Домен добавлен' });
        }

        const domains = this.storage.getAllDomains();
        this.ui.renderDomainList(domains, this.currentDomain ? this.currentDomain.id : null);
        this.ui.updateCounter(domains.length);
        this.ui.hideDomainModal();

        this.emit('domainSaved', result);
    }

    /**
     * Обработка экспорта доменов
     */
    handleDomainsExport() {
        const domains = this.storage.getAllDomains();

        if (domains.length === 0) {
            this.emit('notification', { type: 'error', message: 'Нет доменов для экспорта' });
            return;
        }

        const jsonData = this.storage.exportToJSON();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `keyso_domains_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);

        this.emit('notification', { type: 'success', message: `Экспортировано доменов: ${domains.length}` });
        this.emit('domainsExported', domains.length);
    }

    /**
     * Обработка импорта доменов
     * @param {string} fileData
     */
    handleDomainsImport(fileData) {
        const result = this.storage.importFromJSON(fileData, true);

        if (result.success) {
            const domains = this.storage.getAllDomains();
            this.ui.renderDomainList(domains, this.currentDomain ? this.currentDomain.id : null);
            this.ui.updateCounter(domains.length);

            let message = `Импортировано: ${result.addedCount}`;
            if (result.skippedCount > 0) {
                message += `, пропущено: ${result.skippedCount}`;
            }

            this.emit('notification', { type: 'success', message });
            this.emit('domainsImported', result);
        } else {
            this.emit('notification', { type: 'error', message: 'Ошибка импорта: ' + result.error });
        }
    }

    /**
     * Получение текущего домена
     * @returns {Object|null}
     */
    getCurrentDomain() {
        return this.currentDomain;
    }

    /**
     * Поиск доменов по тегу
     * @param {string} tag
     * @returns {Array}
     */
    findDomainsByTag(tag) {
        const domains = this.storage.findDomainsByTag(tag);
        this.ui.renderDomainList(domains, this.currentDomain ? this.currentDomain.id : null);
        return domains;
    }

    /**
     * Получение всех тегов
     * @returns {Array}
     */
    getAllTags() {
        return this.storage.getAllTags();
    }

    /**
     * Получение статистики
     * @returns {Object}
     */
    getStatistics() {
        return this.storage.getStatistics();
    }

    /**
     * Обработка фильтрации по тегу
     * @param {string} tag
     */
    handleFilterByTag(tag) {
        console.log('DomainManager.handleFilterByTag() - фильтруем по тегу:', tag);
        
        const allDomains = this.storage.getAllDomains();
        const filteredDomains = allDomains.filter(domain => 
            domain.tags && Array.isArray(domain.tags) && domain.tags.includes(tag)
        );
        
        console.log('DomainManager.handleFilterByTag() - найдено доменов:', filteredDomains.length);
        
        this.ui.renderDomainList(filteredDomains);
        this.ui.updateCounter(filteredDomains.length);
        
        // Показываем кнопку "Показать все" при фильтрации
        const showAllBtn = document.getElementById('showAllDomainsBtn');
        if (showAllBtn) {
            showAllBtn.style.display = 'block';
        }
        
        // Показываем уведомление о фильтрации
        this.emit('notification', { 
            type: 'info', 
            message: `Показаны домены с тегом "${tag}" (${filteredDomains.length} из ${allDomains.length})` 
        });
    }

    /**
     * Обработка показа всех доменов (сброс фильтрации)
     */
    handleShowAllDomains() {
        console.log('DomainManager.handleShowAllDomains() - показываем все домены');
        
        const allDomains = this.storage.getAllDomains();
        this.ui.renderDomainList(allDomains);
        this.ui.updateCounter(allDomains.length);
        
        // Скрываем кнопку "Показать все"
        const showAllBtn = document.getElementById('showAllDomainsBtn');
        if (showAllBtn) {
            showAllBtn.style.display = 'none';
        }
        
        // Показываем уведомление
        this.emit('notification', { 
            type: 'info', 
            message: `Показаны все домены (${allDomains.length})` 
        });
    }

    /**
     * Обработка получения всех уникальных тегов
     */
    handleGetAllTags() {
        const allDomains = this.storage.getAllDomains();
        const allTags = new Set();
        
        allDomains.forEach(domain => {
            if (domain.tags && Array.isArray(domain.tags)) {
                domain.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        const uniqueTags = Array.from(allTags).sort();
        this.ui.setAllUniqueTags(uniqueTags);
        
        // Загружаем цвета тегов
        const tagColors = this.storage.getTagColors();
        this.ui.setTagColors(tagColors);
        
        console.log('DomainManager.handleGetAllTags() - найдено уникальных тегов:', uniqueTags.length);
        console.log('DomainManager.handleGetAllTags() - загружено цветов тегов:', Object.keys(tagColors).length);
    }


    /**
     * Обработка удаления доступного тега из всех доменов
     * @param {string} tag
     */
    handleRemoveAvailableTag(tag) {
        console.log('DomainManager.handleRemoveAvailableTag() - удаляем тег из всех доменов:', tag);
        
        const allDomains = this.storage.getAllDomains();
        let removedCount = 0;
        
        allDomains.forEach(domain => {
            if (domain.tags && Array.isArray(domain.tags)) {
                const originalLength = domain.tags.length;
                domain.tags = domain.tags.filter(t => t !== tag);
                if (domain.tags.length < originalLength) {
                    removedCount++;
                }
            }
        });
        
        if (removedCount > 0) {
            this.storage.saveToStorage();
            const domains = this.storage.getAllDomains();
            this.ui.renderDomainList(domains);
            this.ui.updateCounter(domains.length);
            
            // Обновляем модальное окно, если оно открыто
            this.ui.refreshModalTags();
            
            this.emit('notification', { 
                type: 'success', 
                message: `Тег "${tag}" удален из ${removedCount} доменов` 
            });
        } else {
            this.emit('notification', { 
                type: 'info', 
                message: `Тег "${tag}" не найден в доменах` 
            });
        }
    }

    /**
     * Обработка удаления тега из конкретного домена
     * @param {Object} data - { domainId, tag }
     */
    handleRemoveTagFromDomain(data) {
        const { domainId, tag } = data;
        console.log('DomainManager.handleRemoveTagFromDomain() - удаляем тег из домена:', data);
        
        const domain = this.storage.getDomainById(domainId);
        if (!domain) {
            this.emit('notification', { type: 'error', message: 'Домен не найден' });
            return;
        }
        
        if (domain.tags && Array.isArray(domain.tags)) {
            const originalLength = domain.tags.length;
            domain.tags = domain.tags.filter(t => t !== tag);
            
            if (domain.tags.length < originalLength) {
                this.storage.saveToStorage();
                const domains = this.storage.getAllDomains();
                this.ui.renderDomainList(domains);
                this.ui.updateCounter(domains.length);
                
                // Обновляем модальное окно, если оно открыто
                this.ui.refreshModalTags();
                
                this.emit('notification', { 
                    type: 'success', 
                    message: `Тег "${tag}" удален из домена "${domain.domain}"` 
                });
            } else {
                this.emit('notification', { 
                    type: 'info', 
                    message: `Тег "${tag}" не найден в домене` 
                });
            }
        }
    }

    /**
     * Обработка получения доменов с тегом
     * @param {string} tag
     */
    handleGetDomainsWithTag(tag) {
        console.log('DomainManager.handleGetDomainsWithTag() - получаем домены с тегом:', tag);
        
        const allDomains = this.storage.getAllDomains();
        const domainsWithTag = allDomains.filter(domain => 
            domain.tags && Array.isArray(domain.tags) && domain.tags.includes(tag)
        );
        
        this.ui.setDomainsWithTagDetails(domainsWithTag, tag);
    }

    /**
     * Обработка получения информации о домене
     * @param {string} domainId
     */
    handleGetDomainInfo(domainId) {
        console.log('DomainManager.handleGetDomainInfo() - получаем информацию о домене:', domainId);
        
        const domain = this.storage.getDomainById(domainId);
        if (domain) {
            this.ui.updateDomainNameInModal(domain.domain);
        }
    }

    /**
     * Обработка создания нового тега
     * @param {string} tagName
     */
    handleCreateTag(tagName) {
        console.log('DomainManager.handleCreateTag() - создаем новый тег:', tagName);
        
        // Проверяем, не существует ли уже такой тег
        const allDomains = this.storage.getAllDomains();
        const allTags = new Set();
        
        allDomains.forEach(domain => {
            if (domain.tags && Array.isArray(domain.tags)) {
                domain.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        if (allTags.has(tagName)) {
            this.emit('notification', { 
                type: 'info', 
                message: `Тег "${tagName}" уже существует` 
            });
            return;
        }
        
        // Создаем новый тег, добавляя его к первому домену (или создаем пустой домен)
        if (allDomains.length > 0) {
            // Добавляем тег к первому домену
            const firstDomain = allDomains[0];
            if (!firstDomain.tags) {
                firstDomain.tags = [];
            }
            firstDomain.tags.push(tagName);
        } else {
            // Создаем временный домен с тегом
            const tempDomain = {
                id: 'temp-' + Date.now(),
                domain: 'temp.example.com',
                description: 'Временный домен для тега',
                tags: [tagName]
            };
            this.storage.addDomain(tempDomain);
        }
        
        // Сохраняем изменения
        this.storage.saveToStorage();
        
        // Обновляем интерфейс
        const domains = this.storage.getAllDomains();
        this.ui.renderDomainList(domains);
        this.ui.updateCounter(domains.length);
        
        // Обновляем модальное окно управления тегами
        this.ui.renderAllTags();
        
        // Принудительно обновляем список уникальных тегов
        this.ui.refreshAllUniqueTags();
        
        this.emit('notification', { 
            type: 'success', 
            message: `Тег "${tagName}" успешно создан` 
        });
    }

    /**
     * Обработка обновления цвета тега
     * @param {Object} data - { tag, color }
     */
    handleUpdateTagColor(data) {
        const { tag, color } = data;
        console.log('DomainManager.handleUpdateTagColor() - обновляем цвет тега:', data);
        
        // Сохраняем цвет тега в storage
        this.storage.setTagColor(tag, color);
        
        // Обновляем UI
        this.ui.setTagColors(this.storage.getTagColors());
        this.ui.renderAllTags();
        
        this.emit('notification', { 
            type: 'success', 
            message: `Цвет тега "${tag}" обновлен` 
        });
    }

    /**
     * Обработка получения цвета тега
     * @param {string} tag
     */
    handleGetTagColor(tag) {
        console.log('DomainManager.handleGetTagColor() - получаем цвет тега:', tag);
        
        const color = this.storage.getTagColor(tag);
        this.ui.setTagColors(this.storage.getTagColors());
    }

    /**
     * Обработка сохранения пользовательского цвета
     * @param {string} color
     */
    handleSaveCustomColor(color) {
        console.log('DomainManager.handleSaveCustomColor() - сохраняем цвет:', color);
        
        this.storage.saveCustomColor(color);
        this.ui.renderSavedColors(this.storage.getSavedColors());
    }

    /**
     * Обработка получения сохраненных цветов
     */
    handleGetSavedColors() {
        console.log('DomainManager.handleGetSavedColors() - получаем сохраненные цвета');
        
        const colors = this.storage.getSavedColors();
        this.ui.renderSavedColors(colors);
    }

    /**
     * Обработка удаления сохраненного цвета
     * @param {number} index
     */
    handleRemoveSavedColor(index) {
        console.log('DomainManager.handleRemoveSavedColor() - удаляем цвет:', index);
        
        this.storage.removeSavedColor(index);
        this.ui.renderSavedColors(this.storage.getSavedColors());
    }

    /**
     * Обработка очистки всех сохраненных цветов
     */
    handleClearSavedColors() {
        console.log('DomainManager.handleClearSavedColors() - очищаем все сохраненные цвета');
        
        this.storage.clearSavedColors();
        this.ui.renderSavedColors([]);
    }

    /**
     * Обработка поиска доменов
     * @param {Array|string} searchVariants - Массив вариантов поиска или строка
     */
    handleSearchDomains(searchVariants) {
        // Если передана строка, создаем массив
        const variants = Array.isArray(searchVariants) ? searchVariants : [searchVariants];
        
        console.log('DomainManager.handleSearchDomains() - варианты поиска:', variants);
        
        const allDomains = this.storage.getAllDomains();
        const filteredDomains = allDomains.filter(domain => {
            const domainName = domain.domain.toLowerCase();
            const description = (domain.description || '').toLowerCase();
            const tags = (domain.tags || []).join(' ').toLowerCase();
            
            // Проверяем каждый вариант поиска
            return variants.some(searchTerm => {
                return domainName.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       tags.includes(searchTerm);
            });
        });
        
        console.log('DomainManager.handleSearchDomains() - найдено доменов:', filteredDomains.length);
        this.ui.renderDomainList(filteredDomains);
        this.ui.updateCounter(filteredDomains.length);
    }

    /**
     * Обработка загрузки доменов по умолчанию
     * @param {Array} domains
     */
    handleLoadDefaultDomains(domains) {
        console.log('DomainManager.handleLoadDefaultDomains() - загружаем домены по умолчанию:', domains.length);
        
        // Очищаем текущие домены
        this.storage.clearAll();
        
        // Добавляем домены по умолчанию
        domains.forEach(domain => {
            this.storage.addDomain(domain);
        });
        
        // Обновляем UI
        const allDomains = this.storage.getAllDomains();
        this.ui.renderDomainList(allDomains);
        this.ui.updateCounter(allDomains.length);
        
        console.log('✅ Домены по умолчанию загружены:', allDomains.length);
    }

    /**
     * Обработка синхронизации данных
     */
    handleSyncData() {
        console.log('DomainManager.handleSyncData() - синхронизируем данные');
        
        // Показываем инструкции для синхронизации
        this.emit('notification', { 
            type: 'info', 
            message: 'Для синхронизации данных между пользователями:\n1. Экспортируй свои домены (кнопка ⬇️)\n2. Отправь файл руководителю\n3. Руководитель импортирует домены (кнопка ⬆️)',
            duration: 10000
        });
    }

    /**
     * Сброс текущего выбранного домена
     */
    clearSelection() {
        this.currentDomain = null;
        this.ui.renderDomainList(this.storage.getAllDomains());
    }

}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainManager;
}