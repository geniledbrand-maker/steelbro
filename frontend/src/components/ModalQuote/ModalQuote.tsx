import { useEffect, useState } from "react";
import styles from "./ModalQuote.module.css";
import slide from "./SlidePanel.module.css";
import QuizForm from "./QuizForm";
import QuickForm from "./QuickForm";

interface ModalQuoteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalQuote({ isOpen, onClose }: ModalQuoteProps) {
    const [activePanel, setActivePanel] = useState<"quiz" | "quick" | null>(null);

    // ✅ Блокируем прокрутку при открытии модалки
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // ✅ Переключение панелей
    const togglePanel = (panel: "quiz" | "quick") => {
        setActivePanel((prev) => (prev === panel ? null : panel));
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.close} onClick={onClose}>
                    ×
                </button>

                <h2 className={styles.title}>
                    Получите расчет стоимости и сроков вашего проекта<br />
                    <span className={styles.accent}>за 10 минут</span>
                </h2>

                {/* Кнопки выбора */}
                <div className={styles.choiceButtons}>
                    <button
                        className={`${styles.choiceBtn} ${
                            activePanel === "quiz" ? styles.active : ""
                        }`}
                        onClick={() => togglePanel("quiz")}
                    >
                        Пройти опрос
                    </button>
                    <button
                        className={`${styles.choiceBtn} ${
                            activePanel === "quick" ? styles.active : ""
                        }`}
                        onClick={() => togglePanel("quick")}
                    >
                        Оставить заявку
                    </button>
                </div>

                {/* Панели с анимацией */}
                <div
                    className={`${slide.panel} ${
                        activePanel === "quiz" || activePanel === "quick"
                            ? slide.panelVisible
                            : ""
                    }`}
                >
                    {activePanel === "quiz" && (
                        <div className={slide.inner}>
                            <QuizForm />
                        </div>
                    )}
                    {activePanel === "quick" && (
                        <div className={slide.inner}>
                            <QuickForm />
                        </div>
                    )}
                </div>

                {/* Подсказка */}
                {!activePanel && (
                    <p className={styles.hint}>
                        Выберите удобный способ оставить заявку 👇
                    </p>
                )}
            </div>
        </div>
    );
}
