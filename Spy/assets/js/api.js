/**
 * API Module - Работа с Keys.so API
 * Файл: /assets/js/api.js
 */

class KeysAPI {
    constructor(proxyUrl = 'keys_proxy.php') {
        // Используем GET-прокси с параметром endpoint, совместимо с OpenAPI
        this.proxyUrl = proxyUrl;
        this.isChecking = false;
        this.isAvailable = false;
    }

    /**
     * Проверка доступности API
     * @returns {Promise<boolean>}
     */
    async checkAPIStatus() {
        if (this.isChecking) return this.isAvailable;
        this.isChecking = true;
        try {
            const data = await this.makeGet('/report/simple/domain_dashboard', {
                domain: 'yandex.ru',
                base: 'msk'
            });
            this.isAvailable = !!data;
            return this.isAvailable;
        } catch (error) {
            this.isAvailable = false;
            console.error('API недоступен:', error);
            return false;
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * Базовый метод для выполнения GET запросов к API (совместимость)
     * @param {string} endpoint
     * @param {Object} params
     * @returns {Promise<Object>}
     */
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

    /**
     * Базовый метод для выполнения POST запросов к API (правильный формат)
     * @param {string} action
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async makePost(action, data = {}) {
        try {
            const requestData = {
                action: action,
                ...data
            };
            
            console.log('Отправляем POST запрос:', {
                url: this.proxyUrl,
                action: action,
                data: data
            });
            
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
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

    /**
     * Получение дашборда домена (обзор)
     * @param {string} domain
     * @param {string} region
     * @returns {Promise<Object>}
     */
    async getDomainDashboard(domain, region = 'msk') {
        // Очищаем домен от протокола и слэшей
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        return await this.makeGet('/report/simple/domain_dashboard', {
            domain: cleanDomain,
            base: region
        });
    }

    /**
     * Получение органических ключевых слов
     * @param {string} domain
     * @param {string} region
     * @param {number} perPage
     * @returns {Promise<Object>}
     */
    async getOrganicKeywords(domain, region = 'msk', perPage = 100) {
        // Очищаем домен от протокола и слэшей
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        // Ограничиваем per_page максимумом 500 (лимит API)
        const limitedPerPage = Math.min(perPage, 500);
        
        return await this.makeGet('/report/simple/organic/keywords', {
            domain: cleanDomain,
            base: region,
            per_page: limitedPerPage
        });
    }

    /**
     * Получение страниц сайта
     * @param {string} domain
     * @param {string} region
     * @param {number} perPage
     * @returns {Promise<Object>}
     */
    async getSitePages(domain, region = 'msk', perPage = 100) {
        // Очищаем домен от протокола и слэшей
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        // Ограничиваем per_page максимумом 500 (лимит API)
        const limitedPerPage = Math.min(perPage, 500);
        
        return await this.makeGet('/report/simple/organic/sitepages', {
            domain: cleanDomain,
            base: region,
            per_page: limitedPerPage
        });
    }

    /**
     * Получение контекстной рекламы
     * @param {string} domain
     * @param {string} region
     * @param {number} perPage
     * @returns {Promise<Object>}
     */
    async getContextAds(domain, region = 'msk', perPage = 50) {
        // Очищаем домен от протокола и слэшей
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        // Ограничиваем per_page максимумом 500 (лимит API)
        const limitedPerPage = Math.min(perPage, 500);
        
        return await this.makeGet('/report/simple/context/ads', {
            domain: cleanDomain,
            base: region,
            per_page: limitedPerPage
        });
    }

    /**
     * Получение конкурентов
     * @param {string} domain
     * @param {string} region
     * @param {number} perPage
     * @returns {Promise<Object>}
     */
    async getCompetitors(domain, region = 'msk', perPage = 50) {
        // Очищаем домен от протокола и слэшей
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        // Ограничиваем per_page максимумом 500 (лимит API)
        const limitedPerPage = Math.min(perPage, 500);
        
        return await this.makeGet('/report/simple/organic/concurents', {
            domain: cleanDomain,
            base: region,
            per_page: limitedPerPage
        });
    }

    /**
     * Загрузка всех данных для домена
     * @param {string} domain
     * @param {string} region
     * @returns {Promise<Object>}
     */
    async getAllDomainData(domain, region = 'msk') {
        try {
            const [dashboard, keywords, pages, ads, competitors] = await Promise.all([
                this.getDomainDashboard(domain, region),
                this.getOrganicKeywords(domain, region),
                this.getSitePages(domain, region),
                this.getContextAds(domain, region),
                this.getCompetitors(domain, region)
            ]);

            return {
                overview: dashboard,
                keywords: keywords.data || [],
                pages: pages.data || [],
                ads: ads.data || [],
                competitors: competitors.data || []
            };
        } catch (error) {
            console.error('Ошибка загрузки всех данных:', error);
            throw error;
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeysAPI;
}