/**
 * DomainStorage - Работа с хранилищем доменов
 * Файл: /classes/DomainManager/DomainStorage.js
 */

class DomainStorage {
    constructor(storageKey = 'keyso_saved_domains') {
        this.storageKey = storageKey;
        this.domains = [];
        this.tagColors = {};
        this.savedColors = [];
        this.loadFromStorage();
        
        // Пытаемся загрузить данные из JSON файлов
        this.loadFromJsonFiles().catch(error => {
            console.warn('⚠️ Не удалось загрузить данные из JSON файлов, используем localStorage:', error);
        });
    }

    /**
     * Загрузка доменов из localStorage
     * @returns {Array}
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.domains = JSON.parse(stored);
            }
            
            // Загружаем цвета тегов
            const storedTagColors = localStorage.getItem(this.storageKey + '_tagColors');
            if (storedTagColors) {
                this.tagColors = JSON.parse(storedTagColors);
            }
            
            // Загружаем пользовательские цвета
            const storedSavedColors = localStorage.getItem(this.storageKey + '_savedColors');
            if (storedSavedColors) {
                this.savedColors = JSON.parse(storedSavedColors);
            }
            
            return this.domains;
        } catch (error) {
            console.error('Ошибка загрузки доменов из storage:', error);
            this.domains = [];
            this.tagColors = {};
            this.savedColors = [];
        }
        return [];
    }

    /**
     * Сохранение доменов в localStorage
     * @returns {boolean}
     */
    saveToStorage() {
        try {
            // Сохраняем домены
            localStorage.setItem(this.storageKey, JSON.stringify(this.domains));
            
            // Сохраняем цвета тегов
            if (this.tagColors && Object.keys(this.tagColors).length > 0) {
                localStorage.setItem(this.storageKey + '_tagColors', JSON.stringify(this.tagColors));
            }
            
            // Сохраняем пользовательские цвета
            if (this.savedColors && this.savedColors.length > 0) {
                localStorage.setItem(this.storageKey + '_savedColors', JSON.stringify(this.savedColors));
            }
            
            // Автоматически сохраняем в JSON файлы
            this.saveToJsonFiles();
            
            return true;
        } catch (error) {
            console.error('Ошибка сохранения доменов в storage:', error);
            return false;
        }
    }

    /**
     * Сохранение данных в JSON файлы через API
     * @returns {Promise<boolean>}
     */
    async saveToJsonFiles() {
        try {
            console.log('💾 Сохраняем данные в JSON файлы...');
            
            const response = await fetch('/data/domains_api.php?action=save_all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domains: this.domains,
                    tagColors: this.tagColors,
                    savedColors: this.savedColors
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Данные успешно сохранены в JSON файлы');
                return true;
            } else {
                console.error('❌ Ошибка сохранения в JSON файлы:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка при сохранении в JSON файлы:', error);
            return false;
        }
    }

    /**
     * Загрузка данных из JSON файлов
     * @returns {Promise<boolean>}
     */
    async loadFromJsonFiles() {
        try {
            console.log('📂 Загружаем данные...');
            
            // Сначала проверяем localStorage
            const hasLocalData = localStorage.getItem(this.storageKey) !== null;
            if (hasLocalData) {
                console.log('📊 Используем данные из localStorage');
                return true;
            }
            
            // Если нет данных в localStorage, пытаемся загрузить из API
            try {
                const response = await fetch('./data/domains_api.php?action=all');
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                // Проверяем тип контента
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Сервер вернул не JSON контент');
                }
                
                const result = await response.json();
                
                if (result.success) {
                    const data = result.data;
                    
                    // Загружаем домены
                    if (data.domains && Array.isArray(data.domains)) {
                        this.domains = data.domains;
                        console.log('📊 Загружено доменов из JSON:', data.domains.length);
                    }
                    
                    // Загружаем цвета тегов
                    if (data.tagColors && typeof data.tagColors === 'object') {
                        this.tagColors = data.tagColors;
                        console.log('🎨 Загружено цветов тегов из JSON:', Object.keys(data.tagColors).length);
                    }
                    
                    // Загружаем сохраненные цвета
                    if (data.savedColors && Array.isArray(data.savedColors)) {
                        this.savedColors = data.savedColors;
                        console.log('💾 Загружено сохраненных цветов из JSON:', data.savedColors.length);
                    }
                    
                    // Синхронизируем с localStorage
                    this.syncToLocalStorage();
                    
                    console.log('✅ Данные успешно загружены из JSON файлов');
                    return true;
                } else {
                    console.warn('⚠️ API вернул ошибку:', result.error);
                    return this.loadFromLocalStorageFallback();
                }
            } catch (fetchError) {
                console.warn('⚠️ Не удалось загрузить данные из API, пробуем localStorage:', fetchError.message);
                return this.loadFromLocalStorageFallback();
            }
        } catch (error) {
            console.error('❌ Ошибка при загрузке из JSON файлов:', error);
            return false;
        }
    }

