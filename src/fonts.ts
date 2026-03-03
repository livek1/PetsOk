import localFont from 'next/font/local'

export const raleway = localFont({
    src: [
        { path: '../public/fonts/raleway-v37-cyrillic_latin-regular.woff2', weight: '400', style: 'normal' },
        { path: '../public/fonts/raleway-v37-cyrillic_latin-500.woff2', weight: '500', style: 'normal' },
        { path: '../public/fonts/raleway-v37-cyrillic_latin-700.woff2', weight: '700', style: 'normal' },
        { path: '../public/fonts/raleway-v37-cyrillic_latin-800.woff2', weight: '800', style: 'normal' },
    ],
    variable: '--font-raleway',
    display: 'swap',
})