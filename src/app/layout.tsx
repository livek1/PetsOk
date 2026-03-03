// --- File: src/app/layout.tsx ---
import type { Metadata } from 'next';
import Providers from '../components/Providers';
import { raleway } from '../fonts';
import '@/style/globals/resets.scss';
import '@/style/globals/global.scss';

export const metadata: Metadata = {
  metadataBase: new URL('https://petsok.ru'),

  title: 'PetsOk – Надежный сервис передержки и выгула собак',
  description: 'Найдите проверенного догситтера или выгульщика в вашем районе. Забота о питомцах как дома.',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    url: 'https://petsok.ru',
    siteName: 'PetsOk',
    images: [{ url: '/images/social-preview-home.jpg' }],
  },

  // Указываем только те иконки, которые реально есть в папке public
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    // Если файла apple-touch-icon.png тоже нет, просто удалите этот блок `apple`
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preload" href="/fonts/raleway-v37-cyrillic_latin-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>

      <body className={raleway.variable} suppressHydrationWarning>
        <Providers>
          <main>
            {children}
          </main>

          <div id="modal-root"></div>
          <div id="dropdown-root"></div>
        </Providers>
      </body>
    </html>
  );
}