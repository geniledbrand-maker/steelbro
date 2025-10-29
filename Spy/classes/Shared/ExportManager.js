/**
 * ExportManager - Управление экспортом данных в различные форматы
 * Файл: /classes/Shared/ExportManager.js
 */

class ExportManager {
    constructor() {
        this.dataCache = {
            keywords: null,
            pages: null,
            ads: null,
            competitors: null
        };
    }

    /**
     * Установка данных для экспорта
     * @param {string} dataType
     * @param {Array} data
     */
    setData(dataType, data) {
        if (this.dataCache.hasOwnProperty(dataType)) {
            this.dataCache[dataType] = data;
        } else {
            console.warn(`Неизвестный тип данных: ${dataType}`);
        }
    }

    /**
     * Экспорт данных в CSV
     * @param {string} dataType
     * @param {string} filename
     * @returns {boolean}
     */
    exportToCSV(dataType, filename = null) {
        const data = this.dataCache[dataType];

        if (!data || !data.length) {
            console.warn(`Нет данных для экспорта: ${dataType}`);
            return false;
        }

        const csv = this.generateCSV(dataType, data);
        const defaultFilename = filename || `${dataType}_${new Date().toISOString().split('T')[0]}.csv`;

        this.downloadFile(csv, defaultFilename, 'text/csv;charset=utf-8;');
        return true;
    }

    /**
     * Генерация CSV из данных
     * @param {string} dataType
     * @param {Array} data
     * @returns {string}
     */
    generateCSV(dataType, data) {
        let csv = '';

        switch (dataType) {
            case 'keywords':
                csv = this.generateKeywordsCSV(data);
                break;
            case 'pages':
                csv = this.generatePagesCSV(data);
                break;
            case 'ads':
                csv = this.generateAdsCSV(data);
                break;
            case 'competitors':
                csv = this.generateCompetitorsCSV(data);
                break;
            default:
                console.warn(`Неизвестный тип данных: ${dataType}`);
        }

        return csv;
    }

    /**
     * Генерация CSV для ключевых слов
     * @param {Array} data
     * @returns {string}
     */
    generateKeywordsCSV(data) {
        let csv = 'Запрос,Частотность,[!Частотность],Позиция,URL\n';

        data.forEach(row => {
            const word = this.escapeCSVField(row.word || '');
            const ws = row.ws || 0;
            const wsk = row.wsk || 0;
            const pos = row.pos || '';
            const url = this.escapeCSVField(row.url || '');

            csv += `${word},${ws},${wsk},${pos},${url}\n`;
        });

        return csv;
    }

    /**
     * Генерация CSV для страниц
     * @param {Array} data
     * @returns {string}
     */
    generatePagesCSV(data) {
        let csv = 'URL,Топ-10,Топ-50,Видимость\n';

        data.forEach(row => {
            const url = this.escapeCSVField(row.url || '');
            const it10 = row.it10 || 0;
            const it50 = row.it50 || 0;
            const vis = row.vis || 0;

            csv += `${url},${it10},${it50},${vis}\n`;
        });

        return csv;
    }

    /**
     * Генерация CSV для рекламы
     * @param {Array} data
     * @returns {string}
     */
    generateAdsCSV(data) {
        let csv = 'Заголовок,Текст,Количество запросов\n';

        data.forEach(row => {
            const header = this.escapeCSVField(row.header || '');
            const txt = this.escapeCSVField(row.txt || '');
            const keyscnt = row.keyscnt || 0;

            csv += `${header},${txt},${keyscnt}\n`;
        });

        return csv;
    }

    /**
     * Генерация CSV для конкурентов
     * @param {Array} data
     * @returns {string}
     */
    generateCompetitorsCSV(data) {
        let csv = 'Домен,Пересечений,Процент,Топ-10,Видимость\n';

        data.forEach(row => {
            const name = this.escapeCSVField(row.name || '');
            const cnt = row.cnt || 0;
            const perc = row.perc || 0;
            const it10 = row.it10 || 0;
            const vis = row.vis || 0;

            csv += `${name},${cnt},${perc},${it10},${vis}\n`;
        });

        return csv;
    }

    /**
     * Экранирование поля для CSV
     * @param {string} field
     * @returns {string}
     */
    escapeCSVField(field) {
        const stringField = String(field);

        // Если поле содержит запятую, кавычки или перевод строки - оборачиваем в кавычки
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            // Удваиваем внутренние кавычки
            const escaped = stringField.replace(/"/g, '""');
            return `"${escaped}"`;
        }

        return stringField;
    }

    /**
     * Экспорт данных в JSON
     * @param {string} dataType
     * @param {string} filename
     * @returns {boolean}
     */
    exportToJSON(dataType, filename = null) {
        const data = this.dataCache[dataType];

        if (!data || !data.length) {
            console.warn(`Нет данных для экспорта: ${dataType}`);
            return false;
        }

        const jsonData = JSON.stringify(data, null, 2);
        const defaultFilename = filename || `${dataType}_${new Date().toISOString().split('T')[0]}.json`;

        this.downloadFile(jsonData, defaultFilename, 'application/json');
        return true;
    }

    /**
     * Экспорт всех данных в один JSON файл
     * @param {string} filename
     * @returns {boolean}
     */
    exportAllToJSON(filename = null) {
        const exportData = {};
        let hasData = false;

        Object.keys(this.dataCache).forEach(key => {
            if (this.dataCache[key] && this.dataCache[key].length > 0) {
                exportData[key] = this.dataCache[key];
                hasData = true;
            }
        });

        if (!hasData) {
            console.warn('Нет данных для экспорта');
            return false;
        }

        const jsonData = JSON.stringify({
            exportDate: new Date().toISOString(),
            data: exportData
        }, null, 2);

        const defaultFilename = filename || `keys_export_${new Date().toISOString().split('T')[0]}.json`;

        this.downloadFile(jsonData, defaultFilename, 'application/json');
        return true;
    }

    /**
     * Скачивание файла
     * @param {string} content
     * @param {string} filename
     * @param {string} mimeType
     */
    downloadFile(content, filename, mimeType) {
        // Добавляем BOM для корректного отображения кириллицы в Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Освобождаем память
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Очистка кэша данных
     */
    clearCache() {
        Object.keys(this.dataCache).forEach(key => {
            this.dataCache[key] = null;
        });
    }

    /**
     * Проверка наличия данных для экспорта
     * @param {string} dataType
     * @returns {boolean}
     */
    hasData(dataType) {
        return this.dataCache[dataType] && this.dataCache[dataType].length > 0;
    }

    /**
     * Получение статистики по кэшу
     * @returns {Object}
     */
    getCacheStats() {
        const stats = {};

        Object.keys(this.dataCache).forEach(key => {
            stats[key] = this.dataCache[key] ? this.dataCache[key].length : 0;
        });

        return stats;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
}