    /**
     * Загрузка из localStorage как fallback
     * @returns {boolean}
     */
    loadFromLocalStorageFallback() {
        try {
            console.log('📂 Загружаем данные из localStorage как fallback...');
            
            // Проверяем, есть ли данные в localStorage
            const hasLocalData = localStorage.getItem(this.storageKey) !== null;
            if (hasLocalData) {
                console.log('📊 Используем данные из localStorage');
                return true;
            }
            
            // Если нет данных в localStorage, пробуем загрузить домены по умолчанию
            console.log('📂 Загружаем домены по умолчанию...');
            return this.loadDefaultDomainsFallback();
        } catch (error) {
            console.error('❌ Ошибка загрузки из localStorage:', error);
            return false;
        }
    }

    /**
     * Загрузка доменов по умолчанию как fallback
     * @returns {boolean}
     */
    async loadDefaultDomainsFallback() {
        try {
            const defaultResponse = await fetch('./data/default_domains.json');
            if (defaultResponse.ok) {
                const defaultDomains = await defaultResponse.json();
                if (Array.isArray(defaultDomains)) {
                    this.domains = defaultDomains;
                    this.syncToLocalStorage();
                    console.log('📊 Загружены домены по умолчанию:', defaultDomains.length);
                    return true;
                }
            }
        } catch (defaultError) {
            console.warn('⚠️ Не удалось загрузить домены по умолчанию:', defaultError.message);
        }
        
        return false;
    }

