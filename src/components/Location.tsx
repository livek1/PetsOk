import React from "react";
import { motion } from "framer-motion";
import "../style/components/Location.scss";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";

const listVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

const Location: React.FC = () => {
  const { t } = useTranslation();
  const locations = [
    { name: "United States", position: [37.09024, -95.712891] },
    { name: "Russia", position: [55.751244, 37.618423] },
    { name: "Kazakhstan", position: [48.019573, 66.923684] },
  ];
  return (
    <motion.div
      className="location wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t("location.title")}
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t("location.desc")}
      </motion.p>

      <motion.span
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t("location.locations")}
      </motion.span>

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
        }}
      >
        {["United States", "Russia", "Kazakhstan"].map((country, index) => (
          <motion.li key={index} variants={listVariants}>
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.02 20.7699C13.02 21.4099 13.61 21.8999 14.23 21.7599C15.35 21.4999 16.41 21.0599 17.35 20.4599C17.88 20.1199 17.96 19.3599 17.51 18.9099C17.19 18.5899 16.68 18.5099 16.3 18.7499C15.53 19.2399 14.68 19.5999 13.77 19.7999C13.32 19.8999 13.02 20.3099 13.02 20.7699ZM4.03003 11.9999C4.03003 8.20988 6.68003 5.02988 10.23 4.20988C10.67 4.10988 10.98 3.69988 10.98 3.24988C10.98 2.60988 10.38 2.11988 9.76003 2.26988C7.56163 2.77953 5.6007 4.01887 4.19693 5.78583C2.79317 7.5528 2.02936 9.74318 2.03003 11.9999C2.03003 16.7399 5.33003 20.7099 9.76003 21.7399C10.38 21.8899 10.98 21.3999 10.98 20.7599C10.98 20.2999 10.67 19.8999 10.23 19.7999C6.68003 18.9699 4.03003 15.7899 4.03003 11.9999ZM20.79 10.9999C21.43 10.9999 21.92 10.4099 21.78 9.78988C21.52 8.66988 21.08 7.61988 20.48 6.66988C20.14 6.12988 19.38 6.05988 18.93 6.50988C18.61 6.82988 18.53 7.33988 18.78 7.71988C19.27 8.47988 19.63 9.32988 19.83 10.2499C19.92 10.6999 20.33 10.9999 20.79 10.9999ZM18.92 17.4899C19.37 17.9399 20.13 17.8699 20.47 17.3299C21.07 16.3899 21.51 15.3299 21.77 14.2099C21.91 13.5899 21.42 12.9999 20.79 12.9999C20.34 12.9999 19.92 13.2999 19.83 13.7399C19.63 14.6499 19.26 15.5099 18.78 16.2699C18.52 16.6599 18.6 17.1699 18.92 17.4899Z"
                fill="black"
              />
              <path
                d="M16 11.1C16 8.61 14.1 7 12 7C9.9 7 8 8.61 8 11.1C8 12.61 9.1 14.38 11.31 16.4C11.7 16.76 12.29 16.76 12.69 16.4C14.9 14.37 16 12.61 16 11.1ZM12 12C11.7242 11.9881 11.4637 11.8701 11.2728 11.6708C11.0818 11.4714 10.9753 11.206 10.9753 10.93C10.9753 10.654 11.0818 10.3886 11.2728 10.1892C11.4637 9.98987 11.7242 9.87193 12 9.86C12.2758 9.87193 12.5363 9.98987 12.7272 10.1892C12.9182 10.3886 13.0247 10.654 13.0247 10.93C13.0247 11.206 12.9182 11.4714 12.7272 11.6708C12.5363 11.8701 12.2758 11.9881 12 12Z"
                fill="black"
              />
            </svg>
            <p>{country}</p>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="map"
      >
        <MapContainer center={[51.505, -0.09]} zoom={3} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc, index) => (
            <Marker key={index} position={loc.position}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>
    </motion.div>
  );
};

export default Location;
