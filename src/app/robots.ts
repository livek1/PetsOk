import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/cabinet/',
                '/api/',
                '/search?*',
                '/terms',           // Закрываем Условия использования
                '/privacy-policy',  // Закрываем Политику конфиденциальности
                '/cookie-policy',   // Закрываем Политику Cookie
            ],
        },
        sitemap: 'https://petsok.ru/sitemap.xml',
    }
}