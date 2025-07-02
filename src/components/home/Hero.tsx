// --- File: src/components/home/Hero.tsx (ПОЛНАЯ ОБНОВЛЕННАЯ ВЕРСИЯ) ---
import { motion } from "framer-motion";
import "../../style/pages/index.scss";
import { useTranslation } from "react-i18next";
import SearchSitter from '../SearchSitter';

interface HeroProps {
  isPreloading: boolean;
  backgroundImage: string;
}

const Hero: React.FC<HeroProps> = ({ isPreloading, backgroundImage }) => {
  const { t } = useTranslation();

  const heroStyle = {
    backgroundImage: `url(${backgroundImage})`
  };

  return (
    <motion.section
      className="hero"
      style={heroStyle}
      initial={{ opacity: 0 }}
      animate={!isPreloading ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="hero__overlay"></div>

      <motion.div
        className="hero__main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={!isPreloading ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      >
        <h1>{t("hero.welcome")}</h1>

        {/* --- ИЗМЕНЕНИЕ 1: Добавили описание (подзаголовок) --- */}
        <motion.p
          className="hero__description"
          initial={{ opacity: 0, y: 15 }}
          animate={!isPreloading ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        >
          {t("hero.heroDescription")}
        </motion.p>

        <SearchSitter />
      </motion.div>
    </motion.section>
  );
};

export default Hero;