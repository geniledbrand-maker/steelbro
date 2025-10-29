// File: src/utils/keywords.js
// Created: 2025-01-22
// Modified: 2025-01-22

/**
 * Keywords Analysis Utility
 * Утилита для анализа и обработки ключевых слов
 */

class KeywordsAnalyzer {
    constructor() {
        this.stopWords = [
            'и', 'в', 'на', 'с', 'по', 'для', 'от', 'до', 'из', 'к', 'у', 'о', 'об', 'за', 'под', 'над',
            'а', 'но', 'или', 'что', 'как', 'где', 'когда', 'почему', 'зачем', 'какой', 'какая', 'какое',
            'какие', 'чей', 'чья', 'чьё', 'чьи', 'это', 'эта', 'этот', 'эти', 'тот', 'та', 'те', 'такой',
            'такая', 'такое', 'такие', 'таков', 'такова', 'таково', 'таковы', 'сам', 'сама', 'само',
            'сами', 'себя', 'себе', 'собой', 'собою', 'мой', 'моя', 'моё', 'мои', 'твой', 'твоя', 'твоё',
            'твои', 'его', 'её', 'их', 'наш', 'наша', 'наше', 'наши', 'ваш', 'ваша', 'ваше', 'ваши'
        ];
        
        this.metalKeywords = [
            'металл', 'металлический', 'металлоконструкция', 'металлопрокат',
            'сталь', 'стальной', 'железо', 'железный', 'алюминий', 'алюминиевый',
            'балка', 'балки', 'труба', 'трубы', 'лист', 'листы', 'арматура',
            'швеллер', 'уголок', 'профиль', 'профильная', 'двутавр', 'двутавровая',
            'навес', 'навесы', 'ограждение', 'ограждения', 'лестница', 'лестницы',
            'каркас', 'каркасы', 'конструкция', 'конструкции', 'изготовление',
            'производство', 'монтаж', 'установка', 'сварка', 'сварной'
        ];
    }

    /**
     * Очистка и нормализация ключевых слов
     * @param {string[]} keywords - Массив ключевых слов
     * @returns {string[]}
     */
    cleanKeywords(keywords) {
        return keywords
            .map(keyword => keyword.toLowerCase().trim())
            .filter(keyword => keyword.length > 2)
            .filter(keyword => !this.stopWords.includes(keyword))
            .filter((keyword, index, array) => array.indexOf(keyword) === index); // убираем дубликаты
    }

    /**
     * Группировка ключевых слов по категориям
     * @param {string[]} keywords - Массив ключевых слов
     * @returns {Object}
     */
    groupKeywords(keywords) {
        const groups = {
            products: [],
            services: [],
            materials: [],
            locations: [],
            other: []
        };

        keywords.forEach(keyword => {
            if (this.isProductKeyword(keyword)) {
                groups.products.push(keyword);
            } else if (this.isServiceKeyword(keyword)) {
                groups.services.push(keyword);
            } else if (this.isMaterialKeyword(keyword)) {
                groups.materials.push(keyword);
            } else if (this.isLocationKeyword(keyword)) {
                groups.locations.push(keyword);
            } else {
                groups.other.push(keyword);
            }
        });

        return groups;
    }

    /**
     * Проверка, является ли ключевое слово продуктом
     * @param {string} keyword - Ключевое слово
     * @returns {boolean}
     */
    isProductKeyword(keyword) {
        const productPatterns = [
            'балка', 'труба', 'лист', 'арматура', 'швеллер', 'уголок',
            'навес', 'ограждение', 'лестница', 'каркас', 'конструкция'
        ];
        
        return productPatterns.some(pattern => keyword.includes(pattern));
    }

    /**
     * Проверка, является ли ключевое слово услугой
     * @param {string} keyword - Ключевое слово
     * @returns {boolean}
     */
    isServiceKeyword(keyword) {
        const servicePatterns = [
            'изготовление', 'производство', 'монтаж', 'установка', 'сварка',
            'проектирование', 'расчет', 'консультация', 'доставка'
        ];
        
        return servicePatterns.some(pattern => keyword.includes(pattern));
    }

    /**
     * Проверка, является ли ключевое слово материалом
     * @param {string} keyword - Ключевое слово
     * @returns {boolean}
     */
    isMaterialKeyword(keyword) {
        const materialPatterns = [
            'сталь', 'металл', 'железо', 'алюминий', 'оцинкованный',
            'нержавеющий', 'черный', 'цветной'
        ];
        
        return materialPatterns.some(pattern => keyword.includes(pattern));
    }

