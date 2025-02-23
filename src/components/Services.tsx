import React from "react";
import { motion } from "framer-motion";
import ServiceImg from "../assets/Service.svg";
import "../style/components/Services.scss";
import { useTranslation } from "react-i18next";

const Services: React.FC = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      className="services wrapper"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2>{t("service.serviceTitle")}</h2>
      <div>
        <ul className="services-list">
          {t("service.serviceList", { returnObjects: true }).map((service) => (
            <motion.li key={service.key}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="80" height="80" rx="15" fill="#495068" />
                <path
                  d="M19.1 59.9L19.1009 52.2491C19.1013 48.0245 22.5262 44.6 26.7509 44.6H42.0497M48.425 50.975L50.975 53.525L59.9 44.6M50.975 19.1C54.0695 20.8346 56.075 23.6153 56.075 26.75C56.075 29.8846 54.0695 32.6654 50.975 34.4M44.6 26.75C44.6 30.975 41.175 34.4 36.95 34.4C32.725 34.4 29.3 30.975 29.3 26.75C29.3 22.525 32.725 19.1 36.95 19.1C41.175 19.1 44.6 22.525 44.6 26.75Z"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <motion.div
          className="services-img"
          initial={{ opacity: 0, x: 5 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img src={ServiceImg} alt="ServiceImg" width={650} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Services;
