import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/cabinet/',
                '/api/',
                '/search?*',       // Запрещаем системный поиск с 1000 фильтров
                '/terms',
                '/privacy-policy',
                '/cookie-policy',
            ],
        },
        sitemap: 'https://petsok.ru/sitemap.xml',
    }
}