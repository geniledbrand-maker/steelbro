import { useState } from "react";
import styles from "./Navbar.module.css";
import Logo from "../Logo/Logo";
import ContactsMenu from "../ContactsMenu/ContactsMenu";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [contactsOpen, setContactsOpen] = useState(false);

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            window.location.href = "/";
        }
    };

    const handleContactsClick = () => {
        setContactsOpen(true);
        setOpen(false); // закрываем бургер при открытии контактов
    };

    return (
        <>
            <header className={styles.navbar}>
                {/* ✅ Логотип с плавным переходом на главную */}
                <div className={styles.logo}>
                    <a
                        href="/"
                        onClick={handleLogoClick}
                        aria-label="На главную страницу"
                        className={styles.logoLink}
                    >
                        <Logo />
                    </a>
                </div>

                {/* Меню */}
                <nav
                    className={[styles.links, open && styles.active]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <a href="#">О компании</a>
                    <a href="#">Услуги</a>
                    <a href="#">Продукция</a>
                    <a href="#">Оборудование</a>
                    <a href="#">Отрасли</a>

                    {/* ✅ Кнопка "Контакты" внутри меню для мобильных */}
                    <button
                        className={`${styles.contactBtn} ${styles.mobileOnly}`}
                        onClick={handleContactsClick}
                    >
                        Контакты
                    </button>
                </nav>

                {/* Правая часть */}
                <div className={styles.actions}>
                    <button
                        className={styles.contactBtn}
                        onClick={handleContactsClick}
                    >
                        Контакты
                    </button>

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
                </div>
            </header>

            {/* ✅ Панель контактов (стеклянная) */}
            <ContactsMenu
                isOpen={contactsOpen}
                onClose={() => setContactsOpen(false)}
            />
        </>
    );
}
