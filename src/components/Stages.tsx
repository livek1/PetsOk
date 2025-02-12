import React, { FC } from "react";
import "../style/components/Stages.scss";
import { motion } from "framer-motion";

const listItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const stageinfoList = [
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
    description: "The pet is safely transferred to the temporary caregiver.",
  },
  {
    title: "Monitoring & feedback",
    description: "Owners receive updates, ensuring the pet's well-being.",
  },
];

const Stages: FC = () => {
  return (
    <motion.div
      className="stages "
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="stages-wrapper wrapper">
        <h2>How does our service work?</h2>
        <p>
          Our service helps you find a temporary owner for your pet when you
          need to leave. Here's how it works:
        </p>

        <div>
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {stageinfoList.map((item, i) => (
              <motion.li key={i} custom={i} variants={listItemVariants}>
                <div></div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <svg
                  width="181"
                  height="185"
                  viewBox="0 0 181 185"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.2" clipPath="url(#clip0_2408_19)">
                    <path
                      d="M89.3558 90.1716C77.5062 81.7803 66.4768 91.3614 48.4023 94.0522C21.876 98.0008 15.1679 113.629 22.6197 123.501C30.0716 133.373 46.2524 128.041 56.3382 135.933L56.4496 135.986L56.554 136.035C66.9518 143.5 66.8216 160.872 78.2619 165.167C89.7022 169.463 102.299 158.252 98.0372 131.21C95.071 112.774 100.727 99.163 89.3558 90.1716Z"
                      fill="#9BB3C7"
                    />
                    <path
                      d="M67.8939 59.9066C67.5444 74.1517 60.0623 85.8259 51.1977 85.9561C42.3332 86.0864 35.4167 74.6806 35.7801 60.4421C36.1436 46.2035 43.6048 34.5195 52.4693 34.3893C61.3338 34.259 68.2539 45.6754 67.8939 59.9066Z"
                      fill="#9BB3C7"
                    />
                    <path
                      d="M123.974 101.993C110.754 106.585 102.119 117.366 104.625 126.075C107.131 134.783 119.89 138.085 133.089 133.483C146.289 128.881 154.948 118.103 152.432 109.398C149.916 100.694 137.188 97.362 123.974 101.993Z"
                      fill="#9BB3C7"
                    />
                    <path
                      d="M109.961 55.016C103.283 68.6302 91.1366 76.3393 82.8255 72.2441C74.5144 68.1489 73.1881 53.796 79.8661 40.1818C86.5441 26.5676 98.6903 18.8585 107.001 22.9538C115.312 27.049 116.656 41.3651 109.961 55.016Z"
                      fill="#9BB3C7"
                    />
                    <path
                      d="M115.998 59.4925C105.281 70.0729 101.712 84.2188 108.023 91.0956C114.335 97.9724 128.136 94.982 138.864 84.3796C149.592 73.7772 153.151 59.6533 146.839 52.7765C140.528 45.8998 126.716 48.9121 115.998 59.4925Z"
                      fill="#9BB3C7"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2408_19">
                      <rect
                        width="132.772"
                        height="141.003"
                        fill="white"
                        transform="translate(60.0976) rotate(25.2276)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Stages;
