import { FC, useState } from "react";
import { motion } from "framer-motion";
import "../style/pages/index.scss";
import Header from "./Header";
import AnimatedCounter from "./AnimatedCounter";
import SearchSitter from "./SearchSitter";

const Hero = ({ isPreloading }: { isPreloading: boolean }) => {
  const [search, setSearch] = useState("");
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
        <h1>
          Loving Pet Care in Your <br /> Neighbourhood
        </h1>
        <p>
          Take the cat to your home for a couple of days or take a walk with the
          dog in the morning-it's up to you. PetsOk will help you flexibly set
          up your services and establish contacts with pet owners
        </p>
        {/* <div className="search-sitter">
          <ul className="search-sitter__hero">
            <li>
              <h3>Передержка</h3>
              <span>Дома у догситерра</span>
            </li>
            <li>
              <h3>Дневная няня</h3>
              <span>У вас дома</span>
            </li>
            <li>
              <h3>Выгул</h3>
              <span>В вашем районе</span>
            </li>
          </ul>
          <div className="search-sitter__body">
           
          </div>
        </div> */}
        <SearchSitter />
      </motion.div>

      <motion.div
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
      </motion.div>
    </motion.div>
  );
};

export default Hero;