    /**
     * Синхронизация данных с localStorage
     */
    syncToLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.domains));
            localStorage.setItem(this.storageKey + '_tagColors', JSON.stringify(this.tagColors));
            localStorage.setItem(this.storageKey + '_savedColors', JSON.stringify(this.savedColors));
            console.log('🔄 Данные синхронизированы с localStorage');
        } catch (error) {
            console.error('❌ Ошибка синхронизации с localStorage:', error);
        }
    }

    /**
     * Получение всех доменов
     * @returns {Array}
     */
    getAllDomains() {
        return [...this.domains];
    }

    /**
     * Получение домена по ID
     * @param {string} id
     * @returns {Object|null}
     */
    getDomainById(id) {
        return this.domains.find(domain => domain.id === id) || null;
    }

    /**
     * Получение домена по имени
     * @param {string} domainName
     * @returns {Object|null}
     */
    getDomainByName(domainName) {
        return this.domains.find(domain => domain.domain === domainName) || null;
    }

    /**
     * Добавление нового домена
     * @param {Object} domainData
     * @returns {Object}
     */
    addDomain(domainData) {
        const newDomain = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            domain: domainData.domain,
            description: domainData.description || '',
            tags: domainData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.domains.unshift(newDomain);
        
        // Сохраняем в localStorage (API не работает без веб-сервера)
        this.saveToStorage();

        return newDomain;
    }

    /**
     * Сохранение данных в JSON файл через API
     * @returns {Promise<boolean>}
     */
    async saveToJsonFile() {
        try {
            console.log('💾 Сохраняем данные в JSON файл...');
            
            const data = {
                domains: this.domains,
                tagColors: this.tagColors,
                savedColors: this.savedColors
            };
            
            const response = await fetch('./data/domains_api.php?action=save_all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Данные успешно сохранены в JSON файл');
                return true;
            } else {
                console.error('❌ Ошибка сохранения в JSON файл:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения в JSON файл:', error);
            return false;
        }
    }

    /**
     * Обновление существующего домена
     * @param {string} id
     * @param {Object} updates
     * @returns {Object|null}
     */
    updateDomain(id, updates) {
        const index = this.domains.findIndex(domain => domain.id === id);

        if (index === -1) {
            console.warn('Домен не найден:', id);
            return null;
        }

        this.domains[index] = {
            ...this.domains[index],
            domain: updates.domain || this.domains[index].domain,
            description: updates.description !== undefined ? updates.description : this.domains[index].description,
            tags: updates.tags !== undefined ? updates.tags : this.domains[index].tags,
            updatedAt: new Date().toISOString()
        };

        // Сохраняем в localStorage (API не работает без веб-сервера)
        this.saveToStorage();
        
        return this.domains[index];
    }

    /**
     * Удаление домена
     * @param {string} id
     * @returns {boolean}
     */
    deleteDomain(id) {
        const initialLength = this.domains.length;
        this.domains = this.domains.filter(domain => domain.id !== id);

        if (this.domains.length < initialLength) {
            // Сохраняем в localStorage (API не работает без веб-сервера)
            this.saveToStorage();
            
            return true;
        }

        return false;
    }

    /**
     * Проверка существования домена
     * @param {string} domainName
     * @returns {boolean}
     */
    domainExists(domainName) {
        return this.domains.some(domain => domain.domain === domainName);
    }

    /**
     * Поиск доменов по тегу
     * @param {string} tag
     * @returns {Array}
     */
    findDomainsByTag(tag) {
        return this.domains.filter(domain =>
            domain.tags && domain.tags.includes(tag)
        );
    }

    /**
     * Получение всех уникальных тегов
     * @returns {Array}
     */
    getAllTags() {
        const tagsSet = new Set();
        this.domains.forEach(domain => {
            if (domain.tags) {
                domain.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet).sort();
    }

    /**
     * Экспорт доменов в JSON
     * @returns {string}
     */
    exportToJSON() {
        return JSON.stringify(this.domains, null, 2);
    }

    /**
     * Импорт доменов из JSON
     * @param {string} jsonData
     * @param {boolean} merge - если true, объединяет с существующими
     * @returns {Object} результат импорта
     */
    importFromJSON(jsonData, merge = true) {
        try {
            const importedDomains = JSON.parse(jsonData);

            if (!Array.isArray(importedDomains)) {
                throw new Error('Неверный формат данных. Ожидается массив доменов.');
            }

            let addedCount = 0;
            let skippedCount = 0;

            importedDomains.forEach(domain => {
                if (!this.domainExists(domain.domain)) {
                    const newDomain = {
                        ...domain,
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        updatedAt: new Date().toISOString()
                    };

                    if (merge) {
                        this.domains.push(newDomain);
                    } else {
                        this.domains = [newDomain];
                    }

                    addedCount++;
                } else {
                    skippedCount++;
                }
            });

            if (!merge && importedDomains.length > 0) {
                this.domains = importedDomains.map(domain => ({
                    ...domain,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    updatedAt: new Date().toISOString()
                }));
                addedCount = importedDomains.length;
                skippedCount = 0;
            }

            this.saveToStorage();

            return {
                success: true,
                addedCount,
                skippedCount,
                totalDomains: this.domains.length
            };
        } catch (error) {
            console.error('Ошибка импорта:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Очистка всех доменов
     * @returns {boolean}
     */
    clearAll() {
        this.domains = [];
        return this.saveToStorage();
    }

    /**
     * Добавление тестовых доменов с тегами для демонстрации
     */
    addTestDomainsWithTags() {
        const testDomains = [
            {
                id: 'test-1',
                domain: 'dns-shop.ru',
                description: 'Интернет-магазин электроники',
                tags: ['электроника', 'e-commerce', 'конкуренты'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'test-2',
                domain: 'ozon.ru',
                description: 'Маркетплейс товаров',
                tags: ['маркетплейс', 'e-commerce', 'онлайн-торговля'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'test-3',
                domain: 'wildberries.ru',
                description: 'Интернет-магазин одежды и товаров',
                tags: ['одежда', 'e-commerce', 'конкуренты'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'test-4',
                domain: 'yandex.ru',
                description: 'Поисковая система и сервисы',
                tags: ['поиск', 'технологии', 'IT'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'test-5',
                domain: 'mail.ru',
                description: 'Почтовый сервис и портал',
                tags: ['почта', 'портал', 'IT'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        // Добавляем только если их еще нет
        testDomains.forEach(testDomain => {
            if (!this.domains.find(d => d.id === testDomain.id)) {
                this.domains.push(testDomain);
            }
        });

        this.saveToStorage();
        console.log('Добавлены тестовые домены с тегами:', testDomains.length);
        return testDomains.length;
    }

    /**
     * Получение статистики
     * @returns {Object}
     */
    getStatistics() {
        return {
            totalDomains: this.domains.length,
            totalTags: this.getAllTags().length,
            domainsWithDescription: this.domains.filter(d => d.description).length,
            domainsWithTags: this.domains.filter(d => d.tags && d.tags.length > 0).length
        };
    }

    /**
     * Установка цвета тега
     * @param {string} tag
     * @param {string} color
     */
    setTagColor(tag, color) {
        if (!this.tagColors) {
            this.tagColors = {};
        }
        this.tagColors[tag] = color;
        
        // Сохраняем в localStorage (API не работает без веб-сервера)
        this.saveToStorage();
    }

    /**
     * Получение цвета тега
     * @param {string} tag
     * @returns {string}
     */
    getTagColor(tag) {
        return this.tagColors && this.tagColors[tag] ? this.tagColors[tag] : null;
    }

    /**
     * Получение всех цветов тегов
     * @returns {Object}
     */
    getTagColors() {
        return this.tagColors || {};
    }

    /**
     * Сохранение пользовательского цвета
     * @param {string} color
     */
    saveCustomColor(color) {
        if (!this.savedColors) {
            this.savedColors = [];
        }
        
        // Проверяем, не существует ли уже такой цвет
        if (!this.savedColors.includes(color)) {
            this.savedColors.push(color);
            
            // Сохраняем в localStorage (API не работает без веб-сервера)
            this.saveToStorage();
        }
    }

    /**
     * Получение сохраненных цветов
     * @returns {Array}
     */
    getSavedColors() {
        return this.savedColors || [];
    }

    /**
     * Удаление сохраненного цвета по индексу
     * @param {number} index
     */
    removeSavedColor(index) {
        if (this.savedColors && this.savedColors.length > index) {
            this.savedColors.splice(index, 1);
            
            // Сохраняем в localStorage (API не работает без веб-сервера)
            this.saveToStorage();
        }
    }

    /**
     * Очистка всех сохраненных цветов
     */
    clearSavedColors() {
        this.savedColors = [];
        
        // Сохраняем в localStorage (API не работает без веб-сервера)
        this.saveToStorage();
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainStorage;
}