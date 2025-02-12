import React, { FC } from "react";
import { motion } from "framer-motion";
import ServiceImg from "../assets/Service.svg";
import "../style/components/Services.scss";

const Services: FC = () => {
  return (
    <motion.div
      className="services wrapper"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2>Services for every dog and cat</h2>
      <div>
        <ul className="services-list">
          {[
            {
              title: "Boarding",
              text: "Your pets stay overnight in your sitter’s home. They’ll be treated like part of the family in a comfortable environment.",
            },
            {
              title: "House Sitting",
              text: "Your sitter takes care of your pets and your house. Your pets will get all the attention they need from the comfort of home.",
            },
            {
              title: "Dog Walking",
              text: "Your dog gets a walk around your local area. Perfect for busy days and dogs with extra energy to burn.",
            },
            {
              title: "Doggy Day Care",
              text: "Your dog spends the day at your sitter’s home. Drop them off in the morning and pick up a happy pup in the evening.",
            },
            {
              title: "Drop-In Visits",
              text: "Your sitter drops by your home to play with your pets, offer food, and give toilet breaks or clean the litter tray.",
            },
          ].map((service, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true, amount: 0.3 }} // Элемент появится, когда будет видно 30%
            >
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
                <p>{service.text}</p>
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
