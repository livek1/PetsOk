// --- File: src/app/layout.tsx ---
import type { Metadata } from 'next';
import Script from 'next/script';
import Providers from '../components/Providers';
import { raleway } from '../fonts';
import '@/style/globals/resets.scss';
import '@/style/globals/global.scss';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';

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
        {/* ============================================================ */}
        {/* АНАЛИТИКА: Google, Yandex Metrika, Top.Mail.Ru               */}
        {/* ============================================================ */}

        {/* Google Analytics (gtag) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18003469103"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer ||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18003469103');
          `}
        </Script>

        {/* Yandex.Metrika */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function (m, e, t, r, i, k, a) {
              m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
              m[i].l = 1 * new Date();
              for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
              k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
            })
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(83993986, "init", {
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true
            });
          `}
        </Script>

        {/* Top.Mail.Ru */}
        <Script id="top-mail-ru" strategy="afterInteractive">
          {`
            var _tmr = window._tmr || (window._tmr =[]);
            _tmr.push({ id: "3742805", type: "pageView", start: (new Date()).getTime() });
            (function (d, w, id) {
              if (d.getElementById(id)) return;
              var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
              ts.src = "https://top-fwz1.mail.ru/js/code.js";
              var f = function () { var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s); };
              if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
            })(document, window, "tmr-code");
          `}
        </Script>

        {/* Noscript Fallbacks (Для тех, у кого отключен JS) */}
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/83993986" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
        <noscript>
          <div>
            <img src="https://top-fwz1.mail.ru/counter?id=3742805;js=na" style={{ position: 'absolute', left: '-9999px' }} alt="Top.Mail.Ru" />
          </div>
        </noscript>
        {/* ============================================================ */}

        <Providers>
          <main>
            {children}
          </main>
          <CookieConsentBanner />
          <div id="modal-root"></div>
          <div id="dropdown-root"></div>
        </Providers>
      </body>
    </html>
  );
}