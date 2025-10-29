/**
 * OverviewTab - Вкладка обзора
 * Файл: /classes/Overview/OverviewTab.js
 * Требует: Utils, API
 */

class OverviewTab {
    constructor() {
        this.containerId = 'overviewContent';
        this.data = null;
        this.isLoaded = false;
        this.eventHandlers = {};
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
     * Рендеринг вкладки
     * @param {Object} data - Данные для отображения
     */
    render(data = null) {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Контейнер ${this.containerId} не найден`);
            return;
        }

        if (data) {
            this.data = data;
            this.isLoaded = true;
        }

        if (!this.data) {
            container.innerHTML = this.generateLoadingHTML();
            return;
        }

        container.innerHTML = this.generateHTML();
        this.attachEventListeners();
    }

    /**
     * Генерация HTML для загрузки
     * @returns {string}
     */
    generateLoadingHTML() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>⏳ Загрузка данных...</p>
            </div>
        `;
    }

    /**
     * Генерация HTML
     * @returns {string}
     */
    generateHTML() {
        if (!this.data) {
            return '<div class="error">Нет данных для отображения</div>';
        }

        const stats = this.generateStatsCards();
        const topKeywords = this.generateTopKeywords();
        const loadAllButton = this.generateLoadAllButton();

        return `
            <div class="overview-content">
                ${stats}
                ${topKeywords}
                ${loadAllButton}
            </div>
        `;
    }

    /**
     * Генерация карточек статистики
     * @returns {string}
     */
    generateStatsCards() {
        const stats = [
            {
                title: 'Позиций в топ-10',
                value: this.data.it10 || 0,
                icon: '🏆',
                color: 'success'
            },
            {
                title: 'Позиций в топ-50',
                value: this.data.it50 || 0,
                icon: '📊',
                color: 'info'
            },
            {
                title: 'Видимость',
                value: this.data.vis || 0,
                icon: '👁️',
                color: 'primary'
            },
            {
                title: 'Объявлений',
                value: this.data.adscnt || 0,
                icon: '💰',
                color: 'warning'
            },
            {
                title: 'Рекламных запросов',
                value: this.data.adkeyscnt || 0,
                icon: '🔑',
                color: 'secondary'
            },
            {
                title: 'Бюджет на рекламу',
                value: this.data.adcost || 0,
                icon: '💸',
                color: 'danger',
                suffix: ' ₽'
            }
        ];

        return `
            <div class="stats-grid">
                ${stats.map(stat => `
                    <div class="stat-card stat-card-${stat.color}">
                        <div class="stat-icon">${stat.icon}</div>
                        <div class="stat-content">
                            <h3 class="stat-value">${typeof Utils !== 'undefined' ? Utils.formatNumber(stat.value) : stat.value.toLocaleString()}${stat.suffix || ''}</h3>
                            <p class="stat-title">${stat.title}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Генерация топ ключевых слов
     * @returns {string}
     */
    generateTopKeywords() {
        const keywords = (this.data.keys || []).slice(0, 10);
        
        if (!keywords.length) {
            return `
                <div class="section">
                    <h2>🔑 Топ ключевые слова</h2>
                    <div class="empty-state">
                        <p>Нет данных о ключевых словах</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="section">
                <h2>🔑 Топ ключевые слова</h2>
                <div class="table-container">
                    <table class="keywords-table">
                        <thead>
                            <tr>
                                <th>Запрос</th>
                                <th>Частотность</th>
                                <th>Позиция</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${keywords.map(keyword => `
                                <tr>
                                    <td class="keyword-cell">
                                        <span class="keyword">${typeof Utils !== 'undefined' ? Utils.escapeHtml(keyword.word) : keyword.word}</span>
                                    </td>
                                    <td class="metric-cell">
                                        <span class="metric">${typeof Utils !== 'undefined' ? Utils.formatNumber(keyword.ws || 0) : (keyword.ws || 0).toLocaleString()}</span>
                                    </td>
                                    <td class="position-cell">
                                        <span class="pos-badge ${typeof Utils !== 'undefined' ? Utils.getPositionBadgeClass(keyword.pos) : this.getPositionBadgeClass(keyword.pos)}">
                                            ${keyword.pos || '-'}
                                        </span>
                                    </td>
                                    <td class="url-cell">
                                        <span class="url" title="${typeof Utils !== 'undefined' ? Utils.escapeHtml(keyword.url || '') : keyword.url || ''}">
                                            ${this.truncateUrl(keyword.url)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Генерация кнопки загрузки всех данных
     * @returns {string}
     */
    generateLoadAllButton() {
        return `
            <div class="section">
                <div class="load-all-container">
                    <button class="load-all-btn" id="loadAllDataBtn">
                        <span class="btn-icon">🔥</span>
                        <span class="btn-text">Загрузить ВСЕ данные</span>
                        <span class="btn-description">Ключевые слова, страницы, реклама, конкуренты</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Получение класса для позиции в поиске
     * @param {number} position
     * @returns {string}
     */
    getPositionBadgeClass(position) {
        if (typeof position !== 'number') return 'pos-top50';
        if (position <= 3) return 'pos-top3';
        if (position <= 10) return 'pos-top10';
        return 'pos-top50';
    }

    /**
     * Обрезка URL для отображения
     * @param {string} url
     * @param {number} maxLength
     * @returns {string}
     */
    truncateUrl(url, maxLength = 50) {
        if (!url) return '-';
        
        if (url.length <= maxLength) {
            return typeof Utils !== 'undefined' ? Utils.escapeHtml(url) : url;
        }
        
        const truncated = url.substring(0, maxLength - 3) + '...';
        return typeof Utils !== 'undefined' ? Utils.escapeHtml(truncated) : truncated;
    }

    /**
     * Прикрепление обработчиков событий
     */
    attachEventListeners() {
        const loadAllBtn = document.getElementById('loadAllDataBtn');
        if (loadAllBtn) {
            loadAllBtn.addEventListener('click', () => {
                this.handleLoadAllData();
            });
        }

        // Обработчики для клика по ключевым словам
        const keywordCells = document.querySelectorAll('.keyword-cell');
        keywordCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const keyword = e.target.textContent.trim();
                this.handleKeywordClick(keyword);
            });
        });
    }

    /**
     * Обработка загрузки всех данных
     */
    handleLoadAllData() {
        const btn = document.getElementById('loadAllDataBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `
                <span class="btn-icon">⏳</span>
                <span class="btn-text">Загружаем...</span>
            `;
        }

        this.emit('loadAllData');
    }

    /**
     * Обработка клика по ключевому слову
     * @param {string} keyword
     */
    handleKeywordClick(keyword) {
        this.emit('keywordClick', keyword);
    }

    /**
     * Обновление данных
     * @param {Object} data
     */
    updateData(data) {
        this.data = data;
        this.isLoaded = true;
        this.render();
    }

    /**
     * Сброс состояния
     */
    reset() {
        this.data = null;
        this.isLoaded = false;
        this.render();
    }

    /**
     * Получение текущих данных
     * @returns {Object|null}
     */
    getData() {
        return this.data;
    }

    /**
     * Проверка, загружены ли данные
     * @returns {boolean}
     */
    isDataLoaded() {
        return this.isLoaded;
    }

    /**
     * Получение статистики
     * @returns {Object}
     */
    getStats() {
        if (!this.data) {
            return {
                top10: 0,
                top50: 0,
                visibility: 0,
                adsCount: 0,
                adKeysCount: 0,
                adCost: 0,
                keywordsCount: 0
            };
        }

        return {
            top10: this.data.it10 || 0,
            top50: this.data.it50 || 0,
            visibility: this.data.vis || 0,
            adsCount: this.data.adscnt || 0,
            adKeysCount: this.data.adkeyscnt || 0,
            adCost: this.data.adcost || 0,
            keywordsCount: (this.data.keys || []).length
        };
    }

    /**
     * Экспорт данных в CSV
     * @param {string} filename
     */
    exportToCSV(filename = 'overview.csv') {
        if (!this.data) {
            console.error('Нет данных для экспорта');
            return;
        }

        const keywords = this.data.keys || [];
        const headers = ['Запрос', 'Частотность', 'Позиция', 'URL'];
        
        if (typeof Utils !== 'undefined') {
            Utils.downloadCSV(keywords, filename, headers);
        } else {
            this.downloadCSV(keywords, filename, headers);
        }
    }

    /**
     * Экспорт данных в JSON
     * @param {string} filename
     */
    exportToJSON(filename = 'overview.json') {
        if (!this.data) {
            console.error('Нет данных для экспорта');
            return;
        }

        if (typeof Utils !== 'undefined') {
            Utils.downloadJSON(this.data, filename);
        } else {
            this.downloadJSON(this.data, filename);
        }
    }

    /**
     * Скачивание CSV файла
     * @param {Array} data
     * @param {string} filename
     * @param {Array} headers
     */
    downloadCSV(data, filename, headers = null) {
        if (!Array.isArray(data) || data.length === 0) {
            console.error('Нет данных для экспорта в CSV');
            return;
        }

        let csv = '';
        
        // Заголовки
        if (headers) {
            csv += headers.map(h => `"${h}"`).join(',') + '\n';
        } else {
            const firstRow = data[0];
            csv += Object.keys(firstRow).map(key => `"${key}"`).join(',') + '\n';
        }

        // Данные
        data.forEach(row => {
            const values = headers ? 
                headers.map(h => row[h] || '') : 
                Object.values(row);
            
            csv += values.map(value => {
                const str = String(value || '');
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',') + '\n';
        });

        // Добавляем BOM для корректного отображения кириллицы в Excel
        const content = '\uFEFF' + csv;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Скачивание JSON файла
     * @param {Object} data
     * @param {string} filename
     */
    downloadJSON(data, filename) {
        const content = JSON.stringify(data, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.data = null;
        this.isLoaded = false;
        this.eventHandlers = {};
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OverviewTab;
}
