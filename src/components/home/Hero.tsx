// --- File: src/components/home/Hero.tsx ---
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import SearchSitter from '../SearchSitter';
import "../../style/pages/index.scss";

interface HeroProps {
  isPreloading: boolean;
  backgroundImage: string;
  onCreateOrderClick: () => void; // Новый проп
}

const Hero: React.FC<HeroProps> = ({ isPreloading, backgroundImage, onCreateOrderClick }) => {
  const { t } = useTranslation();

  const { scrollY } = useScroll();
  // Параллакс эффект
  const yBackground = useTransform(scrollY, [0, 1000], [0, 400]);

  return (
    <section className="hero">

      {/* 
         НОВЫЙ КОНТЕЙНЕР ДЛЯ ФОНА
         Он будет иметь overflow: hidden, чтобы картинка не вылезала 
      */}
      <div className="hero__bg-container">
        <motion.div
          className="hero__bg-layer"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            y: yBackground
          }}
        />
        <div className="hero__overlay"></div>
      </div>

      {/* 
         КОНТЕНТ (Форма)
         Он находится поверх фона, и у него нет overflow: hidden,
         поэтому список может выпадать свободно
      */}
      <motion.div
        className="hero__main-content"
        initial={{ opacity: 0, y: 30 }}
        animate={!isPreloading ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
      >
        <h1>{t("hero.welcome")}</h1>

        <motion.p
          className="hero__description"
          initial={{ opacity: 0, y: 20 }}
          animate={!isPreloading ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          {t("hero.heroDescription")}
        </motion.p>

        <div className="search-sitter-wrapper">
          <SearchSitter />
        </div>

        {/* --- НОВЫЙ БЛОК: АЛЬТЕРНАТИВНЫЙ ВЫБОР --- */}
        <motion.div
          className="hero__alternative-cta"
          initial={{ opacity: 0 }}
          animate={!isPreloading ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="divider-with-text">
            <span>{t('hero.orDivider', 'ИЛИ')}</span>
          </div>

          <button onClick={onCreateOrderClick} className="btn-create-request">
            <span className="icon">⚡️</span>
            <div className="text-col">
              <span className="btn-title">{t('hero.createRequestTitle', 'Создать заявку')}</span>
              <span className="btn-sub">{t('hero.createRequestSub', 'Опишите задачу — ситтеры откликнутся сами')}</span>
            </div>
            <span className="arrow">→</span>
          </button>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default Hero;