import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://petsok.ru';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://petsok.ru/api/v1';

    try {
        // Дергаем готовый массив URL от бэкенда
        const res = await fetch(`${apiUrl}/seo/sitemap`, {
            // Кэшируем на сутки, Next.js будет сам обновлять sitemap в фоне (ISR)
            next: { revalidate: 86400 }
        });

        if (!res.ok) throw new Error('Failed to fetch sitemap from backend');

        const dynamicUrls = await res.json();

        // Преобразуем ответ бэкенда в формат Next.js
        const dynamicRoutes: MetadataRoute.Sitemap = dynamicUrls.map((route: any) => ({
            url: `${baseUrl}${route.url}`,
            lastModified: new Date(route.updated_at),
            changeFrequency: route.changefreq || 'daily',
            priority: route.priority || 0.8,
        }));

        return dynamicRoutes;

    } catch (error) {
        console.error("Ошибка генерации sitemap:", error);
        // Фолбэк, если бэк временно недоступен
        return [
            { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }
        ];
    }
}