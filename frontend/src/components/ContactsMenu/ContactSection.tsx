import styles from "./ContactSection.module.css";
import ContactItem from "./ContactItem";

interface ContactSectionProps {
    title: string;
    items: { label: string; value: string; href?: string }[];
}

export default function ContactSection({ title, items }: ContactSectionProps) {
    const isPhoneSection = title.toLowerCase().includes("телефон");
    const isAddressSection = title.toLowerCase().includes("адрес");

    const lat = 56.773356;
    const lon = 60.558416;

    const handleOpenMap = () => {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

        if (isMobile) {
            const yandexGoLink = `yandexmaps://maps.yandex.ru/?rtext=~${lat},${lon}&rtt=auto`;
            const timeout = setTimeout(() => {
                window.open(
                    `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`,
                    "_blank"
                );
            }, 1000);
            window.location.href = yandexGoLink;
            setTimeout(() => clearTimeout(timeout), 1500);
        } else {
            window.open(
                `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`,
                "_blank"
            );
        }
    };

    return (
        <section className={styles.section}>
            <h3 className={styles.title}>{title}</h3>
            <ul className={styles.list}>
                {items.map((item, i) => (
                    <ContactItem key={i} {...item} />
                ))}
            </ul>

            {isPhoneSection && (
                <button
                    className={styles.callBtn}
                    onClick={() => alert("Здесь будет форма обратного звонка")}
                >
                    Заказать звонок
                </button>
            )}

            {isAddressSection && (
                <>
                    <div className={styles.mapWrapper}>
                        <iframe
                            src="https://yandex.ru/map-widget/v1/?ll=60.558416%2C56.773356&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgo0NTY0Mjg5NzExEnvQoNC-0YHRgdC40Y8sINCh0LLQtdGA0LTQu9C-0LLRgdC60LDRjyDQvtCx0LvQsNGB0YLRjCwg0JXQutCw0YLQtdGA0LjQvdCx0YPRgNCzLCDQodC60LvQsNC00YHQutC-0Lkg0L_RgNC-0LXQt9C0LCA30LvQuNGC0KgiCg3RO3JCFesXY0I%2C&z=17.08"
                            title="Карта офиса Zhar-Svet"
                            loading="lazy"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <button
                        className={styles.routeBtn}
                        onClick={handleOpenMap}
                    >
                        <svg
                            className={styles.routeIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                        >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                        </svg>
                        Как проехать
                    </button>
                </>
            )}
        </section>
    );
}
