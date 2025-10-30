import { useState } from "react";
import styles from "./QuizForm.module.css";

interface ServiceOption {
    id: string;
    name: string;
    icon: string;
}

const services: ServiceOption[] = [
    { id: "pipe", name: "Лазерная\nрезка труб", icon: "/img/icons/lazerrezkatrub.png" },
    { id: "sheet", name: "Лазерная резка\nметалла", icon: "/img/icons/lazernayarezka.png" },
    { id: "bend", name: "Гибка\nметалла", icon: "/img/icons/gibkametalla.png" },
    { id: "weld", name: "Сварка\nметаллоконструкций", icon: "/img/icons/svarkametallokonstrukcii.png" },
    { id: "paint", name: "Покраска\nметалла", icon: "/img/icons/pokraskametalla.png" },
    { id: "laserweld", name: "Лазерная сварка\nметалла", icon: "/img/icons/lazernayasvarka.png" },
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
                        <img
                            src={s.icon}
                            alt="" /* ✅ ИЗМЕНЕНО: пустой alt */
                            className={styles.serviceIcon}
                        />
                        <span>{s.name}</span>
                    </div>
                ))}
            </div>

            <button type="submit" className={styles.submit}>
                Отправить
            </button>
        </form>
    );
}
