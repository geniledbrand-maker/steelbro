import { useState } from "react";
import styles from "./Navbar.module.css";
import Logo from "../Logo/Logo";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className={styles.navbar}>
            <div className={styles.logo}>
                <Logo />
            </div>

            <nav className={`${styles.links} ${open ? styles.active : ""}`}>
                <a href="#">О компании</a>
                <a href="#">Услуги</a>
                <a href="#">Продукция</a>
                <a href="#">Оборудование</a>
                <a href="#">Отрасли</a>
            </nav>

            <div className={styles.actions}>
                <button className={styles.contactBtn}>Контакты</button>
                <button className={styles.burger} onClick={() => setOpen(!open)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>

    );
}
