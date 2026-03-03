// --- File: src/app/help/page.tsx ---
import { Metadata } from 'next';
import HelpPageClient from './HelpPageClient';

export const metadata: Metadata = {
    title: 'Помощь и поддержка - PetsOk',
    description: 'Ответы на частые вопросы о сервисе PetsOk: инструкции для клиентов и ситтеров, безопасность и оплата.',
    alternates: {
        canonical: 'https://petsok.ru/help'
    },
    openGraph: {
        title: 'Помощь и поддержка - PetsOk',
        description: 'Ответы на частые вопросы о сервисе PetsOk: инструкции для клиентов и ситтеров.',
        url: 'https://petsok.ru/help',
        siteName: 'PetsOk',
        type: 'website',
    }
};

export default function HelpPage() {
    // Серверный компонент просто рендерит клиентский, 
    // но Next.js автоматически подставит SEO-теги из объекта metadata выше.
    return <HelpPageClient />;
}