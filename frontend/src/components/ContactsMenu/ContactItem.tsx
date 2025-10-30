import styles from "./ContactItem.module.css";

interface ContactItemProps {
    label: string;
    value: string;
    href?: string;
}

export default function ContactItem({ label, value, href }: ContactItemProps) {
    return (
        <li className={styles.item}>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            ) : (
                <span>{value}</span>
            )}
        </li>
    );
}
