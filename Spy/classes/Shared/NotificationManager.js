/**
 * NotificationManager - Управление уведомлениями
 * Файл: /classes/Shared/NotificationManager.js
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        
        this.init();
    }

    /**
     * Инициализация менеджера уведомлений
     */
    init() {
        this.createNotificationContainer();
        this.setupStyles();
    }

    /**
     * Создание контейнера для уведомлений
     */
    createNotificationContainer() {
        // Проверяем, есть ли уже контейнер
        this.container = document.getElementById('notificationContainer');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Настройка стилей для уведомлений
     */
    setupStyles() {
        if (document.getElementById('notificationStyles')) return;

        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                padding: 16px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }

            .notification.hide {
                opacity: 0;
                transform: translateX(100%);
            }

            .notification.success {
                border-left: 4px solid #4caf50;
            }

            .notification.error {
                border-left: 4px solid #f44336;
            }

            .notification.warning {
                border-left: 4px solid #ff9800;
            }

            .notification.info {
                border-left: 4px solid #2196f3;
            }

            .notification-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .notification.success .notification-icon {
                color: #4caf50;
            }

            .notification.error .notification-icon {
                color: #f44336;
            }

            .notification.warning .notification-icon {
                color: #ff9800;
            }

            .notification.info .notification-icon {
                color: #2196f3;
            }

            .notification-content {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
                color: #333;
            }

            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .notification-message {
                color: #666;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .notification-close:hover {
                background: #f5f5f5;
                color: #666;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                transition: width linear;
            }

            .notification.success .notification-progress {
                background: #4caf50;
            }

            .notification.error .notification-progress {
                background: #f44336;
            }

            .notification.warning .notification-progress {
                background: #ff9800;
            }

            .notification.info .notification-progress {
                background: #2196f3;
            }

            @media (max-width: 480px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Показ уведомления
     * @param {string} type - Тип уведомления (success, error, warning, info)
     * @param {string} message - Текст уведомления
     * @param {Object} options - Дополнительные опции
     */
    show(type, message, options = {}) {
        const {
            title = '',
            duration = this.defaultDuration,
            persistent = false,
            id = null
        } = options;

        const notificationId = id || this.generateId();
        
        // Удаляем существующее уведомление с таким же ID
        if (id) {
            this.hide(id);
        }

        // Ограничиваем количество уведомлений
        if (this.notifications.length >= this.maxNotifications) {
            this.hide(this.notifications[0].id);
        }

        const notification = {
            id: notificationId,
            type,
            title,
            message,
            duration: persistent ? 0 : duration,
            timestamp: Date.now()
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        // Автоматическое скрытие
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.hide(notificationId);
            }, duration);
        }

        return notificationId;
    }

    /**
     * Показ уведомления об успехе
     * @param {string} message
     * @param {Object} options
     */
    success(message, options = {}) {
        return this.show('success', message, { ...options, title: options.title || 'Успешно' });
    }

    /**
     * Показ уведомления об ошибке
     * @param {string} message
     * @param {Object} options
     */
    error(message, options = {}) {
        return this.show('error', message, { ...options, title: options.title || 'Ошибка' });
    }

    /**
     * Показ предупреждения
     * @param {string} message
     * @param {Object} options
     */
    warning(message, options = {}) {
        return this.show('warning', message, { ...options, title: options.title || 'Внимание' });
    }

    /**
     * Показ информационного уведомления
     * @param {string} message
     * @param {Object} options
     */
    info(message, options = {}) {
        return this.show('info', message, { ...options, title: options.title || 'Информация' });
    }

    /**
     * Отрисовка уведомления
     * @param {Object} notification
     */
    renderNotification(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.dataset.id = notification.id;

        const icon = this.getIcon(notification.type);
        const titleHtml = notification.title ? `<div class="notification-title">${this.escapeHtml(notification.title)}</div>` : '';
        const messageHtml = `<div class="notification-message">${this.escapeHtml(notification.message)}</div>`;

        element.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                ${titleHtml}
                ${messageHtml}
            </div>
            <button class="notification-close" onclick="notificationManager.hide('${notification.id}')">×</button>
            ${notification.duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        this.container.appendChild(element);

        // Анимация появления
        requestAnimationFrame(() => {
            element.classList.add('show');
        });

        // Анимация прогресс-бара
        if (notification.duration > 0) {
            const progressBar = element.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transitionDuration = `${notification.duration}ms`;
                requestAnimationFrame(() => {
                    progressBar.style.width = '0%';
                });
            }
        }
    }

    /**
     * Получение иконки для типа уведомления
     * @param {string} type
     * @returns {string}
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Скрытие уведомления
     * @param {string} id
     */
    hide(id) {
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('hide');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }

        // Удаляем из массива
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    /**
     * Очистка всех уведомлений
     */
    clear() {
        this.notifications.forEach(notification => {
            this.hide(notification.id);
        });
        this.notifications = [];
    }

    /**
     * Генерация уникального ID
     * @returns {string}
     */
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Экранирование HTML
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Получение статистики уведомлений
     * @returns {Object}
     */
    getStats() {
        const now = Date.now();
        const recent = this.notifications.filter(n => now - n.timestamp < 60000); // Последняя минута
        
        return {
            total: this.notifications.length,
            recent: recent.length,
            byType: this.notifications.reduce((acc, n) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
            }, {})
        };
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.clear();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
    }
}

// Создаем глобальный экземпляр
window.notificationManager = new NotificationManager();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
