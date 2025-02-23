import { motion } from "framer-motion";
import "../style/pages/index.scss";
import Header from "./Header";

import SearchSitter from "./SearchSitter";
import { useTranslation } from "react-i18next";

const Hero = ({ isPreloading }: { isPreloading: boolean }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="hero"
      initial={{ opacity: 0, y: 50 }}
      animate={isPreloading ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isPreloading ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1>{t("hero.welcome")}</h1>
        <p>{t("hero.heroDescription")}</p>

        <SearchSitter />
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <ul>
          <motion.li>
            <AnimatedCounter isPreloading={isPreloading} to={200} />
            <span>Чего-то</span>
          </motion.li>
          <motion.li>
            <AnimatedCounter isPreloading={isPreloading} to={10000} />
            <span>Ещё чего-то</span>
          </motion.li>
          <motion.li>
            <AnimatedCounter isPreloading={isPreloading} to={100} />
            <span>И этого тоже</span>
          </motion.li>
        </ul>
      </motion.div> */}
    </motion.div>
  );
};

export default Hero;
