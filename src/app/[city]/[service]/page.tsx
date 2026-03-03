// --- File: src/app/[city]/[service]/page.tsx ---
import { Metadata } from 'next';
import SeoSearchClient from './SeoSearchClient';
import {
    FRONT_TO_BACK_CITY,
    FRONT_TO_BACK_SERVICE,
    BACK_TO_REDUX_SERVICE,
    getCityNameFromSlug
} from '@/config/seoConfig';

type Props = {
    params: Promise<{
        city: string;
        service: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getCatalogData(citySlug: string, serviceSlug: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://petsok.ru/api/v1';

    try {
        const url = `${apiUrl}/seo/catalog?city_slug=${citySlug}&service_slug=${serviceSlug}&limit=30&page=1`;
        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const { city, service } = resolvedParams;

    const backendCitySlug = FRONT_TO_BACK_CITY[city] || city;
    const backendServiceSlug = FRONT_TO_BACK_SERVICE[service] || service;

    const data = await getCatalogData(backendCitySlug, backendServiceSlug);

    if (!data || !data.meta?.seo) {
        return { title: 'Поиск ситтеров | PetsOk' };
    }

    const seo = data.meta.seo;

    return {
        title: seo.title,
        description: seo.description,
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: `https://petsok.ru/${city}/${service}`,
            siteName: 'PetsOk',
            type: 'website',
            images: [{ url: '/images/social-preview-home.jpg' }],
        },
        alternates: {
            canonical: `https://petsok.ru/${city}/${service}`
        }
    };
}

export default async function CityServicePage({ params }: Props) {
    const resolvedParams = await params;
    const { city, service } = resolvedParams;

    const backendCitySlug = FRONT_TO_BACK_CITY[city] || city;
    const backendServiceSlug = FRONT_TO_BACK_SERVICE[service] || service;

    const data = await getCatalogData(backendCitySlug, backendServiceSlug);
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
    const initialPagination = data.meta.pagination || { total: 0, current_page: 1, total_pages: 1 };

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