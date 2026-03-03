import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/cabinet/', // Закрываем личный кабинет от индексации
                '/api/',
                '/search?*', // Закрываем параметрические поиски, чтобы не плодить дубли
            ],
        },
        sitemap: 'https://petsok.ru/sitemap.xml',
    }
}