import { useEffect } from "react";
import styles from "./ContactsMenu.module.css";
import { sections } from "./data";
import ContactSection from "./ContactSection";

interface ContactsMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactsMenu({ isOpen, onClose }: ContactsMenuProps) {
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            <div
                className={`${styles.overlay} ${isOpen ? styles.visible : ""}`}
                onClick={onClose}
            />
            <aside
                className={`${styles.menu} ${isOpen ? styles.open : ""}`}
                role="dialog"
                aria-label="Контакты компании"
            >
                <button
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Закрыть контакты"
                >
                    ×
                </button>

                <div className={styles.content}>
                    {sections.map((section, i) => (
                        <ContactSection
                            key={i}
                            title={section.title}
                            items={section.items}
                        />
                    ))}
                </div>
            </aside>
        </>
    );
}
