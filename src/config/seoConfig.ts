// --- File: src/config/seoConfig.ts ---

// Маппинг URL-слагов в ключи услуг API
export const SERVICE_SLUGS: Record<string, string> = {
    'dog-walking': 'walking',        // /moscow/dog-walking -> service_key: walking
    'pet-boarding': 'boarding',      // /moscow/pet-boarding -> service_key: boarding
    'home-visits': 'drop_in_visit',  // ...
    'day-care': 'doggy_day_care',
    'house-sitting': 'house_sitting',
};

// Обратный маппинг (для генерации ссылок)
export const SERVICE_KEYS_TO_SLUGS: Record<string, string> = {
    'walking': 'dog-walking',
    'boarding': 'pet-boarding',
    'drop_in_visit': 'home-visits',
    'doggy_day_care': 'day-care',
    'house_sitting': 'house-sitting',
};

// Словарь популярных городов (Slug -> Русское название для поиска)
// Это поможет геокодеру точнее искать, если в URL передали 'moscow'
export const CITY_SLUGS: Record<string, string> = {
    'moscow': 'Москва',
    'spb': 'Санкт-Петербург',
    'kazan': 'Казань',
    'novosibirsk': 'Новосибирск',
    'yekaterinburg': 'Екатеринбург',
    'nizhny-novgorod': 'Нижний Новгород',
    'chelyabinsk': 'Челябинск',
    'samara': 'Самара',
    'omsk': 'Омск',
    'rostov-on-don': 'Ростов-на-Дону',
    'ufa': 'Уфа',
    'krasnoyarsk': 'Красноярск',
    'voronezh': 'Воронеж',
    'perm': 'Пермь',
    'volgograd': 'Волгоград',
    'krasnodar': 'Краснодар',
    'sochi': 'Краснодар', // Или Сочи
};

// Функция для получения названия города из слага
// Если слаг есть в словаре - берем оттуда, иначе просто делаем Capitalize
export const getCityNameFromSlug = (slug: string): string => {
    if (!slug) return '';
    const lowerSlug = slug.toLowerCase();
    if (CITY_SLUGS[lowerSlug]) {
        return CITY_SLUGS[lowerSlug];
    }
    // Фолбек: просто делаем первую букву заглавной (для городов типа "himki")
    return slug.charAt(0).toUpperCase() + slug.slice(1);
};

// Тексты для SEO заголовков и описаний
export const getSeoMeta = (citySlug: string, serviceSlug?: string, t?: any) => {
    const cityName = getCityNameFromSlug(citySlug);
    const serviceKey = serviceSlug ? SERVICE_SLUGS[serviceSlug] : null;

    // Дефолтные значения
    let title = `Ситтеры и выгульщики в г. ${cityName} | PetsOk`;
    let description = `Найдите проверенного ситтера для вашего питомца в г. ${cityName}. Передержка, выгул и уход в домашних условиях. Отзывы, фото, безопасная оплата.`;
    let h1 = `Ситтеры для животных в г. ${cityName}`;

    if (serviceKey === 'walking') {
        title = `Выгул собак в г. ${cityName} - Найти выгульщика | PetsOk`;
        description = `Профессиональный выгул собак в г. ${cityName}. Найдите надежного выгульщика в вашем районе. Цены, отзывы, маршруты прогулок.`;
        h1 = `Выгул собак в г. ${cityName}`;
    } else if (serviceKey === 'boarding') {
        title = `Домашняя передержка животных в г. ${cityName} | PetsOk`;
        description = `Передержка собак и кошек в квартирных условиях в г. ${cityName}. Никаких клеток, только любовь и забота. Забронируйте ситтера онлайн.`;
        h1 = `Передержка животных в г. ${cityName}`;
    } else if (serviceKey === 'doggy_day_care') {
        title = `Дневная няня для собаки в г. ${cityName} | PetsOk`;
        description = `Оставьте собаку под присмотром опытной няни днем в г. ${cityName}. Игры, кормление и прогулки, пока вы на работе.`;
        h1 = `Дневная няня для собак в г. ${cityName}`;
    }

    return { title, description, h1 };
};