import { useState } from "react";
import styles from "./QuickForm.module.css";

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
            <input type="text" placeholder="Имя" required />

            <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                maxLength={18}
                required
            />

            <textarea
                placeholder="Опишите задачу"
            ></textarea>

            {/* 📤 Прикрепление файлов со стрелкой вверх */}
            <div className={styles.fileRow}>
                <label className={styles.fileLabel}>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="34" viewBox="0 0 15 34" fill="none" className={styles.uploadIcon}>
                        <path d="M8.07039 0.292892C7.67987 -0.0976295 7.0467 -0.0976296 6.65618 0.292892L0.292215 6.65685C-0.0983098 7.04738 -0.0983098 7.68054 0.292215 8.07107C0.682739 8.46159 1.3159 8.46159 1.70643 8.07107L7.36328 2.41421L13.0201 8.07107C13.4107 8.46159 14.0438 8.46159 14.4344 8.07107C14.8249 7.68054 14.8249 7.04738 14.4344 6.65685L8.07039 0.292892ZM7.36328 34L8.36328 34L8.36328 1L7.36328 1L6.36328 1L6.36328 34L7.36328 34Z" fill="#D26008"/>
                    </svg>
                </label>

                <div className={styles.fileTextContainer}>
                    <div className={styles.fileTitle}>Прикрепить файлы</div>
                    <div className={styles.fileFormats}>
                        PDF / JPEG / STEP / SLDPRT /<br />
                        DXF / IPT / PRT / SAT
                    </div>
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
                Узнать стоимость
            </button>
        </form>
    );
}
