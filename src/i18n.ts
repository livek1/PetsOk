// --- File: i18n.ts ---
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Предполагается, что эти файлы будут созданы для других языков
// import { legalContentEn } from "./i18n/content/en"; 
// import { legalContentKk } from "./i18n/content/kk";

const savedLanguage = localStorage.getItem("language") || "ru";

// Определение поддерживаемых языков для Language.tsx
export const supportedLngs = [
  { code: 'ru', name: 'Русский', region: 'Россия' },
  { code: 'en', name: 'English', region: 'United States' },
  { code: 'kk', name: 'Қазақша', region: 'Қазақстан' },
];

// --- ТЕКСТЫ ЮРИДИЧЕСКИХ ДОКУМЕНТОВ ---

export const legalContentRu = {
  terms: {
    title: "Пользовательское соглашение сервиса PetsOk",
    updateDate: "Дата последнего обновления: 8 июня 2025 г.",

    // Основной контент в виде массива для сохранения порядка
    content: [
      { type: 'h2', text: "1. Введение и общие положения" },
      { type: 'p', text: "1.1. Добро пожаловать в PetsOk! Настоящее Пользовательское соглашение (далее – «Соглашение») является юридически обязывающим договором между вами (далее – «Пользователь», «вы») и Индивидуальным предпринимателем Гороховым Александром Олеговичем (ОГРНИП 324554300038584, ИНН 551405007273) (далее – «PetsOk», «Сервис», «мы»). Соглашение регулирует использование вами нашей технологической платформы, включая веб-сайт petsok.ru (далее – «Сайт»), мобильные приложения и все связанные с ними услуги (совместно – «Сервис»)." },
      { type: 'p', text: "1.2. <strong>Принятие Условий.</strong> Регистрируясь на Сайте, устанавливая мобильное приложение или иным образом используя Сервис, вы подтверждаете, что полностью прочитали, поняли и безоговорочно принимаете все условия настоящего Соглашения и нашей Политики конфиденциальности, которая является неотъемлемой частью данного Соглашения. Если вы не согласны с какими-либо из этих условий, вы должны немедленно прекратить использование Сервиса." },
      { type: 'p', text: "1.3. <strong>Изменение Условий.</strong> PetsOk оставляет за собой право в одностороннем порядке изменять или дополнять настоящее Соглашение в любое время. Мы можем уведомить вас о существенных изменениях по электронной почте или через интерфейс Сервиса, однако ваша обязанность – регулярно проверять актуальную версию Соглашения, размещенную на Сайте. Новая версия Соглашения вступает в силу с момента ее публикации. Ваше дальнейшее использование Сервиса означает полное согласие с новой редакцией." },
      { type: 'p', text: "1.4. <strong>Статус Сервиса.</strong> PetsOk является технологической онлайн-платформой, которая предоставляет независимым поставщикам услуг по уходу за животными («Ситтерам») и владельцам домашних животных («Владельцам») инструменты для поиска, коммуникации и организации оказания услуг. <strong>PetsOk не является агентством по найму, не предоставляет услуги по уходу за животными напрямую и не является стороной соглашений, заключаемых между Владельцами и Ситтерами.</strong>" },

      { type: 'h2', text: "2. Регистрация учетной записи" },
      { type: 'p', text: "2.1. Для доступа к полному функционалу Сервиса Пользователь должен создать учетную запись. Регистрация доступна только лицам, достигшим 18 лет." },
      { type: 'p', text: "2.2. При регистрации вы обязуетесь предоставить точную, полную и актуальную информацию. Вы несете ответственность за поддержание актуальности этих данных. Предоставление недостоверной информации может послужить основанием для приостановки или прекращения действия вашей учетной записи." },
      { type: 'p', text: "2.3. Вы несете исключительную ответственность за сохранение конфиденциальности вашего пароля и за все действия, которые происходят под вашей учетной записью. Вы соглашаетесь немедленно уведомить PetsOk о любом несанкционированном использовании вашего аккаунта." },
      { type: 'p', text: "2.4. Каждому Пользователю разрешено иметь только одну учетную запись. Создание нескольких аккаунтов одним лицом может привести к блокировке всех связанных учетных записей." },

      { type: 'h2', text: "3. Правила использования Сервиса" },
      { type: 'p', text: "3.1. Используя Сервис, вы соглашаетесь действовать добросовестно и в соответствии с применимым законодательством и правилами настоящего Соглашения." },
      { type: 'p', text: "3.2. <strong>Запрещенные действия.</strong> На Сервисе строго запрещается: Публиковать заведомо ложную, вводящую в заблуждение, клеветническую или оскорбительную информацию; Использовать Сервис для любых незаконных целей, включая мошенничество; Размещать спам, несанкционированную рекламу сторонних сервисов или вредоносное программное обеспечение; Предлагать или запрашивать уход за экзотическими, дикими или агрессивными животными, а также животными, содержание которых запрещено законом; Предпринимать любые действия, которые могут нарушить нормальную работу Сервиса или создать необоснованно высокую нагрузку на его инфраструктуру." },

      { type: 'h2', text: "4. Обязательства Пользователей" },
      { type: 'p', text: "4.1. <strong>Обязательства Владельца:</strong> Вы несете полную ответственность за оценку и выбор Ситтера; Вы гарантируете, что ваш питомец здоров, имеет все необходимые прививки и не представляет опасности; Вы обязаны честно сообщить Ситтеру обо всех особенностях питомца." },
      { type: 'p', text: "4.2. <strong>Обязательства Ситтера:</strong> Вы обязуетесь предоставлять услуги качественно и безопасно; Вы являетесь независимым исполнителем и самостоятельно несете ответственность за уплату налогов со своего дохода; Вы соглашаетесь с финансовыми условиями платформы, доступными в вашем личном кабинете." },

      { type: 'h2', text: "5. Финансовые условия и расчеты" },
      { type: 'p', text: "5.1. <strong>Стоимость Услуг Ситтера.</strong> Цены на услуги по уходу за животными устанавливаются исключительно Ситтерами." },
      { type: 'p', text: "5.2. <strong>Механизм оплаты.</strong> Конкретный порядок и условия оплаты для каждого заказа четко указываются на странице оформления Бронирования до момента совершения платежа." },
      { type: 'p', text: "5.3. <strong>Возможные модели оплаты:</strong> Полная оплата через Сервис; Частичная предоплата через Сервис; Прямой расчет (при наличии у Ситтера специального тарифа или подписки)." },
      { type: 'p', text: "5.4. <strong>Обязательное использование платформы.</strong> Все финансовые расчеты за услуги, найденные с помощью PetsOk, должны проводиться через инструменты Сервиса. <strong>Любые договоренности об оплате в обход платформы являются грубым нарушением и могут привести к немедленной блокировке.</strong>" },
      { type: 'p', text: "5.5. <strong>График выплат.</strong> Выплаты доходов Ситтерам, полученных через Сервис, производятся еженедельно. Мы обрабатываем доход за прошедшую неделю и инициируем перевод каждый понедельник." },
      { type: 'p', text: "5.6. <strong>Безопасность карт.</strong> Мы не храним данные ваших карт. Все платежи обрабатываются через сертифицированного платежного партнера." },

      { type: 'h2', text: "6. Пользовательский контент" },
      { type: 'p', text: "6.1. <strong>Ваша ответственность.</strong> Вы несете полную ответственность за все тексты, фотографии, видео и другие материалы («Контент»), которые вы загружаете или передаете другим пользователям через Сервис, <strong>включая личные чаты</strong>." },
      { type: 'p', text: "6.2. <strong>Лицензия для PetsOk.</strong> Загружая Контент, вы предоставляете PetsOk неисключительную, безвозмездную лицензию на его использование для функционирования и продвижения Сервиса." },

      { type: 'h2', text: "7. Ограничение ответственности PetsOk" },
      { type: 'p', text: "7.1. Сервис предоставляется 'как есть'. Мы не несем ответственности за действия пользователей, качество услуг Ситтеров или любые возникшие между пользователями споры и ущерб." },
      { type: 'p', text: "7.2. Наша максимальная ответственность перед вами в любом случае ограничена суммой, уплаченной вами Сервису за последние 12 месяцев, но не может превышать 5 000 (пять тысяч) рублей." },

      { type: 'h2', text: "8. Разрешение споров и реквизиты" },
      { type: 'p', text: "8.1. Все споры будут решаться в соответствии с законодательством Российской Федерации в суде по месту нахождения нашей компании." },
      { type: 'p', text: "8.2. <strong>Реквизиты:</strong> Индивидуальный предприниматель Горохов Александр Олегович. ОГРНИП: 324554300038584, ИНН: 551405007273. Для связи: contact@petsok.ru" },
    ]
  },
  privacy: {
    title: "Политика конфиденциальности",
    updateDate: "Дата последнего обновления: 8 июня 2025 г.",


    // Основной контент
    content: [
      { type: 'p', text: "Мы в PetsOk серьезно относимся к вашей конфиденциальности. Эта политика объясняет, какую личную информацию мы собираем и как мы ее используем, чтобы сделать наш сервис лучше и безопаснее для вас и ваших питомцев." },

      { type: 'h2', text: "1. Какие данные мы собираем" },
      { type: 'p', text: "Чтобы предоставлять и улучшать наш Сервис, мы собираем следующие типы данных:" },
      { type: 'p', text: "<strong>1.1. Данные, которые вы предоставляете нам напрямую:</strong>" },
      { type: 'p', text: "• <strong>Регистрационные данные:</strong> Ваше имя, адрес электронной почты, номер телефона, пароль (в зашифрованном виде)." },
      { type: 'p', text: "• <strong>Данные профиля:</strong> Фотографии, описание вашего опыта (для ситтеров), информация о ваших питомцах (для владельцев), адрес проживания и другая информация, которую вы добавляете в свой профиль." },
      { type: 'p', text: "• <strong>Платежная информация:</strong> Мы не храним полные данные вашей банковской карты. При оплате вы взаимодействуете напрямую с нашим сертифицированным платежным партнером. Мы можем хранить только маскированный номер карты (например, последние 4 цифры) для вашего удобства." },
      { type: 'p', text: "• <strong>Данные переписки:</strong> Сообщения, фотографии и видео, которыми вы обмениваетесь с другими пользователями в чатах нашего Сервиса. Мы анализируем эту коммуникацию для обеспечения безопасности и предотвращения мошенничества." },
      { type: 'p', text: "<strong>1.2. Данные, которые мы собираем автоматически:</strong>" },
      { type: 'p', text: "• <strong>Техническая информация:</strong> IP-адрес, тип браузера и устройства, операционная система, данные о сбоях, время посещения страниц. Эти данные помогают нам улучшать техническую работу Сервиса." },
      { type: 'p', text: "• <strong>Данные о местоположении:</strong> Мы можем определять ваше примерное местоположение по IP-адресу или запрашивать доступ к точному местоположению вашего устройства для корректной работы поиска ситтеров." },

      { type: 'h2', text: "2. Как мы используем ваши данные" },
      { type: 'p', text: "Мы используем собранную информацию для следующих целей:" },
      { type: 'p', text: "• <strong>Для предоставления услуг:</strong> Чтобы вы могли находить ситтеров, общаться, бронировать услуги и получать оплату." },
      { type: 'p', text: "• <strong>Для обеспечения безопасности:</strong> Для проверки пользователей, предотвращения мошенничества и нарушений наших правил." },
      { type: 'p', text: "• <strong>Для поддержки пользователей:</strong> Чтобы отвечать на ваши вопросы и решать возникающие проблемы." },
      { type: 'p', text: "• <strong>Для улучшения Сервиса:</strong> Мы анализируем, как вы используете наш Сервис, чтобы делать его удобнее, быстрее и полезнее." },
      { type: 'p', text: "• <strong>Для маркетинга и продвижения:</strong> Мы можем использовать публичную информацию из вашего профиля (например, фото, имя, отзывы), а также некоторые обезличенные или публичные материалы (например, удачные фото питомцев из отзывов) для рекламы нашего Сервиса в социальных сетях и других каналах." },

      { type: 'h2', text: "3. Кому мы можем передавать ваши данные" },
      { type: 'p', text: "Мы не продаем ваши личные данные. Мы можем передавать их третьим лицам только в следующих случаях:" },
      { type: 'p', text: "• <strong>Другим пользователям Сервиса:</strong> Часть информации из вашего профиля (имя, фото, отзывы) видна другим пользователям для обеспечения работы Сервиса. Ваши полные контактные данные (телефон, email) становятся доступны другой стороне только после подтверждения бронирования." },
      { type: 'p', text: "• <strong>Сервисным провайдерам:</strong> Мы пользуемся услугами проверенных партнеров для обработки платежей, хостинга данных, отправки email-рассылок и аналитики. Они получают доступ только к той информации, которая необходима им для выполнения своих функций, и обязаны защищать ее." },
      { type: 'p', text: "• <strong>По требованию закона:</strong> Мы можем раскрыть ваши данные по запросу правоохранительных органов или суда в соответствии с законодательством." },

      { type: 'h2', text: "4. Файлы cookie" },
      { type: 'p', text: "Мы используем файлы cookie — небольшие текстовые файлы, которые хранятся на вашем устройстве. Они помогают нам запоминать ваши настройки (например, язык), обеспечивать работу функции «входа в систему» и собирать аналитику об использовании сайта. Подробнее о том, какие cookie мы используем, вы можете прочитать в нашей <a href='/cookie-policy'>Политике в отношении файлов Cookie</a>." },

      { type: 'h2', text: "5. Безопасность и хранение данных" },
      { type: 'p', text: "Мы принимаем все разумные технические и организационные меры для защиты ваших данных от несанкционированного доступа, изменения или уничтожения. Ваши данные хранятся на защищенных серверах. Мы храним вашу информацию до тех пор, пока у вас есть аккаунт на PetsOk, а также в течение некоторого периода после его удаления, если это требуется для соблюдения законодательства или разрешения споров." },

      { type: 'h2', text: "6. Ваши права" },
      { type: 'p', text: "Вы имеете право:" },
      { type: 'p', text: "• Получать доступ к своим личным данным, которые мы храним." },
      { type: 'p', text: "• Исправлять и обновлять свои данные в настройках профиля." },
      { type: 'p', text: "• Запросить удаление своей учетной записи и связанных с ней данных (за исключением информации, которую мы обязаны хранить по закону)." },
      { type: 'p', text: "• Отозвать свое согласие на обработку данных в случаях, когда обработка основана на согласии." },

      { type: 'h2', text: "7. Контактная информация" },
      { type: 'p', text: "Если у вас есть вопросы по поводу этой Политики или вы хотите реализовать свои права, пожалуйста, свяжитесь с нами по адресу: <strong>contact@petsok.ru</strong>" },
      { type: 'p', text: "<strong>Оператор данных:</strong> Индивидуальный предприниматель Горохов Александр Олегович, ОГРНИП 324554300038584, ИНН 551405007273." }
    ]
  },
  cookie: {
    title: "Политика в отношении файлов Cookie",
    updateDate: "Дата последнего обновления: 8 июня 2025 г.",


    // Основной контент
    content: [
      { type: 'h2', text: "1. Что такое файлы cookie?" },
      { type: 'p', text: "Как и большинство профессиональных веб-сайтов, наш Сервис PetsOk использует файлы cookie. Это небольшие текстовые файлы, которые загружаются на ваше устройство (компьютер или мобильный телефон), когда вы посещаете сайт. Они помогают сайту «запоминать» вас и ваши предпочтения, чтобы сделать ваше следующее посещение более удобным и персонализированным." },
      { type: 'p', text: "В этой политике мы объясняем, какую информацию собирают cookie, как мы ее используем и почему их хранение необходимо для работы некоторых функций Сервиса." },

      { type: 'h2', text: "2. Как мы используем файлы cookie" },
      { type: 'p', text: "Мы используем файлы cookie для множества целей, описанных ниже. К сожалению, в большинстве случаев не существует стандартных способов отключить cookie без частичного или полного отключения функциональности, которую они добавляют на сайт. Мы рекомендуем оставлять все файлы cookie включенными, если вы не уверены, нужны они вам или нет, так как они могут быть необходимы для предоставления услуг, которыми вы пользуетесь." },

      { type: 'h2', text: "3. Типы файлов cookie, которые мы используем" },
      { type: 'p', text: "<strong>• Строго необходимые cookie:</strong> Эти файлы cookie абсолютно необходимы для работы основных функций нашего Сервиса. Без них вы не сможете войти в свою учетную запись, оформить бронирование или использовать другие ключевые возможности. Они не собирают информацию о вас для маркетинговых целей." },
      { type: 'p', text: "<strong>• Функциональные cookie:</strong> Эти файлы cookie позволяют нам запоминать ваш выбор, чтобы сделать использование Сервиса более удобным. Например, мы можем запомнить выбранный вами язык или регион. Информация, которую они собирают, может быть анонимной." },
      { type: 'p', text: "<strong>• Аналитические и эксплуатационные cookie:</strong> Эти файлы cookie помогают нам понять, как посетители используют наш сайт. Мы собираем информацию о количестве посетителей, страницах, которые они просматривают, и времени, проведенном на сайте. Это помогает нам анализировать и улучшать работу Сервиса. Вся информация собирается анонимно." },
      { type: 'p', text: "<strong>• Маркетинговые cookie:</strong> Эти файлы cookie могут использоваться для показа вам релевантной рекламы наших услуг на других сайтах и в социальных сетях. Они отслеживают ваши визиты на наш сайт, посещенные страницы и ссылки, по которым вы переходили. Мы можем делиться этой информацией с нашими рекламными партнерами." },

      { type: 'h2', text: "4. Сторонние файлы cookie" },
      { type: 'p', text: "В некоторых случаях мы также используем файлы cookie, предоставляемые доверенными третьими сторонами. Например:" },
      { type: 'p', text: "• Мы используем сервисы веб-аналитики, такие как Google Analytics и Яндекс.Метрика, чтобы собирать анонимную статистику о посещениях. Это помогает нам понять нашу аудиторию и улучшить Сервис." },
      { type: 'p', text: "• При использовании кнопок социальных сетей или виджетов на нашем сайте, эти социальные сети (например, ВКонтакте, Telegram) могут устанавливать свои собственные файлы cookie через наш сайт." },

      { type: 'h2', text: "5. Как вы можете управлять файлами cookie" },
      { type: 'p', text: "Вы можете управлять файлами cookie или удалить их по своему желанию. Большинство веб-браузеров позволяют вам настроить прием cookie через настройки браузера. Вы можете настроить свой браузер так, чтобы он блокировал все cookie или предупреждал вас перед их сохранением." },
      { type: 'p', text: "<strong>Обратите внимание:</strong> отключение строго необходимых файлов cookie может привести к тому, что вы не сможете использовать некоторые важные функции нашего Сервиса, такие как вход в аккаунт или создание бронирования." },
      { type: 'p', text: "Для получения дополнительной информации о том, как управлять файлами cookie, вы можете посетить сайт <a href='https://www.aboutcookies.org' target='_blank' rel='noopener noreferrer'>www.aboutcookies.org</a>." },

      { type: 'h2', text: "6. Изменения в Политике" },
      { type: 'p', text: "Мы можем время от времени обновлять эту Политику. Мы рекомендуем вам периодически просматривать эту страницу, чтобы быть в курсе любых изменений." },
      { type: 'p', text: "Если у вас есть вопросы, свяжитесь с нами по адресу: <strong>contact@petsok.ru</strong>" },
    ]
  }
};

