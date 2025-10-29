import { useState } from 'react';
import styles from './Navbar.module.css';
import Logo from '../Logo/Logo'; // ✅ импорт логотипа наверху, не внутри функции

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className={styles.navbar}>
            {/* Логотип */}
            <div className={styles.logo}>
                <Logo />
            </div>

            {/* Меню */}
            <nav className={`${styles.links} ${open ? styles.active : ''}`}>
                <a href="#">О компании</a>
                <a href="#">Услуги</a>
                <a href="#">Продукция</a>
                <a href="#">Оборудование</a>
                <a href="#">Отрасли</a>
                <button className={styles.contactBtn}>Контакты</button>
            </nav>

            {/* Бургер для мобильных */}
            <button
                className={styles.burger}
                onClick={() => setOpen(!open)}
                aria-label="Открыть меню"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </header>
    );
}
