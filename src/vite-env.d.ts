/// <reference types="vite/client" />

// Декларация для Moment.js локали
declare module 'moment/locale/ru';

// Декларация для Lottie файлов
declare module '*.lottie' {
    const content: string;
    export default content;
}

// Глобальная переменная AppMetrica
declare var AppMetrica: any;

// Фикс для NodeJS.Timeout в браузере
declare namespace NodeJS {
    type Timeout = any;
}

// Фикс для Laravel Echo
declare module 'laravel-echo' {
    const Echo: any;
    export default Echo;
}