const legalContentEn = {
  terms: {
    title: "Terms of Service",
    p1: "Content for the Terms of Service page will be added here soon."
  },
  privacy: {
    title: "Privacy Policy",
    p1: "Content for the Privacy Policy page will be added here soon."
  },
  cookie: {
    title: "Cookie Policy",
    p1: "Content for the Cookie Policy page will be added here soon."
  }
};

const legalContentKk = {
  terms: {
    title: "Пайдалану шарттары",
    p1: "Пайдалану шарттары бетінің мазмұны жақын арада қосылады."
  },
  privacy: {
    title: "Құпиялылық саясаты",
    p1: "Құпиялылық саясаты бетінің мазмұны жақын арада қосылады."
  },
  cookie: {
    title: "Cookie саясаты",
    p1: "Cookie саясаты бетінің мазмұны жақын арада қосылады."
  }
};


i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        // --- ОБЩИЕ ---
        loading: "Loading...",
        common: {
          continue: "Continue",
          confirm: "Confirm",
          close: "Close",
        },
        recomLang: "Recommended languages and regions",

        // --- SEO МЕТА-ТЕГИ ---
        seo: {
          html_lang: "en",
          home: {
            title: "PetsOk – Trusted Pet Sitting & Dog Walking Services",
            description: "Find a vetted pet sitter or dog walker near you. Loving, in-home care for your pets. Peace of mind for you, happiness for them. Book with PetsOk today!"
          },
          becomeASitter: {
            title: "Become a Pet Sitter & Earn Money with PetsOk | 0% Commission",
            description: "Join PetsOk to offer pet sitting, dog walking, and daycare services. Set your own schedule, rates, and enjoy 0% commission. Start your pet care business today!"
          }
        },

        // --- ФУТЕР ---
        footer: {
          copyright: "All rights reserved.",
          legal: {
            terms: "Terms of Use",
            privacy: "Privacy Policy",
            cookies: "Cookie Policy"
          }
        },

        // --- COOKIE BANNER ---
        cookieConsent: {
          text: "We use cookies to improve your experience on our website. By staying on the site, you agree to our ",
          policyLink: "Privacy and Cookie Policy",
          acceptButton: "Got it"
        },

        // --- ЮРИДИЧЕСКИЙ КОНТЕНТ ---
        legalContent: legalContentEn,

        // --- ХЕДЕР ---
        header: {
          link1: "Why PetsOk?",
          link2: "Find Your Sitter",
          buttonText: "Become a Sitter",
          findService: "Find a Service",
          help: "Help",
          becomeSitter: "Become a Sitter",
          register: "Sign Up",
          login: "Log In",
          language: "Language",
          welcomeUserShort: "Hi, {{name}}!",
          logout: "Log Out",
          cabinet: {
            profile: "My Profile",
            orders: "My Orders",
            sitterPanel: "Sitter Panel"
          },
          services: {
            boarding: "Boarding",
            walking: "Dog Walking",
            daycare: "Day Care",
            houseSitting: "House Sitting",
            puppyNanny: "Puppy Nanny",
          },
          logoAriaLabel: 'PetsOk to Homepage',
          changeLanguageAriaLabel: 'Change language',
          userMenuAriaLabel: 'User menu',
          openMenuAriaLabel: 'Open menu',
          closeMenuAriaLabel: 'Close menu',
          mobileMenuHeading: 'Mobile Menu'
        },

        // --- ПОПАП ПОЛЬЗОВАТЕЛЯ ---
        profile: {
          profile: "Profile",
          settings: "Settings",
          help: "Help & Support",
          logIn: "Sign In",
          signIn: "Sign Up",
          logInTitle: "Sign in or register",
          logout: "Log Out",
          email: "Email",
          password: "Password",
          btn: "Sign In",
          forgot: "Forgot your password?",
          forgotAirbnb: "Forgot password?",
          links: "Don't forget to follow us",
        },
        userRoles: {
          sitter: "Sitter",
        },

        // --- МОДАЛЬНОЕ ОКНО ЯЗЫКА ---
        languageModal: {
          selectLanguage: "Select a language",
          close: "Close",
          allLanguages: "All languages and regions",
          noLanguages: "Language list is empty."
        },

        // --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ И РЕГИСТРАЦИИ ---
        authModal: {
          defaultTitle: 'Authentication',
          contactEntry: {
            titleAirbnb: "Welcome to PetsOk"
          },
          contactPlaceholderAirbnb: 'Email or phone number',
          orDivider: 'or',
          continueWithGoogle: 'Continue with Google',
          continueWithApple: 'Continue with Apple',
          googleErrorNoCredential: 'Failed to get data from Google.',
          googleErrorGeneral: 'Google sign-in error.',
          appleErrorNoToken: 'Failed to get data from Apple.',
          appleErrorGeneral: 'Apple sign-in error.',
          appleCancelled: 'Apple sign-in cancelled by user.',
          otpTitleAirbnb: "Confirm your {{contactType}}",
          otpSubtitleAirbnb: "Enter the 4-digit code we sent to ",
          otpPlaceholderFourDigits: '----',
          finalRegisterTitleAirbnb: "Finish signing up",
          finalRegisterSubtitleAirbnb: "Just a few more details to get started.",
          fullNameLabelAirbnb: "Full name",
          fullNamePlaceholder: "John Doe",
          passwordLabelAirbnb: "Password",
          confirmPasswordLabelAirbnb: "Confirm password",
          loginTitlePassword: "Enter your password",
          resetPasswordTitle: "Create a new password",
          loginSubtitlePassword: "To log in, enter the password for the account ",
          resetPasswordSubtitleNew: "Create a new password for the account ",
          passwordLabel: "Password",
          newPasswordLabel: "New password",
          confirmPasswordLabel: "Confirm new password"
        },
        registration: {
          agreeToTermsPrefixAirbnb: "By selecting 'Agree and continue', I agree to PetsOk's ",
          termsAndConditionsAirbnb: "Terms of Service",
          paymentTermsAirbnb: "Payments Terms of Service",
          agreeToTermsSuffixAirbnb: ", and acknowledge the ",
          privacyPolicyMain: "Privacy Policy",
          submitting: "Registering...",
          submitButtonAirbnb: "Agree and continue",
        },
        login: {
          loggingIn: 'Logging in...',
        },
        resetPassword: {
          resetting: 'Resetting...',
          setNewPasswordButton: 'Set new password',
          notImplemented: "Password reset functionality is under development."
        },
        otp: {
          resending: "Resending...",
          resend: "Resend code",
        },

        // --- СООБЩЕНИЯ ВАЛИДАЦИИ ---
        validation: {
          contactRequired: "Please enter an email or phone number.",
          contactInvalid: "Invalid email or phone number format.",
          otpRequired: "Please enter the confirmation code.",
          otpMinLengthFour: "The code must be 4 digits long.",
          otpMaxLengthFour: "The code must be 4 digits long.",
          otpFourDigitsOnly: "The code must contain only 4 digits.",
          nameRequired: "Full name is required.",
          passwordRequired: "Password is required.",
          passwordMinLength: "Password must be at least 6 characters.",
          passwordMinLengthAirbnb: "Password must be at least 8 characters.",
          confirmPasswordRequired: "Password confirmation is required.",
          passwordsDoNotMatch: "Passwords do not match.",
          termsRequired: "You must agree to the terms and conditions to continue.",
          termsRequiredShort: "Agreement is required",
        },

        // --- ГЛАВНАЯ СТРАНИЦА (Home) ---
        SearchSitter: {
          tabs: {
            service1: { name: "Boarding at Sitter's", description: "Your pet will enjoy a cozy overnight stay at the sitter's home.", iconKey: "boardingIcon" },
            service2: { name: "Dog Walking", description: "Your dog will get a pleasant walk in your neighborhood.", iconKey: "walkingIcon" },
            service3: { name: "Drop-In Visits", description: "The sitter will stop by for feeding, playtime, and potty breaks.", iconKey: "dropInVisitIcon" },
            service4: { name: "Day Care at Sitter's", description: "Daytime fun for your dog at the sitter's home. Drop off in the AM, pick up in the PM!", iconKey: "dayNannyIcon" },
            service5: { name: "House Sitting (Your Home)", description: "The sitter will stay with your pet overnight in the comfort of your home.", iconKey: "houseSittingIcon" }
          },
          itemTitle: {
            service1: "Where to find boarding?",
            service2: "Where to find a dog walker?",
            service3: "Where to book drop-in visits?",
            service4: "Where to find doggy day care?",
            service5: "Where to find house sitting?"
          },
          searchSitter: { scrollLeft: "Scroll tabs left", scrollRight: "Scroll tabs right" }
        },
        hero: {
          welcome: "Trusted Pet Care, Just Like Home.",
          heroDescription: "Connect with vetted local sitters for loving, in-home pet care. Peace of mind for you, happiness for them. Find your perfect match with PetsOk.",
        },
        whyPetsOkNew: {
          sectionTitle: "Why is PetsOk the Best Choice for Your Pet?",
          sectionSubtitle: "We offer more than just pet sitting – we provide peace of mind through loving home care for your pet and unparalleled support for you.",
          servicesTitle: "Our Main Services",
          guaranteesTitle: "Our Commitments to You",
        },
        ourServices: {
          boarding: { title: "Boarding at Sitter's Home", desc: "A cozy, loving home environment for your pet while you're away." },
          houseSitting: { title: "Sitting in Your Home", desc: "Pet care in their familiar environment, plus looking after your home." },
          dropIn: { title: "Drop-In Visits", desc: "Short visits for feeding, potty breaks, and playtime in your home." },
          dayNanny: { title: "Doggy Day Care (at Sitter's)", desc: "Daytime fun, socialization, and care at the sitter's home." },
          walking: { title: "Dog Walking", desc: "Energetic walks tailored to your dog's needs and routine." }
        },
        ourGuarantees: {
          verifiedSitters: { title: "Verified & Trusted Sitters", desc: "Every sitter's profile is reviewed by our team to ensure quality and safety." },
          photoUpdates: { title: "Photo & Video Updates", desc: "Stay connected and see your pet's happiness with regular updates." },
          support: { title: "24/7 Customer Support", desc: "Our dedicated team is always ready to help you and your sitter." },
          securePayments: { title: "Secure & Easy Payments", desc: "Book and pay with confidence through our encrypted platform." }
        },
        howItWorksSimple: {
          sectionTitle: "Finding a Sitter is Easy: 3 Steps!",
          step1: { title: "Create a Request", desc: "Tell us about your pet and the service you need." },
          step2: { title: "Choose a Sitter", desc: "Browse profiles, read reviews, or simply wait for responses." },
          step3: { title: "Book and Relax!", desc: "Confirm the booking and enjoy peace of mind, knowing your pet is in good hands." }
        },
        mobileAppPromo: {
          sectionTitle: "Your pet in safe hands—anytime, anywhere with the PetsOk app!",
          sectionSubtitle: "Forget your worries! Our app is your personal key to a world of verified sitters, convenient booking, and complete control over your pet's well-being.",
          featuresTitle: "Why PetsOk on your phone is convenient:",
          features: {
            search: "Instantly find the perfect sitter",
            chat: "Directly message sitters anytime",
            photos: "Get photo and video updates of your pet",
            manage: "Manage your bookings in a few taps"
          },
          ctaText: "Give yourself peace of mind and your pet the best care. Download the PetsOk app now!",
          availabilityNote: "Free for iOS and Android",
          videoAlt: "Demonstration of PetsOk mobile app features",
          scanToDownloadStrong: "Scan",
          scanToDownloadRest: " and get started!"
        },
        mobileApp: {
          downloadIOS: "Download on the App Store",
          downloadIOSShort: "App Store",
          downloadAndroid: "Get it on Google Play",
          downloadAndroidShort: "Google Play"
        },
        // --- СТРАНИЦА "СТАТЬ СИТТЕРОМ" ---
        sitterHero: {
          title: "Earn money doing what you love",
          subtitle: "Become a pet sitter on PetsOk. Enjoy flexibility, 0% commission, and the joy of caring for pets.",
          ctaButton: "Get Started Now",
        },
        // --- НОВЫЙ БЛОК ПЕРЕВОДОВ ---
        sitterServices: {
          boarding: {
            title: "Pet Boarding",
            desc: "Host pets overnight in your home. The most popular and highest-earning service.",
            highlight: "Highest Earning Potential",
          },
          walking: {
            title: "Dog Walking",
            desc: "Offer walks that fit perfectly into your daily schedule.",
          },
          daycare: {
            title: "Doggy Day Care",
            desc: "Perfect if you work from home and love canine company.",
          },
          homevisits: {
            title: "Drop-In Visits",
            desc: "Visit pets in their own homes for feeding and playtime.",
          },
        },
        whyBecomeSitter: {
          sectionTitle: "Be Your Own Boss, With Paws",
          sectionSubtitle: "We provide the tools and support. You provide the love. Here’s why sitters choose PetsOk.",
          earnMore: {
            title: "Keep 100% of Your Earnings",
            desc: "That's right, 0% commission. The price you set is the price you get. Maximize your income from day one.",
          },
          flexible: {
            title: "Ultimate Flexibility",
            desc: "You are in control. Set your own schedule, services, and rates. Perfect as a side hustle or a full-time job.",
          },
          love: {
            title: "A Job Full of Joy",
            desc: "If you're a true animal lover, this is more than a job – it's a passion. Get paid for belly rubs and fetch.",
          },
          support: {
            title: "We've Got Your Back",
            desc: "From an easy-to-use app to 24/7 support, we're here to help you succeed and feel secure.",
          },
        },
        howItWorksSitterSteps: {
          sectionTitle: "Get Started in 3 Easy Steps",
          step1: {
            title: "Create Your Profile",
            desc: "Showcase your experience and love for pets. We'll help you create a profile that stands out.",
          },
          step2: {
            title: "Accept Your First Booking",
            desc: "You set your availability and rates. We'll send you requests from pet owners in your area.",
          },
          step3: {
            title: "Get Paid, Simple as That",
            desc: "Receive your payment directly to your bank account just two days after completing a service.",
          }
        },
        offerableServicesSection: {
          sectionTitle: "Offer a Variety of Services",
          sectionSubtitle: "You decide what services to offer. The more services you provide, the more opportunities you have to earn.",
          boarding: {
            title: "Pet Boarding",
            desc: "Host pets overnight in your home. Often the highest-earning service.",
            highlight: "Highest Earning Potential",
          },
          walking: {
            title: "Dog Walking",
            desc: "Offer walks that fit perfectly into your daily schedule.",
          },
          daycare: {
            title: "Doggy Day Care",
            desc: "Perfect if you work from home and love canine company.",
          },
          homevisits: {
            title: "Drop-In Visits",
            desc: "Visit pets in their own homes for feeding, playtime, and potty breaks.",
          },
        },
        supportSafety: {
          sectionTitle: "Your Success and Safety are Our #1 Priority",
          sectionSubtitle: "We’ve built a platform that pet lovers can trust.",
          support: {
            title: "24/7 Sitter Support",
            desc: "Our dedicated team is ready to help with any issue, from technical questions to emergencies.",
          },
          platform: {
            title: "A Secure, Trusted Platform",
            desc: "We use profile verification and secure online payments to help you feel confident and safe.",
          },
          community: {
            title: "A Strong Sitter Community",
            desc: "Connect with other sitters, share your experiences, find support, and get inspired.",
          },
          testimonial: {
            quote: "\"Thanks to PetsOk, I was able to turn my passion for dogs into a real business. The 0% commission is a game-changer!\"",
            author: "Anna K., Sitter on PetsOk"
          },
          imageAlt: "A confident pet sitter with a happy dog"
        },
        finalCtaSitter: {
          title: "Ready to start your journey with PetsOk?",
          subtitle: "Join thousands of sitters who are earning money, setting their own schedules, and doing what they love. Your next furry client is waiting!",
          cta: "Create Your Sitter Profile (It's Free!)"
        }
      },
    },
    ru: {
      translation: {
        // --- ОБЩИЕ ---
        loading: "Загрузка...",
        common: {
          continue: "Продолжить",
          confirm: "Подтвердить",
          close: "Закрыть",
        },
        recomLang: "Рекомендуемые языки и регионы",

        // --- SEO МЕТА-ТЕГИ ---
        seo: {
          html_lang: "ru",
          home: {
            title: "PetsOk: Поиск проверенных ситтеров для передержки и выгула",
            description: "Найдите проверенного догситтера или выгульщика в вашем районе. Заботливая передержка как дома, безопасные платежи и поддержка 24/7. Забронируйте на PetsOk."
          },
          becomeASitter: {
            title: "Стать ситтером и зарабатывать на PetsOk | 0% комиссии",
            description: "Присоединяйтесь к PetsOk, чтобы предлагать услуги передержки, выгула и дневного ухода за животными. Устанавливайте свой график, цены и получайте 100% дохода."
          }
        },

        // --- ФУТЕР ---
        footer: {
          copyright: "Все права защищены.",
          legal: {
            terms: "Условия использования",
            privacy: "Политика конфиденциальности",
            cookies: "Политика Cookie"
          }
        },

        // --- COOKIE BANNER ---
        cookieConsent: {
          text: "Мы используем файлы cookie, чтобы улучшить ваш опыт на нашем сайте. Оставаясь на сайте, вы соглашаетесь с нашей ",
          policyLink: "Политикой конфиденциальности и использования cookie",
          acceptButton: "Понятно"
        },

        // --- ЮРИДИЧЕСКИЙ КОНТЕНТ ---
        legalContent: legalContentRu,

        // --- ХЕДЕР ---
        header: {
          link1: "Почему PetsOk?",
          link2: "Найти вашего ситтера",
          buttonText: "Стать ситтером",
          findService: "Найти услугу",
          help: "Помощь",
          becomeSitter: "Стать ситтером",
          register: "Регистрация",
          login: "Войти",
          language: "Язык",
          welcomeUserShort: "Привет, {{name}}!",
          logout: "Выйти",
          cabinet: {
            profile: "Мой профиль",
            orders: "Мои Заказы",
            sitterPanel: "Панель ситтера"
          },
          services: {
            boarding: "Передержка",
            walking: "Выгул",
            daycare: "Дневной присмотр",
            houseSitting: "Присмотр на дому",
            puppyNanny: "Няня для щенка",
          },
          logoAriaLabel: 'PetsOk на Главную',
          changeLanguageAriaLabel: 'Сменить язык',
          userMenuAriaLabel: 'Меню пользователя',
          openMenuAriaLabel: 'Открыть меню',
          closeMenuAriaLabel: 'Закрыть меню',
          mobileMenuHeading: 'Мобильное меню'
        },

        // --- ПОПАП ПОЛЬЗОВАТЕЛЯ ---
        profile: {
          profile: "Профиль",
          settings: "Настройки",
          support: "Помощь",
          help: "Помощь и поддержка",
          logIn: "Войти",
          signIn: "Регистрация",
          logInTitle: "Войдите или зарегистрируйтесь",
          logout: "Выйти",
          email: "Email",
          password: "Пароль",
          btn: "Войти",
          forgot: "Забыли свой пароль?",
          forgotAirbnb: "Забыли пароль?",
          links: "Не забудьте подписаться на нас",
        },
        userRoles: {
          sitter: "Ситтер",
        },

        // --- МОДАЛЬНОЕ ОКНО ЯЗЫКА ---
        languageModal: {
          selectLanguage: "Выберите язык",
          close: "Закрыть",
          allLanguages: "Все языки и регионы",
          noLanguages: "Список языков пуст."
        },

        // --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ И РЕГИСТРАЦИИ ---
        authModal: {
          defaultTitle: 'Аутентификация',
          contactEntry: { titleAirbnb: "Добро пожаловать в PetsOk" },
          contactPlaceholderAirbnb: 'Email или номер телефона',
          // --- НОВЫЕ ПЕРЕВОДЫ ---
          labelEmail: 'Email',
          labelPhone: 'Номер телефона',
          // --- КОНЕЦ НОВЫХ ПЕРЕВОДОВ ---
          orDivider: 'или',
          continueWithGoogle: 'Продолжить с Google',
          continueWithApple: 'Продолжить с Apple',
          googleErrorNoCredential: 'Не удалось получить данные от Google.',
          googleErrorGeneral: 'Ошибка входа через Google.',
          appleErrorNoToken: 'Не удалось получить данные от Apple.',
          appleErrorGeneral: 'Ошибка входа через Apple.',
          appleCancelled: 'Вход через Apple отменен пользователем.',
          otpTitleAirbnb: "Подтвердите ваш {{contactType, select, email {email} other {номер}}}",
          otpSubtitleAirbnb: "Введите 4-значный код, отправленный на ",
          otpPlaceholderFourDigits: '----',
          finalRegisterTitleAirbnb: "Завершите регистрацию",
          finalRegisterSubtitleAirbnb: "Осталось указать несколько деталей.",
          fullNameLabelAirbnb: "Имя и фамилия",
          fullNamePlaceholder: "Иван Иванов",
          passwordLabelAirbnb: "Пароль",
          confirmPasswordLabelAirbnb: "Подтвердите пароль",
          loginTitlePassword: "Введите ваш пароль",
          resetPasswordTitle: "Создание нового пароля",
          loginSubtitlePassword: "Чтобы войти, введите пароль для аккаунта ",
          resetPasswordSubtitleNew: "Придумайте новый пароль для аккаунта ",
          passwordLabel: "Пароль",
          newPasswordLabel: "Новый пароль",
          confirmPasswordLabel: "Подтвердите новый пароль"
        },
        registration: {
          agreeToTermsPrefixAirbnb: "Нажимая «Принять и продолжить», я принимаю ",
          termsAndConditionsAirbnb: "Условия предоставления услуг",
          paymentTermsAirbnb: "Политику обработки платежей",
          agreeToTermsSuffixAirbnb: ", и подтверждаю ознакомление с ",
          privacyPolicyMain: "Политикой конфиденциальности",
          submitting: "Регистрация...",
          submitButtonAirbnb: "Принять и продолжить",
        },
        login: {
          loggingIn: 'Вход...',
        },
        resetPassword: {
          resetting: 'Сброс...',
          setNewPasswordButton: 'Установить пароль',
          notImplemented: "Функционал сброса пароля в разработке."
        },
        otp: {
          resending: "Отправка...",
          resend: "Отправить код повторно",
        },

        // --- СООБЩЕНИЯ ВАЛИДАЦИИ ---
        validation: {
          contactRequired: "Введите email или телефон.",
          contactInvalid: "Некорректный формат email или телефона.",
          otpRequired: "Введите код подтверждения.",
          otpMinLengthFour: "Код должен состоять из 4 цифр.",
          otpMaxLengthFour: "Код должен состоять из 4 цифр.",
          otpFourDigitsOnly: "Код должен содержать 4 цифры.",
          nameRequired: "Имя и фамилия обязательны.",
          passwordRequired: "Пароль обязателен.",
          passwordMinLength: "Пароль не менее 6 символов.",
          passwordMinLengthAirbnb: "Пароль не менее 8 символов.",
          confirmPasswordRequired: "Подтверждение пароля обязательно.",
          passwordsDoNotMatch: "Пароли не совпадают.",
          termsRequired: "Для продолжения необходимо принять условия.",
          termsRequiredShort: "Согласие обязательно",
        },
        // --- СТРАНИЦА "СТАТЬ СИТТЕРОМ" (ОБНОВЛЕННАЯ ВЕРСИЯ) ---
        sitterHero: {
          title: "Зарабатывайте, занимаясь любимым делом",
          subtitle: "Станьте пет-ситтером на PetsOk. Наслаждайтесь гибкостью, 0% комиссией и радостью от общения с питомцами.",
          ctaButton: "Начать сейчас",
        },
        // --- НОВЫЙ БЛОК ПЕРЕВОДОВ ---
        sitterServices: {
          boarding: {
            title: "Передержка у ситтера",
            desc: "Принимайте питомцев у себя дома. Самая востребованная и высокооплачиваемая услуга.",
            highlight: "Наибольший доход",
          },
          walking: {
            title: "Выгул собак",
            desc: "Предлагайте прогулки, которые идеально впишутся в ваш ежедневный график.",
          },
          daycare: {
            title: "Дневная няня",
            desc: "Отлично подходит, если вы работаете из дома и любите компанию собак.",
          },
          homevisits: {
            title: "Визиты на дом",
            desc: "Посещайте питомцев в их привычной обстановке для кормления и игр.",
          },
        },
        whyBecomeSitter: {
          sectionTitle: "Будьте сами себе боссом, с лапками",
          sectionSubtitle: "Мы предоставляем инструменты и поддержку. Вы дарите любовь. Вот почему ситтеры выбирают PetsOk.",
          earnMore: {
            title: "Получайте 100% заработка",
            desc: "Верно, 0% комиссии. Цена, которую вы устанавливаете, — это цена, которую вы получаете. Максимизируйте свой доход с первого дня.",
          },
          flexible: {
            title: "Абсолютная гибкость",
            desc: "Вы все контролируете. Устанавливайте собственный график, услуги и тарифы. Идеально для подработки или работы на полную ставку.",
          },
          love: {
            title: "Работа, полная радости",
            desc: "Если вы настоящий любитель животных, это больше, чем работа — это призвание. Получайте деньги за почесывание животиков.",
          },
          support: {
            title: "Мы всегда на вашей стороне",
            desc: "От простого в использовании приложения до поддержки 24/7 — мы здесь, чтобы помочь вам добиться успеха и чувствовать себя в безопасности.",
          },
        },
        howItWorksSitterSteps: {
          sectionTitle: "Начните всего за 3 простых шага",
          step1: {
            title: "Создайте свой профиль",
            desc: "Продемонстрируйте свой опыт и любовь к питомцам. Мы поможем создать профиль, который заметят.",
          },
          step2: {
            title: "Получите первый заказ",
            desc: "Вы устанавливаете свою доступность и цены. Мы будем присылать вам запросы от владельцев.",
          },
          step3: {
            title: "Получайте оплату. Это просто!",
            desc: "Деньги поступят на ваш счет уже через два дня после успешного выполнения услуги.",
          }
        },
        offerableServicesSection: {
          sectionTitle: "Предлагайте разнообразные услуги",
          sectionSubtitle: "Вы сами решаете, какие услуги предоставлять. Чем больше услуг вы предлагаете, тем больше у вас возможностей заработать.",
          boarding: {
            title: "Передержка",
            desc: "Принимайте питомцев на ночь у себя дома. Часто это самая высокооплачиваемая услуга.",
            highlight: "Наибольший доход",
          },
          walking: {
            title: "Выгул собак",
            desc: "Предлагайте прогулки, которые идеально впишутся в ваш распорядок дня.",
          },
          daycare: {
            title: "Дневная няня",
            desc: "Идеально, если вы работаете из дома и любите компанию собак.",
          },
          homevisits: {
            title: "Визиты на дом",
            desc: "Посещайте питомцев в их собственном доме для кормления, игр и выгула.",
          },
        },
        supportSafety: {
          sectionTitle: "Ваш успех и безопасность — наш главный приоритет",
          sectionSubtitle: "Мы создали платформу, которой доверяют любители животных.",
          support: {
            title: "Поддержка ситтеров 24/7",
            desc: "Наша команда готова помочь с любым вопросом, от технических до экстренных ситуаций.",
          },
          platform: {
            title: "Надежная и безопасная платформа",
            desc: "Мы используем проверку профилей и безопасные онлайн-платежи, чтобы вы чувствовали себя уверенно.",
          },
          community: {
            title: "Сильное сообщество ситтеров",
            desc: "Общайтесь с другими ситтерами, делитесь опытом, находите поддержку и получайте вдохновение.",
          },
          testimonial: {
            quote: "\"Благодаря PetsOk я смогла превратить свою страсть к собакам в настоящий бизнес. А 0% комиссия — это просто меняет правила игры!\"",
            author: "Анна К., ситтер PetsOk"
          },
          imageAlt: "Уверенный ситтер с довольной собакой"
        },
        finalCtaSitter: {
          title: "Готовы начать свое путешествие с PetsOk?",
          subtitle: "Присоединяйтесь к тысячам ситтеров, которые зарабатывают деньги, устанавливают свой собственный график и занимаются тем, что любят. Ваш следующий пушистый клиент уже ждет!",
          cta: "Создать профиль ситтера (это бесплатно!)"
        },

        // --- ГЛАВНАЯ СТРАНИЦА (Home) - Оригинальные переводы ---
        SearchSitter: {
          tabs: {
            service1: { name: "Передержка", description: "у ситтера дома" },
            service2: { name: "Выгул собаки", description: "по вашему району" },
            service3: { name: "Дневные визиты", description: "к вам домой" },
            service4: { name: "Дневняя няня", description: "у ситтера дома" },
            service5: { name: "Передержка", description: "у вас дома" },
          },
          itemTitle: {
            service1: "Где нужна передержка?",
            service2: "Где нужен выгул собаки?",
            service3: "Где нужен визит на час?",
            service4: "Где нужна дневная няня?",
            service5: "Где нужен присмотр на дому?"
          },
        },
        hero: {
          welcome: "Поиск проверенных ситтеров для передержки и выгула",
          heroDescription: "Никаких клеток и вольеров. Только заботливая передержка в уютной домашней обстановке.",
        },
        whyPetsOkNew: {
          sectionTitle: "Почему PetsOk – лучший выбор для вашего питомца?",
          sectionSubtitle: "Мы предлагаем больше, чем просто присмотр – мы дарим душевное спокойствие благодаря любящему домашнему уходу за вашим питомцем и непревзойденной поддержке для вас.",
          servicesTitle: "Наши основные услуги",
          guaranteesTitle: "Наши обязательства перед вами",
        },
        ourServices: {
          boarding: { title: "Передержка в доме ситтера", desc: "Уютная, любящая домашняя обстановка для вашего питомца, пока вы в отъезде." },
          houseSitting: { title: "Присмотр в вашем доме", desc: "Уход за питомцем в его привычной среде, плюс присмотр за вашим домом." },
          dropIn: { title: "Визиты на час", desc: "Короткие визиты для кормления, туалета и игр на вашей территории." },
          dayNanny: { title: "Дневная няня (у ситтера)", desc: "Дневные развлечения, общение и уход в доме ситтера." },
          walking: { title: "Выгул собаки", desc: "Энергичные прогулки, адаптированные к потребностям и режиму вашей собаки." }
        },
        ourGuarantees: {
          verifiedSitters: { title: "Проверенные и надежные ситтеры", desc: "Анкета каждого ситтера проверяется нашей командой для обеспечения качества и безопасности." },
          photoUpdates: { title: "Фото- и видеоотчеты", desc: "Оставайтесь на связи и наблюдайте за счастьем вашего питомца благодаря регулярным обновлениям." },
          support: { title: "Круглосуточная поддержка клиентов", desc: "Наша преданная команда всегда готова помочь вам и вашему ситтеру." },
          securePayments: { title: "Безопасные и простые платежи", desc: "Бронируйте и оплачивайте с уверенностью через нашу зашифрованную платформу." }
        },
        howItWorksSimple: {
          sectionTitle: "Найти ситтера? Проще простого: 3 шага!",
          step1: { title: "Создайте заявку", desc: "Расскажите о питомце и нужной услуге." },
          step2: { title: "Выберите ситтера", desc: "Изучите профили, отзывы или просто ожидайте откликов." },
          step3: { title: "Бронируйте и отдыхайте!", desc: "Подтвердите бронь и наслаждайтесь спокойствием, зная, что о питомце позаботятся." }
        },
        mobileAppPromo: {
          sectionTitle: "Ваш питомец под надёжной опекой — всегда и везде с приложением PetsOk!",
          sectionSubtitle: "Забудьте о переживаниях! Наше приложение — это ваш личный ключ к миру проверенных ситтеров, удобного бронирования и полного контроля над благополучием вашего любимца.",
          featuresTitle: "Почему PetsOk в телефоне — это удобно:",
          features: {
            search: "Мгновенный поиск идеального ситтера",
            chat: "Прямая связь с ситтером в любое время",
            photos: "Фото- и видеоотчеты о вашем питомце",
            manage: "Управление заказами в пару кликов"
          },
          ctaText: "Подарите себе спокойствие, а питомцу – лучшую заботу. Скачайте приложение PetsOk прямо сейчас!",
          availabilityNote: "Бесплатно для iOS и Android",
          videoAlt: "Демонстрация возможностей мобильного приложения PetsOk",
          scanToDownloadStrong: "Сканируйте",
          scanToDownloadRest: " и начните!"
        },
        mobileApp: {
          downloadIOS: "Загрузить из App Store",
          downloadIOSShort: "App Store",
          downloadAndroid: "Загрузить из Google Play",
          downloadAndroidShort: "Google Play"
        },
      },
    },
    kk: {
      translation: {
        // --- ОБЩИЕ ---
        loading: "Жүктелуде...",
        common: {
          continue: "Жалғастыру",
          confirm: "Растау",
          close: "Жабу",
        },
        recomLang: "Ұсынылатын тілдер мен аймақтар",

        // --- SEO МЕТА-ТЕГИ ---
        seo: {
          html_lang: "kk",
          home: {
            title: "PetsOk – Иттерді уақытша ұстау және серуендету бойынша сенімді сервис",
            description: "Өз ауданыңыздан тексерілген ит ситтерін немесе серуендетушіні табыңыз. Үй жануарларына үй жағдайындағы қамқорлық. Сіз үшін жан тыныштығы, олар үшін бақыт."
          },
          becomeASitter: {
            title: "Ситтер болыңыз және PetsOk-пен ақша табыңыз | 0% комиссия",
            description: "PetsOk-қа қосылып, үй жануарларын уақытша ұстау, серуендету және күндізгі күтім қызметтерін ұсыныңыз. Өз кестеңізді, бағаңызды белгілеп, 100% табыс алыңыз."
          }
        },
        // --- ФУТЕР ---
        footer: {
          copyright: "Барлық құқықтар қорғалған.",
          legal: {
            terms: "Пайдалану шарттары",
            privacy: "Құпиялылық саясаты",
            cookies: "Cookie саясаты"
          }
        },

        // --- COOKIE BANNER ---
        cookieConsent: {
          text: "Біз веб-сайттағы тәжірибеңізді жақсарту үшін cookie файлдарын пайдаланамыз. Сайтта қалу арқылы сіз біздің ",
          policyLink: "Құпиялылық және cookie файлдарын пайдалану саясатымен",
          acceptButton: "Түсінікті"
        },

        // --- ЮРИДИЧЕСКИЙ КОНТЕНТ ---
        legalContent: legalContentKk,

        // --- ХЕДЕР ---
        header: {
          link1: "Неге PetsOk?",
          link2: "Ситтеріңізді табыңыз",
          buttonText: "Ситтер болу",
          findService: "Қызмет табу",
          help: "Көмек",
          becomeSitter: "Ситтер болу",
          register: "Тіркелу",
          login: "Кіру",
          language: "Тіл",
          welcomeUserShort: "Сәлем, {{name}}!",
          logout: "Шығу",
          cabinet: {
            profile: "Менің профилім",
            orders: "Менің тапсырыстарым",
            sitterPanel: "Ситтер панелі"
          },
          services: {
            boarding: "Үйде ұстау",
            walking: "Серуендету",
            daycare: "Күндізгі күтім",
            houseSitting: "Үйіңізде қарау",
            puppyNanny: "Күшік күтушісі",
          },
          logoAriaLabel: 'PetsOk Басты бетке',
          changeLanguageAriaLabel: 'Тілді өзгерту',
          userMenuAriaLabel: 'Пайдаланушы мәзірі',
          openMenuAriaLabel: 'Мәзірді ашу',
          closeMenuAriaLabel: 'Мәзірді жабу',
          mobileMenuHeading: 'Мобильді мәзір'
        },

        // --- ПОПАП ПОЛЬЗОВАТЕЛЯ ---
        profile: {
          profile: "Профиль",
          settings: "Баптаулар",
          help: "Көмек және қолдау",
          logIn: "Кіру",
          signIn: "Тіркелу",
          logInTitle: "Жүйеге кіріңіз немесе тіркеліңіз",
          logout: "Шығу",
          email: "Email",
          password: "Құпиясөз",
          btn: "Кіру",
          forgot: "Құпиясөзді ұмыттыңыз ба?",
          forgotAirbnb: "Құпиясөзді ұмыттыңыз ба?",
          links: "Бізге жазылуды ұмытпаңыз",
        },
        userRoles: {
          sitter: "Ситтер",
        },

        // --- МОДАЛЬНОЕ ОКНО ЯЗЫКА ---
        languageModal: {
          selectLanguage: "Тілді таңдаңыз",
          close: "Жабу",
          allLanguages: "Барлық тілдер мен аймақтар",
          noLanguages: "Тілдер тізімі бос."
        },

        // --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ И РЕГИСТРАЦИИ ---
        authModal: {
          defaultTitle: 'Аутентификация',
          contactEntry: {
            titleAirbnb: "PetsOk-қа қош келдіңіз"
          },
          contactPlaceholderAirbnb: 'Email немесе телефон нөмірі',
          orDivider: 'немесе',
          continueWithGoogle: 'Google арқылы жалғастыру',
          continueWithApple: 'Apple арқылы жалғастыру',
          googleErrorNoCredential: 'Google-дан деректерді алу мүмкін болмады.',
          googleErrorGeneral: 'Google арқылы кіру қатесі.',
          appleErrorNoToken: 'Apple-дан деректерді алу мүмкін болмады.',
          appleErrorGeneral: 'Apple арқылы кіру қатесі.',
          appleCancelled: 'Apple арқылы кіруді пайдаланушы тоқтатты.',
          otpTitleAirbnb: "{{contactType, select, email {Email} other {Нөміріңізді}}} растаңыз",
          otpSubtitleAirbnb: "Біз жіберген 4 таңбалы кодты енгізіңіз: ",
          otpPlaceholderFourDigits: '----',
          finalRegisterTitleAirbnb: "Тіркелуді аяқтаңыз",
          finalRegisterSubtitleAirbnb: "Бастау үшін тағы бірнеше мәлімет қалды.",
          fullNameLabelAirbnb: "Аты-жөні",
          fullNamePlaceholder: "Алихан Смаилов",
          passwordLabelAirbnb: "Құпиясөз",
          confirmPasswordLabelAirbnb: "Құпиясөзді растаңыз",
          loginTitlePassword: "Құпиясөзіңізді енгізіңіз",
          resetPasswordTitle: "Жаңа құпиясөз жасау",
          loginSubtitlePassword: "Кіру үшін аккаунт құпиясөзін енгізіңіз: ",
          resetPasswordSubtitleNew: "Аккаунт үшін жаңа құпиясөз ойлап табыңыз: ",
          passwordLabel: "Құпиясөз",
          newPasswordLabel: "Жаңа құпиясөз",
          confirmPasswordLabel: "Жаңа құпиясөзді растаңыз"
        },
        registration: {
          agreeToTermsPrefixAirbnb: "«Келісу және жалғастыру» түймесін басу арқылы мен PetsOk ",
          termsAndConditionsAirbnb: "Қызмет көрсету шарттарын",
          paymentTermsAirbnb: "Төлемдерді өңдеу саясатын",
          agreeToTermsSuffixAirbnb: " қабылдаймын және ",
          privacyPolicyMain: "Құпиялылық саясатымен",
          submitting: "Тіркелуде...",
          submitButtonAirbnb: "Келісу және жалғастыру",
        },
        login: {
          loggingIn: 'Кіруде...',
        },
        resetPassword: {
          resetting: 'Қалпына келтіруде...',
          setNewPasswordButton: 'Құпиясөзді орнату',
          notImplemented: "Құпиясөзді қалпына келтіру функциясы әзірленуде."
        },
        otp: {
          resending: "Қайта жіберуде...",
          resend: "Кодты қайта жіберу",
        },

        // --- СООБЩЕНИЯ ВАЛИДАЦИИ ---
        validation: {
          contactRequired: "Email немесе телефон нөмірін енгізіңіз.",
          contactInvalid: "Email немесе телефон нөмірінің форматы дұрыс емес.",
          otpRequired: "Растау кодын енгізіңіз.",
          otpMinLengthFour: "Код 4 саннан тұруы керек.",
          otpMaxLengthFour: "Код 4 саннан тұруы керек.",
          otpFourDigitsOnly: "Код тек 4 саннан тұруы керек.",
          nameRequired: "Аты-жөні міндетті.",
          passwordRequired: "Құпиясөз міндетті.",
          passwordMinLength: "Құпиясөз кемінде 6 таңбадан тұруы керек.",
          passwordMinLengthAirbnb: "Құпиясөз кемінде 8 таңбадан тұруы керек.",
          confirmPasswordRequired: "Құпиясөзді растау міндетті.",
          passwordsDoNotMatch: "Құпиясөздер сәйкес келмейді.",
          termsRequired: "Жалғастыру үшін шарттармен келісуіңіз керек.",
          termsRequiredShort: "Келісім қажет",
        },
        // --- СТРАНИЦА "СТАТЬ СИТТЕРОМ" ---
        sitterHero: {
          title: "Сүйікті ісіңізбен айналысып, ақша табыңыз",
          subtitle: "PetsOk-та пет-ситтер болыңыз. Икемділіктің, 0% комиссияның және үй жануарларымен қарым-қатынастың рахатын сезініңіз.",
          ctaButton: "Дәл қазір бастау",
        },
        // --- НОВЫЙ БЛОК ПЕРЕВОДОВ ---
        sitterServices: {
          boarding: {
            title: "Ситтердің үйіндегі уақытша ұстау",
            desc: "Үй жануарларын өз үйіңізде қабылдаңыз. Ең сұранысқа ие және жоғары ақылы қызмет.",
            highlight: "Ең жоғары табыс",
          },
          walking: {
            title: "Иттерді серуендету",
            desc: "Күнделікті кестеңізге сай келетін серуендерді ұсыныңыз.",
          },
          daycare: {
            title: "Иттерге арналған күндізгі күтуші",
            desc: "Егер сіз үйден жұмыс істесеңіз және иттердің компаниясын ұнатсаңыз, өте қолайлы.",
          },
          homevisits: {
            title: "Үйге бару",
            desc: "Тамақтандыру және ойнау үшін үй жануарларына өз үйінде барыңыз.",
          },
        },
        whyBecomeSitter: {
          sectionTitle: "Өз-өзіңізге бастық болыңыз",
          sectionSubtitle: "Біз құралдар мен қолдауды ұсынамыз. Сіз махаббат сыйлайсыз. Ситтерлердің PetsOk-ты таңдау себептері осында.",
          earnMore: {
            title: "Табысыңыздың 100%-ын алыңыз",
            desc: "Дұрыс, 0% комиссия. Сіз белгілеген баға — сіз алатын баға. Бірінші күннен бастап табысыңызды арттырыңыз.",
          },
          flexible: {
            title: "Абсолютті икемділік",
            desc: "Барлығы сіздің қолыңызда. Өз кестеңізді, қызметтеріңізді және тарифтеріңізді орнатыңыз. Қосымша немесе толық жұмыс ретінде өте қолайлы.",
          },
          love: {
            title: "Қуанышқа толы жұмыс",
            desc: "Егер сіз жануарларды шын сүйсеңіз, бұл жұмыстан да артық — бұл сіздің шабытыңыз. Ішін сипағаныңыз үшін ақы алыңыз.",
          },
          support: {
            title: "Біз әрқашан сізбен біргеміз",
            desc: "Қолдануға оңай қолданбадан бастап, 24/7 қолдау көрсетуге дейін — біз сіздің табысқа жетуіңізге және қауіпсіздігіңізді сезінуіңізге көмектесеміз.",
          },
        },
        howItWorksSitterSteps: {
          sectionTitle: "Бар болғаны 3 қарапайым қадаммен бастаңыз",
          step1: {
            title: "Профиліңізді жасаңыз",
            desc: "Тәжірибеңіз бен үй жануарларына деген сүйіспеншілігіңізді көрсетіңіз. Біз сізге ерекшеленетін профиль жасауға көмектесеміз.",
          },
          step2: {
            title: "Алғашқы тапсырысыңызды алыңыз",
            desc: "Сіз қолжетімділігіңіз бен бағаларыңызды белгілейсіз. Біз сізге сіздің аймағыңыздағы үй жануарларының иелерінен сұраныстар жібереміз.",
          },
          step3: {
            title: "Төлеміңізді алыңыз. Бәрі оңай!",
            desc: "Қызметті сәтті аяқтағаннан кейін екі күннен соң ақшаңыз шотыңызға түседі.",
          }
        },
        offerableServicesSection: {
          sectionTitle: "Әртүрлі қызметтерді ұсыныңыз",
          sectionSubtitle: "Қандай қызметтерді ұсынатыныңызды өзіңіз шешесіз. Қаншалықты көп қызмет ұсынсаңыз, соншалықты көп табыс табу мүмкіндігіңіз болады.",
          boarding: {
            title: "Үйде уақытша ұстау",
            desc: "Үй жануарларын өз үйіңізде түнгі қонуға қабылдаңыз. Көбінесе ең жоғары табыс әкелетін қызмет.",
            highlight: "Ең жоғары табыс",
          },
          walking: {
            title: "Иттерді серуендету",
            desc: "Күнделікті кестеңізге тамаша сәйкес келетін серуендерді ұсыныңыз.",
          },
          daycare: {
            title: "Күндізгі күтуші",
            desc: "Егер сіз үйден жұмыс істесеңіз және иттермен бірге болғанды ұнатсаңыз, өте қолайлы.",
          },
          homevisits: {
            title: "Үйге бару",
            desc: "Тамақтандыру, ойнау және серуендету үшін үй жануарларына өз үйінде барыңыз.",
          },
        },
        supportSafety: {
          sectionTitle: "Сіздің жетістігіңіз бен қауіпсіздігіңіз — біздің басты міндетіміз",
          sectionSubtitle: "Біз жануарларды сүйетіндер сенетін платформа құрдық.",
          support: {
            title: "Ситтерлерді 24/7 қолдау",
            desc: "Біздің команда кез келген мәселе бойынша — техникалық сұрақтардан бастап төтенше жағдайларға дейін — көмектесуге дайын.",
          },
          platform: {
            title: "Сенімді және қауіпсіз платформа",
            desc: "Сіз өзіңізді сенімді және қауіпсіз сезінуіңіз үшін біз профильдерді тексеруді және қауіпсіз онлайн төлемдерді қолданамыз.",
          },
          community: {
            title: "Мықты ситтерлер қауымдастығы",
            desc: "Басқа ситтерлермен байланысыңыз, тәжірибеңізбен бөлісіңіз, қолдау тауып, шабыт алыңыз.",
          },
          testimonial: {
            quote: "\"PetsOk-тың арқасында мен иттерге деген құмарлығымды нағыз бизнеске айналдыра алдым. Ал 0% комиссия — бұл ойын ережесін өзгертеді!\"",
            author: "Анна К., PetsOk ситтері"
          },
          imageAlt: "Сенімді үй жануарларын бағушы бақытты итпен"
        },
        finalCtaSitter: {
          title: "PetsOk-пен саяхатыңызды бастауға дайынсыз ба?",
          subtitle: "Ақша тауып, өз кестесін құрып, сүйікті ісімен айналысатын мыңдаған ситтерлерге қосылыңыз. Сіздің келесі үлпілдек клиентіңіз күтіп отыр!",
          cta: "Ситтер профилін жасау (Бұл тегін!)"
        },

        // --- ГЛАВНАЯ СТРАНИЦА (Home) - Оригинальные переводы ---
        SearchSitter: {
          tabs: {
            service1: { name: "Үйде уақытша ұстау", description: "Сүйіспеншілікке толы ситтер үйі" },
            service2: { name: "Сіздің үйде қарау", description: "Олар үшін таныс жайлылық" },
            service3: { name: "Жергілікті ит серуендету", description: "Бақытты табандар, бақытты жануар" },
            service4: { name: "Арнайы үй күтімі", description: "Толық күтім, сіздің кеңістігіңіз" },
            service5: { name: "Жедел күтім сапарлары", description: "Ойын уақыты мен қажеттіліктер" }
          },
          itemTitle: {
            service1: "Жайлы уақытша ұстау үйін табыңыз",
            service2: "Үйіңізге ситтер табыңыз",
            service3: "Жергілікті ит серуендетушілерді табыңыз",
            service4: "Арнайы үй күтушілерін табыңыз",
            service5: "Жедел күтім сапарларын жоспарлаңыз"
          },
        },
        hero: {
          welcome: "Сенімді күтім, үй жағдайындай.",
          heroDescription: "Үй жануарларына сүйіспеншілікпен күтім жасайтын тексерілген жергілікті ситтерлермен байланысыңыз. Сіз үшін жан тыныштығы, олар үшін бақыт. PetsOk арқылы мінсіз сәйкестікті табыңыз.",
        },
        whyPetsOkNew: {
          sectionTitle: "Неліктен PetsOk – үй жануарыңыз үшін ең жақсы таңдау?",
          sectionSubtitle: "Біз жай ғана күтім ұсынбаймыз – біз үй жануарыңызға деген сүйіспеншілікке толы үй күтімі және сіз үшін теңдессіз қолдау арқылы жан тыныштығын сыйлаймыз.",
          servicesTitle: "Біздің негізгі қызметтеріміз",
          guaranteesTitle: "Сізге деген міндеттемелеріміз",
        },
        ourServices: {
          boarding: { title: "Ситтердің үйінде уақытша ұстау", desc: "Сіз жоқта үй жануарыңыз үшін жайлы, сүйіспеншілікке толы үй ортасы." },
          houseSitting: { title: "Сіздің үйіңізде қарау", desc: "Үй жануарыңызды үйреншікті ортасында күту, сонымен қатар үйіңізге қарау." },
          dropIn: { title: "Бір сағаттық барулар", desc: "Сіздің аумағыңызда тамақтандыру, дәретке шығару және ойнау үшін қысқа барулар." },
          dayNanny: { title: "Күндізгі күтуші (ситтерде)", desc: "Ситтердің үйінде күндізгі ойын-сауық, қарым-қатынас және күтім." },
          walking: { title: "Итті серуендету", desc: "Итіңіздің қажеттіліктері мен режиміне бейімделген жігерлі серуендер." }
        },
        ourGuarantees: {
          verifiedSitters: { title: "Тексерілген және сенімді ситтерлер", desc: "Сапа мен қауіпсіздікті қамтамасыз ету үшін әр ситтердің сауалнамасын біздің команда тексереді." },
          photoUpdates: { title: "Фото- және бейне есептер", desc: "Тұрақты жаңартулар арқылы байланыста болып, үй жануарыңыздың бақытын бақылаңыз." },
          support: { title: "Тәулік бойы клиенттерді қолдау", desc: "Біздің адал команда сізге және сіздің ситтеріңізге көмектесуге әрқашан дайын." },
          securePayments: { title: "Қауіпсіз және қарапайым төлемдер", desc: "Біздің шифрланған платформамыз арқылы сенімді түрде брондап, төлеңіз." }
        },
        howItWorksSimple: {
          sectionTitle: "Ситтер табу? Оңай: 3 қадам!",
          step1: { title: "Өтінім жасаңыз", desc: "Үй жануарыңыз және қажетті қызмет туралы айтыңыз." },
          step2: { title: "Ситтерді таңдаңыз", desc: "Профильдерді, пікірлерді зерттеңіз немесе жай ғана жауап күтіңіз." },
          step3: { title: "Брондаңыз және демалыңыз!", desc: "Бронды растап, үй жануарыңыздың қамқорлықта екенін біліп, тыныштықтан ләззат алыңыз." }
        },
        mobileAppPromo: {
          sectionTitle: "Сіздің үй жануарыңыз сенімді қамқорлықта — PetsOk қолданбасымен әрқашан және барлық жерде!",
          sectionSubtitle: "Уайымды ұмытыңыз! Біздің қолданба — бұл тексерілген ситтерлер әлеміне, ыңғайлы брондауға және сүйіктіңіздің амандығын толық бақылауға арналған жеке кілтіңіз.",
          featuresTitle: "Неліктен телефондағы PetsOk — ыңғайлы:",
          features: {
            search: "Мінсіз ситтерді лезде іздеу",
            chat: "Ситтермен кез келген уақытта тікелей байланыс",
            photos: "Үй жануарыңыз туралы фото- және бейне есептер",
            manage: "Тапсырыстарды бірнеше рет басу арқылы басқару"
          },
          ctaText: "Өзіңізге тыныштық сыйлаңыз, ал үй жануарыңызға — ең жақсы қамқорлықты. PetsOk қолданбасын дәл қазір жүктеп алыңыз!",
          availabilityNote: "iOS және Android үшін тегін",
          videoAlt: "PetsOk мобильді қосымшасының мүмкіндіктерін көрсету",
          scanToDownloadStrong: "Сканерлеңіз",
          scanToDownloadRest: " және бастаңыз!"
        },
        mobileApp: {
          downloadIOS: "App Store-дан жүктеу",
          downloadIOSShort: "App Store",
          downloadAndroid: "Google Play-ден жүктеу",
          downloadAndroidShort: "Google Play"
        },
      },
    },
  },
  lng: savedLanguage,
  fallbackLng: "ru",
  supportedLngs: supportedLngs.map(lng => lng.code),
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;