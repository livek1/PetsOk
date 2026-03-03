// --- File: src/config/seoConfig.ts ---

// Маппинг URL-слагов в ключи услуг API
export const SERVICE_SLUGS: Record<string, string> = {
    'dog-walking': 'walking',
    'pet-boarding': 'boarding',
    'home-visits': 'drop_in_visit',
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

// Все города (и красивые URL фронта, и транслит из БД бэкенда)
export const CITY_SLUGS: Record<string, string> = {
    // 11 городов РФ
    'moscow': 'Москва', 'moskva': 'Москва',
    'spb': 'Санкт-Петербург', 'sankt-peterburg': 'Санкт-Петербург',
    'omsk': 'Омск',
    'krasnoyarsk': 'Красноярск',
    'novosibirsk': 'Новосибирск',
    'yekaterinburg': 'Екатеринбург', 'ekaterinburg': 'Екатеринбург',
    'ufa': 'Уфа',
    'samara': 'Самара',
    'chelyabinsk': 'Челябинск',
    'kazan': 'Казань',
    'nizhny-novgorod': 'Нижний Новгород', 'nizhniy-novgorod': 'Нижний Новгород',

    // 3 города Казахстана
    'almaty': 'Алматы',
    'astana': 'Астана',
    'shymkent': 'Шымкент',
};

// Список красивых фронтенд-слагов для вывода меню в Футере (строго 14 штук)
export const FRONTEND_CITY_SLUGS = [
    'moscow', 'spb', 'novosibirsk', 'yekaterinburg', 'kazan',
    'nizhny-novgorod', 'chelyabinsk', 'samara', 'omsk', 'krasnoyarsk', 'ufa',
    'almaty', 'astana', 'shymkent'
];

// ============================================================================
// СЛОВАРИ ДЛЯ PROGRAMMATIC SEO (Трансляция фронт -> бэк -> Redux)
// ============================================================================

// МАППИНГ: Красивый URL Фронта -> Транслит из БД Бэкенда
// (те города, чьи названия совпадают, писать не обязательно, они прокинутся как есть)
export const FRONT_TO_BACK_CITY: Record<string, string> = {
    'moscow': 'moskva',
    'spb': 'sankt-peterburg',
    'yekaterinburg': 'ekaterinburg',
    'nizhny-novgorod': 'nizhniy-novgorod',
};

// МАППИНГ: Красивый URL Фронта (услуга) -> Слаг услуги Бэкенда (из БД)
export const FRONT_TO_BACK_SERVICE: Record<string, string> = {
    'pet-boarding': 'boarding',
    'dog-walking': 'dog_walking',
    'day-care': 'doggy_day_care',
    'home-visits': 'drop_in_visit',
    'house-sitting': 'house_sitting',
};

// МАППИНГ: Слаг услуги Бэкенда (из БД) -> Ключ услуги в Redux стейте фронта
export const BACK_TO_REDUX_SERVICE: Record<string, string> = {
    'boarding': 'boarding',
    'dog_walking': 'walking',
    'doggy_day_care': 'doggy_day_care',
    'drop_in_visit': 'drop_in_visit',
    'house_sitting': 'house_sitting',
};

// ============================================================================

export const getCitySlugFromName = (cityName: string): string | null => {
    const normalizedName = cityName.trim().toLowerCase();
    for (const [slug, name] of Object.entries(CITY_SLUGS)) {
        if (name.toLowerCase() === normalizedName) {
            // Возвращаем именно фронтенд-слаг (красивый)
            return FRONTEND_CITY_SLUGS.includes(slug) ? slug :
                Object.keys(FRONT_TO_BACK_CITY).find(key => FRONT_TO_BACK_CITY[key] === slug) || slug;
        }
    }
    return null;
};

export const getCityNameFromSlug = (slug: string): string => {
    if (!slug) return '';
    const lowerSlug = slug.toLowerCase();
    return CITY_SLUGS[lowerSlug] || slug.charAt(0).toUpperCase() + slug.slice(1);
};

// Тексты для SEO заголовков и описаний (H1, Title, Description)
export const getSeoMeta = (citySlug: string, serviceSlug?: string) => {
    const cityName = getCityNameFromSlug(citySlug);
    const serviceKey = serviceSlug ? SERVICE_SLUGS[serviceSlug] : null;

    let title = `Ситтеры и выгульщики в г. ${cityName} | PetsOk`;
    let description = `Найдите проверенного ситтера для вашего питомца в г. ${cityName}. Передержка, выгул и уход в домашних условиях. Без клеток и стресса.`;
    let h1 = `Ситтеры для животных в г. ${cityName}`;

    if (serviceKey === 'boarding') {
        title = `Домашняя передержка собак и кошек в г. ${cityName} | PetsOk`;
        description = `Надежная передержка собак и кошек в квартирных условиях в г. ${cityName}. Никаких клеток, 100% внимания и бесплатный ветеринар онлайн. Забронируйте ситтера!`;
        h1 = `Домашняя передержка животных в г. ${cityName}`;
    } else if (serviceKey === 'walking') {
        title = `Выгул собак в г. ${cityName} - Найти выгульщика | PetsOk`;
        description = `Профессиональный выгул собак в г. ${cityName}. Найдите надежного выгульщика. GPS-маршруты, фотоотчеты и гарантия безопасности.`;
        h1 = `Выгул собак в г. ${cityName}`;
    } else if (serviceKey === 'doggy_day_care') {
        title = `Дневная няня для собаки в г. ${cityName} | PetsOk`;
        description = `Оставьте собаку под присмотром опытной няни днем в г. ${cityName}. Игры, кормление и прогулки, пока вы на работе.`;
        h1 = `Дневная няня для собак в г. ${cityName}`;
    } else if (serviceKey === 'drop_in_visit') {
        title = `Приходящая няня для кошек и собак в г. ${cityName} | PetsOk`;
        description = `Ситтер приедет к вам домой в г. ${cityName}, чтобы покормить питомца, убрать лоток и поиграть. Удобно для кошек и щенков!`;
        h1 = `Визиты на дом (зооняня) в г. ${cityName}`;
    } else if (serviceKey === 'house_sitting') {
        title = `Присмотр за питомцем у вас дома в г. ${cityName} | PetsOk`;
        description = `Ситтер поживет с вашим питомцем у вас дома в г. ${cityName}. Идеально для животных, которые боятся переездов.`;
        h1 = `Присмотр за животными на вашей территории в г. ${cityName}`;
    }

    return { title, description, h1 };
};