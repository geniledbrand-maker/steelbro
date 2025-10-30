import { useState } from "react";
import styles from "./ModalQuote.module.css";

interface ServiceOption {
    id: string;
    name: string;
    icon: string;
}

const services: ServiceOption[] = [
    { id: "pipe", name: "Лазерная резка труб", icon: "/icons/pipe.svg" },
    { id: "sheet", name: "Лазерная резка металла", icon: "/icons/sheet.svg" },
    { id: "bend", name: "Гибка металла", icon: "/icons/bend.svg" },
    { id: "weld", name: "Сварка металлоконструкций", icon: "/icons/weld.svg" },
    { id: "paint", name: "Покраска металла", icon: "/icons/paint.svg" },
    { id: "laserweld", name: "Лазерная сварка металла", icon: "/icons/laserweld.svg" },
];

export default function QuizForm() {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        setSelected((prev) => (prev === id ? null : id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return alert("Выберите услугу!");
        alert(`Вы выбрали: ${services.find((s) => s.id === selected)?.name}`);
    };

    return (
        <form className={styles.quiz} onSubmit={handleSubmit}>
            <p className={styles.quizTitle}>Выберите нужную услугу:</p>

            <div className={styles.servicesGrid}>
                {services.map((s) => (
                    <div
                        key={s.id}
                        className={`${styles.serviceCard} ${
                            selected === s.id ? styles.serviceActive : ""
                        }`}
                        onClick={() => handleSelect(s.id)}
                    >
                        <img src={s.icon} alt="" className={styles.serviceIcon} />
                        <span>{s.name}</span>
                    </div>
                ))}
            </div>

            <button type="submit" className={styles.submit}>
                Далее
            </button>
        </form>
    );
}
