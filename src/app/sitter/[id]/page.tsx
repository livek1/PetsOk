// --- File: src/app/sitter/[id]/page.tsx ---
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import SitterProfileClient from './SitterProfileClient';

type Props = {
    params: Promise<{
        id: string;
    }>;
};

// 1. СЕРВЕРНЫЙ ФЕТЧИНГ ДАННЫХ ДЛЯ SEO
async function getSitterData(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://petsok.ru/api/v1';
    const encodedId = encodeURIComponent(id);
    const fetchUrl = `${apiUrl}/sitters/${encodedId}`;

    try {
        const res = await fetch(fetchUrl, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 } // ISR: кэшируем на 60 секунд
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
}

// 2. ГЕНЕРАЦИЯ ДИНАМИЧЕСКИХ МЕТА-ТЕГОВ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const responseJson = await getSitterData(id);

    let sitter = responseJson?.data || responseJson;
    if (Array.isArray(sitter) && sitter.length > 0) sitter = sitter[0];

    // Если ситтера нет, отдаем базовый title (дальше сработает notFound)
    if (!sitter || (!sitter.user_id && !sitter.slug)) {
        return { title: 'Профиль специалиста не найден | PetsOk' };
    }

    const name = sitter.name || sitter.first_name || 'Специалист';
    const city = sitter.city?.name || '';
    const cityText = city ? ` в г. ${city}` : '';
    const experienceText = sitter.care_experience ? ` Опыт: ${sitter.care_experience} лет.` : '';
    const avatarUrl = sitter.avatar?.data?.preview_url || sitter.avatar?.data?.url || 'https://petsok.ru/images/social-preview-home.jpg';

    const title = `Догситтер ${name}${cityText} — отзывы, цены на передержку и выгул | PetsOk`;
    const description = `Забронируйте услуги у проверенного догситтера ${name}${cityText}.${experienceText} Читайте отзывы владельцев, смотрите фото условий содержания и доверьте питомца профессионалу на PetsOk.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://petsok.ru/sitter/${id}`,
            siteName: 'PetsOk',
            type: 'profile',
            images: [{ url: avatarUrl, width: 800, height: 800, alt: `Догситтер ${name} на PetsOk` }],
        },
        alternates: {
            canonical: `https://petsok.ru/sitter/${id}`
        }
    };
}

// 3. РЕНДЕР СТРАНИЦЫ И MICRODATA (JSON-LD)
export default async function SitterPage({ params }: Props) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const responseJson = await getSitterData(id);

    let sitter = responseJson?.data || responseJson;
    if (Array.isArray(sitter) && sitter.length > 0) sitter = sitter[0];

    // Защита от 404 ошибки (как мы обсуждали ранее)
    if (!sitter || (!sitter.user_id && !sitter.slug)) {
        notFound();
    }

    const name = sitter.name || sitter.first_name || 'Ситтер PetsOk';
    const city = sitter.city?.name || '';
    const rating = sitter.user_rating ? parseFloat(sitter.user_rating) : 0;
    const reviewCount = sitter.reviews_count || 0;
    const avatarUrl = sitter.avatar?.data?.preview_url || sitter.avatar?.data?.url || 'https://petsok.ru/apple-touch-icon.png';
    const description = sitter.description || `Услуги по уходу за питомцами от ${name}`;

    // Микроразметка Услуги (ProfessionalService) для Google
    const sitterSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": name,
        "image": avatarUrl,
        "description": description,
        "url": `https://petsok.ru/sitter/${id}`,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city,
            "addressCountry": "RU"
        },
        ...(rating > 0 && reviewCount > 0 ? {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": String(rating),
                "reviewCount": String(reviewCount),
                "bestRating": "5",
                "worstRating": "1"
            }
        } : {}),
        "priceRange": "₽₽"
    };

    // Микроразметка Хлебных крошек
    const breadcrumbsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://petsok.ru" },
            { "@type": "ListItem", "position": 2, "name": "Поиск ситтеров", "item": `https://petsok.ru/search` },
            { "@type": "ListItem", "position": 3, "name": name, "item": `https://petsok.ru/sitter/${id}` }
        ]
    };

    return (
        <>
            <Script id="sitter-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sitterSchema) }} strategy="beforeInteractive" />
            <Script id="breadcrumbs-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }} strategy="beforeInteractive" />

            <SitterProfileClient initialSitter={sitter} sitterId={id} />
        </>
    );
}