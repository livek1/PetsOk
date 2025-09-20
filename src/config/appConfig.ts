// --- File: config/appConfig.ts ---

import { FC } from 'react';

// Импортируем все компоненты иконок, которые будем использовать
import BoardingIcon from '../components/icons/BoardingIcon';
import DogWalkingIcon from '../components/icons/DogWalkingIcon';
import DropInVisitsIcon from '../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../components/icons/DoggyDayCareIcon';
import HouseSittingIcon from '../components/icons/HouseSittingIcon';

// Создаем "карту" (Map) для сопоставления строкового ключа и компонента
const serviceIconMap: Record<string, FC<any>> = {
    boarding: BoardingIcon,
    walking: DogWalkingIcon,
    homevisits: DropInVisitsIcon,
    daycare: DoggyDayCareIcon,
    'house-sitting': HouseSittingIcon,
    default: BoardingIcon,
};

type ServiceID = 'boarding_sitter' | 'walking' | 'drop_in' | 'day_care' | 'house_sitting_owner' | 'puppy_nanny';

interface ServiceConfig {
    id: ServiceID;
    enabled: boolean;
    iconKey: string;
    header: {
        translationKey: string;
        defaultText: string;
    } | null;
    search: {
        nameKey: string;
        descKey: string;
        itemTitleKey: string;
    } | null;
    sitterPage: {
        nameKey: string;
        descKey: string;
        highlightKey?: string;
    } | null;
}

const ALL_SERVICES_CONFIG: Record<ServiceID, ServiceConfig> = {
    boarding_sitter: {
        id: 'boarding_sitter',
        enabled: true,
        iconKey: 'boarding',
        header: { translationKey: 'header.services.boarding', defaultText: 'Передержка' },
        search: { nameKey: 'SearchSitter.tabs.service1.name', descKey: 'SearchSitter.tabs.service1.description', itemTitleKey: 'SearchSitter.itemTitle.service1' },
        sitterPage: { nameKey: 'sitterServices.boarding.title', descKey: 'sitterServices.boarding.desc', highlightKey: 'sitterServices.boarding.highlight' }
    },
    walking: {
        id: 'walking',
        enabled: false, // <-- ЭТА УСЛУГА ВЫКЛЮЧЕНА, ОНА ПОПАДЕТ В "СКОРО БУДУТ"
        iconKey: 'walking',
        header: { translationKey: 'header.services.walking', defaultText: 'Выгул' },
        search: { nameKey: 'SearchSitter.tabs.service2.name', descKey: 'SearchSitter.tabs.service2.description', itemTitleKey: 'SearchSitter.itemTitle.service2' },
        sitterPage: { nameKey: 'sitterServices.walking.title', descKey: 'sitterServices.walking.desc' }
    },
    drop_in: {
        id: 'drop_in',
        enabled: false,
        iconKey: 'homevisits',
        header: null,
        search: { nameKey: 'SearchSitter.tabs.service3.name', descKey: 'SearchSitter.tabs.service3.description', itemTitleKey: 'SearchSitter.itemTitle.service3' },
        sitterPage: { nameKey: 'sitterServices.homevisits.title', descKey: 'sitterServices.homevisits.desc' }
    },
    day_care: {
        id: 'day_care',
        enabled: false, // <-- ЭТА УСЛУГА ВЫКЛЮЧЕНА, ОНА ПОПАДЕТ В "СКОРО БУДУТ"
        iconKey: 'daycare',
        header: { translationKey: 'header.services.daycare', defaultText: 'Дневной присмотр' },
        search: { nameKey: 'SearchSitter.tabs.service4.name', descKey: 'SearchSitter.tabs.service4.description', itemTitleKey: 'SearchSitter.itemTitle.service4' },
        sitterPage: { nameKey: 'sitterServices.daycare.title', descKey: 'sitterServices.daycare.desc' }
    },
    house_sitting_owner: {
        id: 'house_sitting_owner',
        enabled: false,
        iconKey: 'house-sitting',
        header: { translationKey: 'header.services.houseSitting', defaultText: 'Присмотр на дому' },
        search: { nameKey: 'SearchSitter.tabs.service5.name', descKey: 'SearchSitter.tabs.service5.description', itemTitleKey: 'SearchSitter.itemTitle.service5' },
        sitterPage: null
    },
    puppy_nanny: {
        id: 'puppy_nanny',
        enabled: false,
        iconKey: 'default',
        header: { translationKey: 'header.services.puppyNanny', defaultText: 'Няня для щенка' },
        search: null,
        sitterPage: null
    }
};

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
        IconComponent: serviceIconMap[service.iconKey] || serviceIconMap.default,
    }));

export const enabledServicesForSitterPage = Object.values(ALL_SERVICES_CONFIG)
    .filter(service => service.enabled && service.sitterPage)
    .map(service => ({
        id: service.id,
        IconComponent: serviceIconMap[service.iconKey] || serviceIconMap.default,
        ...service.sitterPage!,
    }));

// --- НОВЫЙ ЭКСПОРТ ДЛЯ ПОЛУЧЕНИЯ СПИСКА БУДУЩИХ УСЛУГ ---
export const comingSoonServices = Object.values(ALL_SERVICES_CONFIG)
    .filter(service => !service.enabled && service.search) // Логика: сервис выключен, но у него есть конфигурация для поиска
    .map(service => ({
        nameKey: service.search!.nameKey,
    }));

export const config = {
    enablePhoneAuth: false,
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