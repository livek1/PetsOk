// --- File: config/appConfig.ts ---
type ServiceID = 'boarding_sitter' | 'walking' | 'drop_in' | 'day_care' | 'house_sitting_owner' | 'puppy_nanny';

// Полное описание каждого сервиса
interface ServiceConfig {
    id: ServiceID;
    enabled: boolean;
    header: {
        translationKey: string;
        defaultText: string;
    } | null;
    search: {
        nameKey: string;
        descKey: string;
        itemTitleKey: string;
    } | null;
    // --- НОВАЯ СЕКЦИЯ ДЛЯ СТРАНИЦЫ СИТТЕРА ---
    sitterPage: {
        nameKey: string;
        descKey: string;
        highlightKey?: string; // Опциональный ключ для ярлыка "Наибольший доход"
        iconKey: string; // Ключ для выбора иконки в компоненте
    } | null;
}

// Конфигурация всех возможных сервисов. Чтобы включить/выключить, меняйте флаг 'enabled'.
const ALL_SERVICES_CONFIG: Record<ServiceID, ServiceConfig> = {
    boarding_sitter: {
        id: 'boarding_sitter',
        enabled: true,
        header: { translationKey: 'header.services.boarding', defaultText: 'Передержка' },
        search: { nameKey: 'SearchSitter.tabs.service1.name', descKey: 'SearchSitter.tabs.service1.description', itemTitleKey: 'SearchSitter.itemTitle.service1' },
        sitterPage: {
            nameKey: 'sitterServices.boarding.title',
            descKey: 'sitterServices.boarding.desc',
            highlightKey: 'sitterServices.boarding.highlight',
            iconKey: 'boarding'
        }
    },
    walking: {
        id: 'walking',
        enabled: false, // <-- ВКЛЮЧАЕМ ДЛЯ ПРИМЕРА
        header: { translationKey: 'header.services.walking', defaultText: 'Выгул' },
        search: { nameKey: 'SearchSitter.tabs.service2.name', descKey: 'SearchSitter.tabs.service2.description', itemTitleKey: 'SearchSitter.itemTitle.service2' },
        sitterPage: {
            nameKey: 'sitterServices.walking.title',
            descKey: 'sitterServices.walking.desc',
            iconKey: 'walking'
        }
    },
    drop_in: {
        id: 'drop_in',
        enabled: false, // <-- ВКЛЮЧАЕМ ДЛЯ ПРИМЕРА
        header: null,
        search: { nameKey: 'SearchSitter.tabs.service3.name', descKey: 'SearchSitter.tabs.service3.description', itemTitleKey: 'SearchSitter.itemTitle.service3' },
        sitterPage: {
            nameKey: 'sitterServices.homevisits.title', // Используем общий ключ для визитов на дом
            descKey: 'sitterServices.homevisits.desc',
            iconKey: 'homevisits'
        }
    },
    day_care: {
        id: 'day_care',
        enabled: false, // <-- ВКЛЮЧАЕМ ДЛЯ ПРИМЕРА
        header: { translationKey: 'header.services.daycare', defaultText: 'Дневной присмотр' },
        search: { nameKey: 'SearchSitter.tabs.service4.name', descKey: 'SearchSitter.tabs.service4.description', itemTitleKey: 'SearchSitter.itemTitle.service4' },
        sitterPage: {
            nameKey: 'sitterServices.daycare.title',
            descKey: 'sitterServices.daycare.desc',
            iconKey: 'daycare'
        }
    },
    house_sitting_owner: {
        id: 'house_sitting_owner',
        enabled: false, // <-- Эту услугу можно скрыть со страницы ситтера, оставив null
        header: { translationKey: 'header.services.houseSitting', defaultText: 'Присмотр на дому' },
        search: { nameKey: 'SearchSitter.tabs.service5.name', descKey: 'SearchSitter.tabs.service5.description', itemTitleKey: 'SearchSitter.itemTitle.service5' },
        sitterPage: null // <-- НЕ ПОКАЗЫВАЕМ НА СТРАНИЦЕ СИТТЕРА
    },
    puppy_nanny: {
        id: 'puppy_nanny',
        enabled: false,
        header: { translationKey: 'header.services.puppyNanny', defaultText: 'Няня для щенка' },
        search: null,
        sitterPage: null // <-- НЕ ПОКАЗЫВАЕМ НА СТРАНИЦЕ СИТТЕРА
    }
};

// Экспортируем отфильтрованные и готовые к использованию массивы
export const enabledServicesForHeader = Object.values(ALL_SERVICES_CONFIG)
    .filter(service => service.enabled && service.header)
    .map(service => ({
        key: service.id,
        labelKey: service.header!.translationKey,
        defaultLabel: service.header!.defaultText,
    }));

export const enabledServicesForSearch = Object.values(ALL_SERVICES_CONFIG)
    .filter(service => service.enabled && service.search)
    .map(service => ({
        id: service.id,
        nameKey: service.search!.nameKey,
        descriptionKey: service.search!.descKey,
        itemTitleKey: service.search!.itemTitleKey,
    }));

// --- НОВЫЙ ЭКСПОРТ ДЛЯ СТРАНИЦЫ СИТТЕРА ---
export const enabledServicesForSitterPage = Object.values(ALL_SERVICES_CONFIG)
    .filter(service => service.enabled && service.sitterPage)
    .map(service => ({
        id: service.id,
        ...service.sitterPage!, // Используем !, так как filter гарантирует наличие sitterPage
    }));


export const config = {
    // --- ИЗМЕНЕНИЕ: ДОБАВЛЕН НОВЫЙ ФЛАГ ---
    enablePhoneAuth: false, // <-- Установите true, чтобы включить ввод телефона на вебе

    siteUrl: 'https://petsok.ru',
    referralParamName: 'ref',
    apiBaseUrl: 'https://petsok.ru/api/v1',
    googleClientIdWeb: "568554314984-7c6ar6adjkq4qoj50djjeqp4ih7qi00n.apps.googleusercontent.com",
    appleServiceId: "ru.petsok.signin",
    appleRedirectUri: "https://petsok.ru/api/v1/auth/apple/callback",
    appStoreUrl: "https://apps.apple.com/app/example",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.example",
    appUniversalUrl: "https://petsok.ru/app",
};