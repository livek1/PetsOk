// --- File: src/config/appConfig.ts ---

import { FC } from 'react';

// Импортируем все компоненты иконок
import BoardingIcon from '../components/icons/BoardingIcon';
import DogWalkingIcon from '../components/icons/DogWalkingIcon';
import DropInVisitsIcon from '../components/icons/DropInVisitsIcon';
import DoggyDayCareIcon from '../components/icons/DoggyDayCareIcon';
import HouseSittingIcon from '../components/icons/HouseSittingIcon';

const serviceIconMap: Record<string, FC<any>> = {
    boarding: BoardingIcon,
    walking: DogWalkingIcon,
    homevisits: DropInVisitsIcon,
    daycare: DoggyDayCareIcon,
    'house-sitting': HouseSittingIcon,
    default: BoardingIcon,
};

// Исправленные ключи согласно ответу API
type ServiceID = 'boarding' | 'walking' | 'drop_in_visit' | 'doggy_day_care' | 'house_sitting' | 'puppy_nanny';

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

// ВАЖНО: Ключи объекта и поля id теперь совпадают с ответом API
const ALL_SERVICES_CONFIG: Record<ServiceID, ServiceConfig> = {
    boarding: { // Было boarding_sitter
        id: 'boarding',
        enabled: true,
        iconKey: 'boarding',
        header: { translationKey: 'header.services.boarding', defaultText: 'Передержка' },
        search: { nameKey: 'SearchSitter.tabs.service1.name', descKey: 'SearchSitter.tabs.service1.description', itemTitleKey: 'SearchSitter.itemTitle.service1' },
        sitterPage: { nameKey: 'sitterServices.boarding.title', descKey: 'sitterServices.boarding.desc', highlightKey: 'sitterServices.boarding.highlight' }
    },
    walking: {
        id: 'walking',
        enabled: true,
        iconKey: 'walking',
        header: { translationKey: 'header.services.walking', defaultText: 'Выгул' },
        search: { nameKey: 'SearchSitter.tabs.service2.name', descKey: 'SearchSitter.tabs.service2.description', itemTitleKey: 'SearchSitter.itemTitle.service2' },
        sitterPage: { nameKey: 'sitterServices.walking.title', descKey: 'sitterServices.walking.desc' }
    },
    drop_in_visit: { // Было drop_in
        id: 'drop_in_visit',
        enabled: true,
        iconKey: 'homevisits',
        header: null, // Обычно визиты не выносят в хедер, но если нужно - добавьте
        search: { nameKey: 'SearchSitter.tabs.service3.name', descKey: 'SearchSitter.tabs.service3.description', itemTitleKey: 'SearchSitter.itemTitle.service3' },
        sitterPage: { nameKey: 'sitterServices.homevisits.title', descKey: 'sitterServices.homevisits.desc' }
    },
    doggy_day_care: { // Было day_care
        id: 'doggy_day_care',
        enabled: true,
        iconKey: 'daycare',
        header: { translationKey: 'header.services.daycare', defaultText: 'Дневной присмотр' },
        search: { nameKey: 'SearchSitter.tabs.service4.name', descKey: 'SearchSitter.tabs.service4.description', itemTitleKey: 'SearchSitter.itemTitle.service4' },
        sitterPage: { nameKey: 'sitterServices.daycare.title', descKey: 'sitterServices.daycare.desc' }
    },
    // Дополнительные услуги, которых может не быть в активных, но они есть в коде
    house_sitting: {
        id: 'house_sitting',
        enabled: false,
        iconKey: 'house-sitting',
        header: { translationKey: 'header.services.houseSitting', defaultText: 'Присмотр дома' },
        search: { nameKey: 'SearchSitter.tabs.service5.name', descKey: 'SearchSitter.tabs.service5.description', itemTitleKey: 'SearchSitter.itemTitle.service5' },
        sitterPage: { nameKey: 'sitterServices.housevisits.title', descKey: 'sitterServices.homevisits.desc' }
    },
    puppy_nanny: {
        id: 'puppy_nanny',
        enabled: false,
        iconKey: 'default',
        header: null,
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

export const comingSoonServices = Object.values(ALL_SERVICES_CONFIG)
    .filter(service => !service.enabled && service.search)
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
    // Дефолтные ссылки, если конфиг еще не загрузился
    appStoreUrl: "https://apps.apple.com/app/example",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.example",
    appUniversalUrl: "https://petsok.ru/app",
};