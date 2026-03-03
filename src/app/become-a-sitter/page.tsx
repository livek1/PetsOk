// --- File: src/app/become-a-sitter/page.tsx ---
import { Metadata } from 'next';
import BecomeSitterClient from './BecomeSitterClient';

export const metadata: Metadata = {
    title: 'Стать догситтером и зарабатывать на PetsOk | 0% комиссии',
    description: 'Присоединяйтесь к PetsOk, чтобы предлагать услуги передержки, выгула и дневного ухода за животными. Устанавливайте свой график, цены и получайте 100% дохода.',
    alternates: {
        canonical: 'https://petsok.ru/become-a-sitter' // Замените на ваш домен
    },
    openGraph: {
        title: 'Стать ситтером на PetsOk',
        description: 'Преврати любовь к животным в стабильный доход. Твой график, твои цены, 0% комиссии.',
        url: 'https://petsok.ru/become-a-sitter',
        type: 'website',
        images: [{ url: '/images/social-preview-home.jpg' }]
    }
};

export default function BecomeASitterPage() {
    // Микроразметка для Google (Schema.org)
    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Pet Sitting Job",
        "provider": {
            "@type": "Organization",
            "name": "PetsOk",
            "url": "https://petsok.ru"
        },
        "description": "Присоединяйтесь к PetsOk, чтобы предлагать услуги передержки, выгула и дневного ухода за животными. 0% комиссии.",
        "name": "Стать догситтером на PetsOk"
    };

    return (
        <>
            {/* Невидимый скрипт для поисковых ботов */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />

            {/* Рендерим клиентскую часть со всей логикой */}
            <BecomeSitterClient />
        </>
    );
}