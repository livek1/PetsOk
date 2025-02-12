import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import AboutUsSvg from "../assets/aboutUsSvg.svg";
import "../style/components/AbouUs.scss";

const AboutUs: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="about wrapper"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.img
        src={AboutUsSvg}
        alt=""
        width={600}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      />
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <h2>Who We Are</h2>
        <p>
          We connect pet owners with trusted caregivers, ensuring every pet
          receives the best temporary care. Our mission is to make pet-sitting
          safe, reliable, and stress-free for both owners and animals.
        </p>
        <ul>
          {[
            "Trusted & Verified Caregivers – Every caregiver is carefully checked to ensure your pet’s safety.",
            "24/7 Support & Monitoring – We provide continuous assistance and updates on your pet’s well-being.",
            "Growing Global Community – Join thousands of pet lovers who trust our services.",
            "Easy & Secure Process – From request to return, everything is simple and transparent.",
          ].map((text, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM10.001 16.413L6.99545 13.4139C6.6047 13.024 6.60391 12.3912 6.99369 12.0003C7.38371 11.6092 8.01701 11.6085 8.40793 11.9987L9.999 13.587L14.586 9C14.9765 8.60953 15.6095 8.60953 16 9C16.3905 9.39047 16.3905 10.0235 16 10.414L10.001 16.413Z"
                  fill="#2FAB73"
                />
              </svg>
              <p>{text}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;
