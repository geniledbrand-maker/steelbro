import { useState } from "react";
import styles from "./ModalQuote.module.css";

export default function QuickForm() {
    const [phone, setPhone] = useState("+7 ");
    const [files, setFiles] = useState<FileList | null>(null);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (!value.startsWith("7")) value = "7" + value;

        let formatted = "+7";
        if (value.length > 1) formatted += " (" + value.substring(1, 4);
        if (value.length >= 5) formatted += ") " + value.substring(4, 7);
        if (value.length >= 8) formatted += "-" + value.substring(7, 9);
        if (value.length >= 10) formatted += "-" + value.substring(9, 11);

        setPhone(formatted);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Заявка отправлена!");
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <input type="text" placeholder="Ваше имя" required />

            <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                maxLength={18}
                required
            />

            <textarea
                placeholder="Комментарий или описание проекта"
                rows={3}
            ></textarea>

            {/* 📎 Прикрепление файлов + подсказка форматов */}
            <div className={styles.fileRow}>
                <label className={styles.fileLabel}>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    <span className={styles.fileButton}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={styles.clipIcon}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 13V7a4 4 0 00-8 0v9a3 3 0 106 0V9m-6 4H9a4 4 0 100 8h8a4 4 0 000-8z"
                            />
                        </svg>
                        Прикрепить файлы
                    </span>
                </label>

                <div className={styles.fileFormats}>
                    Форматы: PDF / JPEG / STEP /
                    <br />
                    SLDPRT / DXF / IPT / PRT / SAT
                </div>
            </div>

            {files && (
                <ul className={styles.fileList}>
                    {Array.from(files).map((file, index) => (
                        <li key={index}>{file.name}</li>
                    ))}
                </ul>
            )}

            <button type="submit" className={styles.submit}>
                Отправить
            </button>
        </form>
    );
}
