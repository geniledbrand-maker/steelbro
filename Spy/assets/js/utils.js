/**
 * Utils - Вспомогательные функции
 * Файл: /assets/js/utils.js
 */

class Utils {
    /**
     * Форматирование числа с разделителями тысяч
     * @param {number} num
     * @param {string} locale
     * @returns {string}
     */
    static formatNumber(num, locale = 'ru-RU') {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return num.toLocaleString(locale);
    }

    /**
     * Форматирование размера файла
     * @param {number} bytes
     * @returns {string}
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Форматирование времени
     * @param {Date|string|number} date
     * @param {string} locale
     * @returns {string}
     */
    static formatDate(date, locale = 'ru-RU') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Неверная дата';
        
        return d.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Форматирование относительного времени
     * @param {Date|string|number} date
     * @returns {string}
     */
    static formatRelativeTime(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Неверная дата';
        
        const now = new Date();
        const diff = now - d;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        
        return this.formatDate(d);
    }

    /**
     * Очистка домена от протокола и www
     * @param {string} domain
     * @returns {string}
     */
    static cleanDomain(domain) {
        if (typeof domain !== 'string') return '';
        
        return domain
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .toLowerCase()
            .trim();
    }

    /**
     * Валидация домена
     * @param {string} domain
     * @returns {boolean}
     */
    static isValidDomain(domain) {
        if (typeof domain !== 'string') return false;
        
        const cleanDomain = this.cleanDomain(domain);
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        return domainRegex.test(cleanDomain) && cleanDomain.length > 0;
    }

    /**
     * Генерация случайного ID
     * @param {number} length
     * @returns {string}
     */
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    /**
     * Глубокое клонирование объекта
     * @param {*} obj
     * @returns {*}
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        return obj;
    }

    /**
     * Дебаунс функции
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Троттлинг функции
     * @param {Function} func
     * @param {number} limit
     * @returns {Function}
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Копирование текста в буфер обмена
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (err) {
            console.error('Ошибка копирования в буфер обмена:', err);
            return false;
        }
    }

    /**
     * Скачивание файла
     * @param {string} content
     * @param {string} filename
     * @param {string} mimeType
     */
    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Скачивание JSON файла
     * @param {Object} data
     * @param {string} filename
     */
    static downloadJSON(data, filename) {
        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, filename, 'application/json');
    }

    /**
     * Скачивание CSV файла
     * @param {Array} data
     * @param {string} filename
     * @param {Array} headers
     */
    static downloadCSV(data, filename, headers = null) {
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
        this.downloadFile(content, filename, 'text/csv;charset=utf-8');
    }

    /**
     * Получение класса для позиции в поиске
     * @param {number} position
     * @returns {string}
     */
    static getPositionBadgeClass(position) {
        if (typeof position !== 'number') return 'pos-top50';
        if (position <= 3) return 'pos-top3';
        if (position <= 10) return 'pos-top10';
        return 'pos-top50';
    }

    /**
     * Экранирование HTML
     * @param {string} text
     * @returns {string}
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Проверка поддержки localStorage
     * @returns {boolean}
     */
    static isLocalStorageSupported() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Безопасное получение данных из localStorage
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    static getFromStorage(key, defaultValue = null) {
        if (!this.isLocalStorageSupported()) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Ошибка чтения из localStorage:', e);
            return defaultValue;
        }
    }

    /**
     * Безопасное сохранение данных в localStorage
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    static saveToStorage(key, value) {
        if (!this.isLocalStorageSupported()) return false;
        
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
            return false;
        }
    }

    /**
     * Удаление данных из localStorage
     * @param {string} key
     * @returns {boolean}
     */
    static removeFromStorage(key) {
        if (!this.isLocalStorageSupported()) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Ошибка удаления из localStorage:', e);
            return false;
        }
    }

    /**
     * Очистка всех данных из localStorage
     * @returns {boolean}
     */
    static clearStorage() {
        if (!this.isLocalStorageSupported()) return false;
        
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Ошибка очистки localStorage:', e);
            return false;
        }
    }

    /**
     * Получение размера localStorage
     * @returns {number}
     */
    static getStorageSize() {
        if (!this.isLocalStorageSupported()) return 0;
        
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Проверка, является ли строка URL
     * @param {string} str
     * @returns {boolean}
     */
    static isURL(str) {
        if (typeof str !== 'string') return false;
        
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Извлечение домена из URL
     * @param {string} url
     * @returns {string|null}
     */
    static extractDomainFromURL(url) {
        if (!this.isURL(url)) return null;
        
        try {
            const urlObj = new URL(url);
            return this.cleanDomain(urlObj.hostname);
        } catch {
            return null;
        }
    }

    /**
     * Группировка массива по ключу
     * @param {Array} array
     * @param {string|Function} key
     * @returns {Object}
     */
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    }

    /**
     * Сортировка массива объектов по ключу
     * @param {Array} array
     * @param {string} key
     * @param {string} direction
     * @returns {Array}
     */
    static sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Уникальные значения в массиве
     * @param {Array} array
     * @returns {Array}
     */
    static unique(array) {
        return [...new Set(array)];
    }

    /**
     * Задержка выполнения
     * @param {number} ms
     * @returns {Promise}
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Проверка, является ли значение пустым
     * @param {*} value
     * @returns {boolean}
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Получение вложенного значения из объекта
     * @param {Object} obj
     * @param {string} path
     * @param {*} defaultValue
     * @returns {*}
     */
    static getNestedValue(obj, path, defaultValue = undefined) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : defaultValue;
        }, obj);
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
