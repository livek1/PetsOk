import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLanguage = localStorage.getItem("language") || "ru";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        recomLang: "Recommended languages and regions",

        profile: {
          profile: "Profile",
          settings: "Settings",
          support: "Support",

          logIn: "Sign Up",
          signIn: "Sign In",

          logInTitle: "Sign in or register",
          email: "Email",
          password: "Password",
          btn: "Sign In",

          forgot: "Forgot your password?",
          links: "Don't forget to follow us",
        },
        SearchSitter: {
          navsitterBoarding: "Overexposure",
          navsitterBoardingDesc: "Dogsitter's house",
          navsitterDayNanny: "Day nanny",
          navsitterDayNannyDesc: "At your place",
          navsitterPaddock: "Paddock",
          navsitterPaddockDesc: "In your area",

          InptWhere: "Where to search?",
          InptOverexposure: "Overexposure Dates",
          InptWalking: "Walking dates",
        },
        hero: {
          welcome: "  Loving Pet Care in Your Neighbourhood",
          heroDescription:
            "Take the cat to your home for a couple of days or take a walk with the dog in the morning-it's up to you. PetsOk will help you flexibly set up your services and establish contacts with pet owners",
        },
        header: {
          link1: "Our Services",
          link2: "Search Sitters",
          buttonText: "Become a sitter",
        },
        service: {
          serviceTitle: "Services for every dog and cat",
          serviceList: [
            {
              key: "serviceBoarding",
              title: "Boarding",
              desc: "Your pets stay overnight in your sitter’s home. They’ll be treated like part of the family in a comfortable environment.",
            },
            {
              key: "serviceHouseSitting",
              title: "House Sitting",
              desc: "Your sitter takes care of your pets and your house. Your pets will get all the attention they need from the comfort of home.",
            },
            {
              key: "serviceDogWalking",
              title: "Dog Walking",
              desc: "Your dog gets a walk around your local area. Perfect for busy days and dogs with extra energy to burn.",
            },
            {
              key: "serviceDoggyDayCare",
              title: "Doggy Day Care",
              desc: "Your dog spends the day at your sitter’s home. Drop them off in the morning and pick up a happy pup in the evening.",
            },
            {
              key: "serviceDropInVisits",
              title: "Drop-In Visits",
              desc: "Your sitter drops by your home to play with your pets, offer food, and give toilet breaks or clean the litter tray.",
            },
          ],
        },
        stages: {
          stagesTitle: "How does our service work?",
          stagesDescription:
            'Our service helps you find a temporary owner for your pet when you need to leave. Here" s how it works:',
          stagesList: [
            {
              title: "Placing an application",
              description:
                "Pet owners submit a request with details about their pet and the required care.",
            },
            {
              title: "Finding a temporary caregiver",
              description:
                "The system or community helps match pets with suitable temporary caregivers.",
            },
            {
              title: "Discussing details",
              description:
                "Owners and caregivers communicate to clarify expectations and care instructions.",
            },
            {
              title: "Pet handover",
              description:
                "The pet is safely transferred to the temporary caregiver.",
            },
            {
              title: "Monitoring & feedback",
              description:
                "Owners receive updates, ensuring the pet's well-being.",
            },
          ],
        },
        aboutUs: {
          title: "Who We Are",
          description:
            "We connect pet owners with trusted caregivers, ensuring every pet receives the best temporary care. Our mission is to make pet-sitting safe, reliable, and stress-free for both owners and animals.",
          aboutAdventures: [
            "Trusted & Verified Caregivers – Every caregiver is carefully checked to ensure your pet’s safety.",
            "24/7 Support & Monitoring – We provide continuous assistance and updates on your pet’s well-being.",
            "Growing Global Community – Join thousands of pet lovers who trust our services.",
            "Easy & Secure Process – From request to return, everything is simple and transparent.",
          ],
        },
        application: {
          title:
            "Our app is a convenient way to find overexposure for your pet!",
          description: 'Download now and be sure of your pet"s safety!',
          consultation: "Need a consultation?",
          consultationBtn: "Ask a question",
          consultationDescription:
            "If you couldn't find an answer on our website, please contact us and we will give you a detailed answer to your question.",
        },
        location: {
          title: "Where We Operate",
          desc: "We provide trusted pet care services in multiple countries, ensuring that every pet gets the love and attention they need. Our growing community connects pet owners with verified caregivers for a safe and stress-free experience.",
          locations: "Our Locations:",
        },
      },
    },
    ru: {
      translation: {
        recomLang: "Рекомендуемые языки и регионы",
        profile: {
          profile: "Профиль",
          settings: "Настройки",
          support: "Помощь",

          logIn: "Зарегестрироваться",
          signIn: "Войти",

          logInTitle: "Войдите в систему или зарегистрируйтесь",
          emal: "email",
          password: "Пароль",
          btn: "Войти",

          forger: "Забыли свой пароль?",
          links: "Не забудьте подписаться на нас",
        },
        SearchSitter: {
          navsitterBoarding: "Передержка",
          navsitterBoardingDesc: "В доме догситтера",
          navsitterDayNanny: "Дневная няня",
          navsitterDayNannyDesc: "У вас дома",
          navsitterPaddock: "Выгул",
          navsitterPaddockDesc: "В вашем районе",

          InptWhere: "Где искать?",
          InptOverexposure: "Даты передержки",
          InptWalking: "Даты выгула",
        },
        hero: {
          welcome: "Заботливый уход за домашними животными в Вашем районе",
          heroDescription:
            "Возьмите кошку к себе домой на пару дней или погуляйте с собакой по утрам - решать вам. Pets Ok поможет вам гибко настроить свои услуги и наладить контакты с владельцами домашних животных",
        },
        header: {
          link1: "Наши услуги",
          link2: "Найти ситтера",
          buttonText: "Стать ситтером",
        },
        service: {
          serviceTitle: "Услуги для каждой собаки и кошки",
          serviceList: [
            {
              key: "serviceBoarding",
              title: "Посадка",
              desc: "Ваши питомцы останутся на ночь в доме вашей няни. К ним будут относиться как к членам семьи в комфортных условиях.",
            },
            {
              key: "serviceHouseSitting",
              title: "Домашнее заседание",
              desc: "Ваша сестра позаботится о ваших питомцах и вашем доме. Ваши питомцы получат все необходимое внимание, не выходя из дома.",
            },
            {
              key: "serviceDogWalking",
              title: "Выгул собаки",
              desc: "Ваша собака может прогуляться по окрестностям. Идеально подходит для напряженных дней и для собак, у которых есть запас энергии.",
            },
            {
              key: "serviceDoggyDayCare",
              title: "Дневной уход за собачкой",
              desc: "Ваша собака проведет день дома у няни. Отвезите ее утром и заберите счастливого щенка вечером.",
            },
            {
              key: "serviceDropInVisits",
              title: "Дополнительные визиты",
              desc: "Ваша няня заглядывает к вам домой, чтобы поиграть с вашими питомцами, предложить еду, устроить перерыв на туалет или почистить лоток для мусора.",
            },
          ],
        },
        stages: {
          stagesTitle: "Как работает наш сервис?",
          stagesDescription:
            "Наш сервис поможет вам найти временного владельца для вашего питомца, когда вам нужно будет уехать. Вот как это работает:  ",

          stagesList: [
            {
              title: "Подача заявки",
              description:
                "Владельцы домашних животных отправляют запрос с подробной информацией о своем питомце и требуемом уходе.",
            },
            {
              title: "Поиск временного опекуна",
              description:
                "Система или сообщество помогает подобрать для домашних животных подходящих временных опекунов.",
            },
            {
              title: "Обсуждаем детали",
              description:
                "Владельцы и опекуны общаются друг с другом, чтобы уточнить ожидания и инструкции по уходу.",
            },
            {
              title: "Передача домашнего животного",
              description:
                "Домашнее животное в целости и сохранности передается временному опекуну.",
            },
            {
              title: "Мониторинг и обратная связь",
              description:
                "Владельцы получают обновленную информацию, гарантирующую благополучие питомца.",
            },
          ],
        },
        aboutUs: {
          title: "Кто мы такие",
          description:
            "Мы связываем владельцев домашних животных с надежными опекунами, гарантируя, что каждый питомец получит наилучший временный уход. Наша миссия - сделать уход за домашними животными безопасным, надежным и без стресса как для владельцев, так и для животных.",
          aboutAdventures: [
            "Надежные и проверенные воспитатели – Каждый воспитатель проходит тщательную проверку, чтобы обеспечить безопасность вашего питомца.",
            "Поддержка и мониторинг в режиме 24/7 – Мы предоставляем постоянную помощь и обновляем информацию о самочувствии вашего питомца.",
            "Растущее глобальное сообщество – Присоединяйтесь к тысячам любителей домашних животных, которые доверяют нашим услугам.",
            "Простой и безопасный процесс – от запроса до возврата товара, все просто и прозрачно.",
          ],
        },
        application: {
          title:
            "Наше приложение - это удобный способ найти передержку для вашего питомца!",
          description:
            "Скачивайте прямо сейчас и будьте уверены в безопасности вашего питомца!",
          consultation: "Консультация Нужна консультация?",
          consultationBtn: "Задать вопрос",
          consultationDescription:
            "Если вы не смогли найти ответ на нашем сайте, пожалуйста, свяжитесь с нами, и мы дадим вам подробный ответ на ваш вопрос.",
        },
        location: {
          title: "Где Мы Работаем",
          desc: "Мы предоставляем надежные услуги по уходу за домашними животными во многих странах, гарантируя, что каждый питомец получит любовь и внимание, в которых он нуждается. Наше растущее сообщество связывает владельцев домашних животных с проверенными специалистами по уходу за ними для обеспечения безопасности и отсутствия стрессов.",
          locations: "Наши Местоположения:",
        },
      },
    },
    kk: {
      translation: {
        recomLang: "Ұсынылатын тілдер мен аймақтар",
        profile: {
          profile: "Профиль",
          settings: "Баптаулар",
          support: "Қолдау",

          logIn: "Тіркелу",
          signIn: "Кіру",

          logInTitle: "Жүйеге кіріңіз немесе тіркеліңіз",
          email: "Email",
          password: "Құпиясөз",
          btn: "Кіру",

          forgot: "Құпиясөзді ұмыттыңыз ба?",
          links: "Бізге жазылуды ұмытпаңыз",
        },

        SearchSitter: {
          navsitterBoarding: "Уақытша ұстау",
          navsitterBoardingDesc: "Ит бағып берушінің үйінде",
          navsitterDayNanny: "Күндізгі күтуші",
          navsitterDayNannyDesc: "Сіздің үйіңізде",
          navsitterPaddock: "Жүріс",
          navsitterPaddockDesc: "Сіздің ауданыңызда",

          InptWhere: "Қай жерде іздейміз?",
          InptOverexposure: "Уақытша ұстау күндері",
          InptWalking: "Жүру күндері",
        },
        hero: {
          welcome:
            "Сіздің Аймағыңыздағы Үй Жануарларына сүйіспеншілікпен Күтім жасау",
          heroDescription:
            "Мысықты бірнеше күн үйіңізге апарыңыз немесе таңертең итпен серуендеңіз-бұл сізге байланысты. Pets Ok сізге қызметтерді икемді түрде орнатуға және үй жануарларының иелерімен байланыс орнатуға көмектеседі",
        },
        header: {
          link1: "Біздің Қызметтер",
          link2: "Отырғыштарды Іздеу",
          buttonText: "Ситтер болу",
        },
        service: {
          serviceTitle: "Әрбір ит пен мысыққа арналған қызметтер",
          serviceList: [
            {
              key: "serviceBoarding",
              title: "Отырғызу",
              desc: "Сіздің үй жануарларыңыз күтушінің үйінде түнейді. Олар жайлы ортада отбасының бір бөлігі ретінде қарастырылады.",
            },
            {
              key: "serviceHouseSitting",
              title: "Үйде Отыру",
              desc: "Әпкең үй жануарларыңа, үйіңе қамқор болады. Сіздің үй жануарларыңыз үйден шықпай-ақ барлық қажетті назарды алады.",
            },
            {
              key: "serviceDogWalking",
              title: "Үй отырысы",
              desc: "Your dog gets a walk around your local area. Perfect for busy days and dogs with extra energy to burn.",
            },
            {
              key: "serviceDoggyDayCare",
              title: "Итпен Серуендеу",
              desc: "Сіздің итіңіз сіздің аймағыңызда серуендейді. Бос емес күндер мен қосымша энергиясы бар иттер үшін өте қолайлы.",
            },
            {
              key: "serviceDropInVisits",
              title: "Көшпелі Сапарлар",
              desc: "Сіздің күтушіңіз үй жануарларыңызбен ойнау, тамақ ұсыну, дәретханаға үзіліс беру немесе қоқыс жәшігін тазалау үшін үйіңіздің жанына түседі.",
            },
          ],
        },
        stages: {
          stagesTitle: "Біздің қызметіміз қалай жұмыс істейді?",
          stagesDescription:
            "Біздің қызмет сізге кету қажет болған кезде үй жануарыңыздың уақытша иесін табуға көмектеседі. Бұл қалай жұмыс істейді:",
          stagesList: [
            {
              title: "Өтінім беру",
              description:
                "Үй жануарларының иелері үй жануарлары туралы және қажетті күтім туралы егжей-тегжейлі сұрау салады.",
            },
            {
              title: "Уақытша күтушіні табу",
              description:
                "Жүйе немесе қауымдастық үй жануарларын тиісті уақытша күтушілермен сәйкестендіруге көмектеседі.",
            },
            {
              title: "Мәліметтерді талқылау",
              description:
                "Иелері мен қамқоршылары күтулер мен күтім нұсқауларын нақтылау үшін байланысады.",
            },
            {
              title: "Үй жануарларын тапсыру",
              description:
                "Үй жануарлары уақытша күтушіге қауіпсіз түрде ауыстырылады.",
            },
            {
              title: "Мониторинг және кері байланыс",
              description:
                "Иелері үй жануарларының әл-ауқатын қамтамасыз ететін жаңартуларды алады.",
            },
          ],
        },
        aboutUs: {
          title: "Біз Кімбіз",
          description:
            "Біз үй жануарларының иелерін сенімді қамқоршылармен байланыстырамыз, бұл әрбір үй жануарына ең жақсы уақытша күтімді қамтамасыз етеді. Біздің миссиямыз-үй жануарларын қауіпсіз, сенімді және иелері үшін де, жануарлар үшін де стресстен арылту.",
          aboutAdventures: [
            "Сенімді Және Тексерілген Қамқоршылар-әрбір қамқоршы сіздің үй жануарыңыздың қауіпсіздігін қамтамасыз ету үшін мұқият тексеріледі.",
            "24/7 Қолдау Және Бақылау-біз сіздің үй жануарыңыздың әл-ауқаты туралы үздіксіз көмек пен жаңартуларды ұсынамыз.",
            "Өсіп Келе жатқан Жаһандық Қауымдастық – біздің қызметтерімізге сенетін мыңдаған үй жануарларын ұнататындарға Қосылыңыз.",
            "Оңай және Қауіпсіз Процесс-сұраудан қайтаруға дейін барлығы қарапайым және мөлдір.",
          ],
        },
        application: {
          title:
            "Біздің қолданба-үй жануарыңыз үшін шамадан тыс экспозицияны табудың ыңғайлы жолы!",
          description:
            "Қазір жүктеп алыңыз және үй жануарыңыздың қауіпсіздігіне көз жеткізіңіз!",
          consultation: "Консультация қажет пе?",
          consultationBtn: "Сұрақ қою",
          consultationDescription:
            "Егер сіз біздің веб-сайттан жауап таба алмасаңыз, бізге хабарласыңыз, біз сіздің сұрағыңызға толық жауап береміз.",
        },
        location: {
          title: "Біз Қайда Жұмыс Істейміз",
          desc: "Біз көптеген елдерде үй жануарларына күтім жасау бойынша сенімді қызметтерді ұсынамыз, бұл әрбір үй жануарына қажетті сүйіспеншілік пен көңіл бөлуді қамтамасыз етеді. Біздің өсіп келе жатқан қауымдастығымыз қауіпсіз және стресссіз тәжірибе алу үшін үй жануарларының иелерін тексерілген қамқоршылармен байланыстырады.",
          locations: "Біздің Орындар:",
        },
      },
    },
  },
  lng: savedLanguage, // Устанавливаем язык из localStorage
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
