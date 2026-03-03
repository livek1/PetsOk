// --- File: src/components/home/Hero.tsx ---
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import Image from "next/image"; // ВАЖНО: Добавили импорт Next Image
import SearchSitter from '../SearchSitter';
import "@/style/pages/index.scss";

const CheckTagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ShieldVerifiedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

interface HeroProps {
  isPreloading: boolean;
  backgroundImage: string;
  onCreateOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ isPreloading, backgroundImage, onCreateOrderClick }) => {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const yBackground = useTransform(scrollY, [0, 1000], [0, 400]);

  return (
    <section className="hero">
      <div className="hero__bg-container">
        {/* ВАЖНО: motion.div больше не содержит backgroundImage, он просто двигает картинку внутри */}
        <motion.div
          className="hero__bg-layer"
          style={{ y: yBackground }}
        >
          {/* SEO Оптимизация LCP: Используем Next Image с priority */}
          <Image
            src={backgroundImage}
            alt={t("hero.alt", "PetsOk - Домашняя передержка и выгул собак")} // SEO-оптимизированный alt
            fill
            priority // Заставляет браузер качать картинку самой первой
            sizes="100vw" // Подсказка браузеру, что картинка на весь экран
            quality={85} // Оптимальное качество без перегруза веса
            style={{
              objectFit: "cover",
              objectPosition: "center bottom",
              zIndex: -1 // Важно: чтобы градиент-оверлей ::after из CSS оставался поверх картинки
            }}
          />
        </motion.div>
        <div className="hero__overlay"></div>
      </div>

      <motion.div
        className="hero__main-content"
        initial={{ opacity: 0, y: 30 }}
        animate={!isPreloading ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
      >
        <div className="hero__trust-badge">
          <div className="avatars-group">
            <img src="/images/avatars/sitter-1.jpg" alt="Топ ситтер PetsOk" />
            <img src="/images/avatars/sitter-2.jpg" alt="Ситтер PetsOk" />
            <img src="/images/avatars/sitter-3.jpg" alt="Догситтер PetsOk" />
            <div className="avatar-more">
              <ShieldVerifiedIcon />
            </div>
          </div>
          <div className="trust-text">
            <div className="stars">
              <svg viewBox="0 0 24 24" fill="#FFC107" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              <span>5.0</span>
            </div>
            <span className="subtitle">рейтинг наших ситтеров</span>
          </div>
        </div>

        <h1>{t("hero.welcome", "Никаких клеток. Только домашняя любовь.")}</h1>

        <motion.p
          className="hero__description"
          initial={{ opacity: 0, y: 20 }}
          animate={!isPreloading ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          {t("hero.heroDescription", "Найдите проверенного догситтера в вашем районе. Ваш питомец будет спать на диване, гулять по расписанию и получать 100% внимания.")}
        </motion.p>


        <div className="search-sitter-wrapper">
          <SearchSitter />
        </div>

        <motion.div
          className="hero__alternative-cta"
          initial={{ opacity: 0 }}
          animate={!isPreloading ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="divider-with-text">
            <span>ИЛИ</span>
          </div>

          <button onClick={onCreateOrderClick} className="btn-create-request">
            <div className="icon-wrapper">
              <span className="icon">👋</span>
            </div>
            <div className="text-col">
              <span className="btn-title">Организовать бесплатное знакомство</span>
              <span className="btn-sub">Оставьте заявку за 1 минуту, и ситтеры откликнутся сами</span>
            </div>
            <div className="arrow-wrapper">
              <span className="arrow">→</span>
            </div>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;