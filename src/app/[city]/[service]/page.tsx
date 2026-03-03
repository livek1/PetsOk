// --- File: src/app/[city]/[service]/page.tsx ---
import { Metadata } from 'next';
import SeoSearchClient from './SeoSearchClient';
import {
    FRONT_TO_BACK_CITY,
    FRONT_TO_BACK_SERVICE,
    BACK_TO_REDUX_SERVICE,
    getCityNameFromSlug
} from '@/config/seoConfig';

// 1. ЗАСТАВЛЯЕМ NEXT.JS РЕНДЕРИТЬ HTML НА СЕРВЕРЕ (ОТКЛЮЧАЕМ КЛИЕНТСКИЙ SUSPENSE)
export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
        city: string;
        service: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getCatalogData(citySlug: string, serviceSlug: string, page: number) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://petsok.ru/api/v1';

    try {
        const url = `${apiUrl}/seo/catalog?city_slug=${citySlug}&service_slug=${serviceSlug}&limit=30&page=${page}`;
        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { city, service } = resolvedParams;
    const page = Number(resolvedSearchParams?.page) || 1;

    const backendCitySlug = FRONT_TO_BACK_CITY[city] || city;
    const backendServiceSlug = FRONT_TO_BACK_SERVICE[service] || service;

    const data = await getCatalogData(backendCitySlug, backendServiceSlug, page);

    if (!data || !data.meta?.seo) {
        return { title: 'Поиск ситтеров | PetsOk' };
    }

    const seo = data.meta.seo;

    // Уникализируем title и canonical для страниц пагинации
    const pageTitle = page > 1 ? `${seo.title} - Страница ${page}` : seo.title;
    const canonicalUrl = page > 1
        ? `https://petsok.ru/${city}/${service}?page=${page}`
        : `https://petsok.ru/${city}/${service}`;

    return {
        title: pageTitle,
        description: seo.description,
        openGraph: {
            title: pageTitle,
            description: seo.description,
            url: canonicalUrl,
            siteName: 'PetsOk',
            type: 'website',
            images: [{ url: '/images/social-preview-home.jpg' }],
        },
        alternates: {
            canonical: canonicalUrl
        }
    };
}

export default async function CityServicePage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { city, service } = resolvedParams;
    const page = Number(resolvedSearchParams?.page) || 1;

    const backendCitySlug = FRONT_TO_BACK_CITY[city] || city;
    const backendServiceSlug = FRONT_TO_BACK_SERVICE[service] || service;

    const data = await getCatalogData(backendCitySlug, backendServiceSlug, page);
    const cityName = getCityNameFromSlug(backendCitySlug);
    const reduxServiceKey = BACK_TO_REDUX_SERVICE[backendServiceSlug] || backendServiceSlug;

    // ИСПРАВЛЕНИЕ 404: Если SEO-данных нет (например, юзер выбрал "Кошки"), 
    // мы не выкидываем notFound, а рендерим пустую страницу поиска.
    // Клиентский компонент сам прочитает URL параметры и загрузит нужных ситтеров.
    if (!data || !data.meta?.seo) {
        return (
            <SeoSearchClient
                cityName={cityName}
                reduxServiceKey={reduxServiceKey}
                seoData={null}
                initialSitters={[]}
                initialPagination={null}
                isGeneralSearch={true} // Форсируем режим общего поиска
            />
        );
    }

    const seo = data.meta.seo;
    const initialSitters = data.data || [];
    const initialPagination = data.meta.pagination || { total: 0, current_page: page, total_pages: 1 };

    const serviceJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": seo.h1,
        "provider": {
            "@type": "Organization",
            "name": "PetsOk",
            "url": "https://petsok.ru"
        },
        ...(seo.aggregateRating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": String(seo.aggregateRating.ratingValue),
                "reviewCount": String(seo.aggregateRating.reviewCount)
            }
        }),
        ...(seo.offers && {
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": seo.offers.priceCurrency || "RUB",
                "lowPrice": String(seo.offers.lowPrice),
                "highPrice": String(seo.offers.highPrice)
            }
        })
    };

    // Убрали Suspense, чтобы HTML собирался сразу для роботов
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
            <SeoSearchClient
                cityName={cityName}
                reduxServiceKey={reduxServiceKey}
                seoData={seo}
                initialSitters={initialSitters}
                initialPagination={initialPagination}
            />
        </>
    );
}