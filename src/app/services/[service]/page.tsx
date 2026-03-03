// --- File: src/app/services/[service]/page.tsx ---
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicePageClient from './ServicePageClient';
import { getServiceDataBySlug, servicesPagesData } from '@/config/servicesPagesData';

type Props = {
    params: Promise<{
        service: string;
    }>;
};

// 1. ГЕНЕРАЦИЯ СТАТИЧЕСКИХ ПАРАМЕТРОВ (Static Site Generation)
// Это скажет Next.js сгенерировать 5 идеальных HTML страниц при билде проекта
export async function generateStaticParams() {
    return Object.keys(servicesPagesData).map((slug) => ({
        service: slug,
    }));
}

// 2. ГЕНЕРАЦИЯ SEO МЕТАДАННЫХ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const serviceData = getServiceDataBySlug(resolvedParams.service);

    if (!serviceData) {
        return { title: 'Услуга не найдена' };
    }

    return {
        title: serviceData.seo.title,
        description: serviceData.seo.description,
        openGraph: {
            title: serviceData.seo.title,
            description: serviceData.seo.description,
            url: `https://petsok.ru/services/${resolvedParams.service}`,
            siteName: 'PetsOk',
            type: 'website',
            images: [{ url: '/images/social-preview-home.jpg' }],
        },
        alternates: {
            canonical: `https://petsok.ru/services/${resolvedParams.service}`
        }
    };
}

// 3. РЕНДЕР СТРАНИЦЫ
export default async function ServiceLandingPage({ params }: Props) {
    const resolvedParams = await params;
    const serviceData = getServiceDataBySlug(resolvedParams.service);

    if (!serviceData) {
        notFound();
    }

    // --- МИКРОРАЗМЕТКА FAQ ДЛЯ ГУГЛА (Rich Snippets) ---
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": serviceData.faq.map((item: any) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
            }
        }))
    };

    // --- МИКРОРАЗМЕТКА УСЛУГИ ---
    const serviceJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": serviceData.hero.title,
        "description": serviceData.hero.subtitle,
        "provider": {
            "@type": "Organization",
            "name": "PetsOk",
            "url": "https://petsok.ru"
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

            <ServicePageClient data={serviceData} />
        </>
    );
}