import { useState } from "react";

// Компоненты
import Navbar from "../Navbar/Navbar";
import ModalQuote from "../ModalQuote";

// Стили
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
    const [showModal, setShowModal] = useState(false);

    return (
        <section className={styles.banner}>
            {/* Фоновое видео */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className={styles.background}
            >
                <source src="/video/laser.mp4" type="video/mp4" />
            </video>

            <div className={styles.overlay}></div>

            {/* Навигация поверх видео */}
            <Navbar />

            {/* Контент баннера */}
            <div className={styles.content}>
                <h1 className={styles.title}>
                    <span className={styles.white}>Превращаем металл</span>
                    <br />
                    <span className={styles.orange}>в совершенство</span>
                </h1>

                <p className={styles.subtitle}>
                    Лазерная резка металла в листах, лазерная резка труб,{" "}
                    <br className={styles.desktopOnly} />
                    гибка металла, сварка и порошковая покраска.
                </p>

                <button
                    className={styles.cta}
                    onClick={() => setShowModal(true)}
                    aria-label="Открыть форму расчета стоимости"
                >
                    Узнать стоимость
                </button>
            </div>

            {/* Модальное окно */}
            <ModalQuote
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </section>
    );
}