    /**
     * Проверка, является ли ключевое слово локацией
     * @param {string} keyword - Ключевое слово
     * @returns {boolean}
     */
    isLocationKeyword(keyword) {
        const locationPatterns = [
            'екатеринбург', 'москва', 'спб', 'санкт-петербург', 'челябинск',
            'пермь', 'тюмень', 'уфа', 'казань', 'нижний', 'новгород',
            'ростов', 'краснодар', 'самара', 'волгоград', 'воронеж'
        ];
        
        return locationPatterns.some(pattern => keyword.includes(pattern));
    }

    /**
     * Генерация дополнительных ключевых слов на основе базовых
     * @param {string[]} baseKeywords - Базовые ключевые слова
     * @returns {string[]}
     */
    generateRelatedKeywords(baseKeywords) {
        const related = new Set();
        
        baseKeywords.forEach(keyword => {
            // Добавляем варианты с прилагательными
            if (keyword.includes('металл')) {
                related.add('металлический ' + keyword);
                related.add('стальной ' + keyword);
            }
            
            if (keyword.includes('балка')) {
                related.add('двутавровая балка');
                related.add('стальная балка');
                related.add('металлическая балка');
            }
            
            if (keyword.includes('труба')) {
                related.add('профильная труба');
                related.add('стальная труба');
                related.add('металлическая труба');
            }
            
            // Добавляем региональные варианты
            const regions = ['екатеринбург', 'москва', 'спб'];
            regions.forEach(region => {
                related.add(keyword + ' ' + region);
                related.add(region + ' ' + keyword);
            });
        });
        
        return Array.from(related);
    }

    /**
     * Анализ частотности ключевых слов
     * @param {string[]} keywords - Массив ключевых слов
     * @returns {Object}
     */
    analyzeFrequency(keywords) {
        const frequency = {};
        
        keywords.forEach(keyword => {
            frequency[keyword] = (frequency[keyword] || 0) + 1;
        });
        
        // Сортируем по частоте
        const sorted = Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .map(([keyword, count]) => ({ keyword, count }));
        
        return {
            total: keywords.length,
            unique: Object.keys(frequency).length,
            frequency: frequency,
            sorted: sorted,
            top10: sorted.slice(0, 10)
        };
    }

    /**
     * Создание семантических групп ключевых слов
     * @param {string[]} keywords - Массив ключевых слов
     * @returns {Object}
     */
    createSemanticGroups(keywords) {
        const groups = {
            'Металлопрокат': [],
            'Металлоконструкции': [],
            'Услуги': [],
            'Материалы': [],
            'Региональные': []
        };
        
        keywords.forEach(keyword => {
            if (this.isProductKeyword(keyword)) {
                if (keyword.includes('балка') || keyword.includes('труба') || keyword.includes('лист')) {
                    groups['Металлопрокат'].push(keyword);
                } else {
                    groups['Металлоконструкции'].push(keyword);
                }
            } else if (this.isServiceKeyword(keyword)) {
                groups['Услуги'].push(keyword);
            } else if (this.isMaterialKeyword(keyword)) {
                groups['Материалы'].push(keyword);
            } else if (this.isLocationKeyword(keyword)) {
                groups['Региональные'].push(keyword);
            }
        });
        
        // Убираем пустые группы
        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) {
                delete groups[key];
            }
        });
        
        return groups;
    }

    /**
     * Валидация ключевых слов
     * @param {string[]} keywords - Массив ключевых слов
     * @returns {Object}
     */
    validateKeywords(keywords) {
        const errors = [];
        const warnings = [];
        
        keywords.forEach((keyword, index) => {
            if (keyword.length < 3) {
                errors.push(`Ключевое слово "${keyword}" слишком короткое (минимум 3 символа)`);
            }
            
            if (keyword.length > 50) {
                warnings.push(`Ключевое слово "${keyword}" слишком длинное (${keyword.length} символов)`);
            }
            
            if (this.stopWords.includes(keyword.toLowerCase())) {
                warnings.push(`Ключевое слово "${keyword}" является стоп-словом`);
            }
            
            if (!/^[а-яё\s\-]+$/i.test(keyword)) {
                warnings.push(`Ключевое слово "${keyword}" содержит недопустимые символы`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            total: keywords.length
        };
    }

    /**
     * Экспорт ключевых слов в различных форматах
     * @param {string[]} keywords - Массив ключевых слов
     * @param {string} format - Формат экспорта ('csv', 'txt', 'json')
     * @returns {string}
     */
    exportKeywords(keywords, format = 'txt') {
        switch (format.toLowerCase()) {
            case 'csv':
                return keywords.map(k => `"${k}"`).join('\n');
            
            case 'json':
                return JSON.stringify(keywords, null, 2);
            
            case 'txt':
            default:
                return keywords.join('\n');
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeywordsAnalyzer;
} else {
    window.KeywordsAnalyzer = KeywordsAnalyzer;
}

// End of file: src/utils/keywords.js
// Last modified: 2025-01-22
