import React from "react";
import "../style/components/Reviews.scss";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

const Reviews: React.FC = () => {
  const slides = [
    {
      date: "22 июля 2021",
      name: "Полина Гофман",
      text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odit, quam alias. Illum perferendis perspiciatis voluptates, deserunt est eveniet quae officia?",
    },
    {
      date: "22 июля 2021",
      name: "Полина Гофман",
      text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odit, quam alias. Illum perferendis perspiciatis voluptates, deserunt est eveniet quae officia?",
    },
    {
      date: "22 июля 2021",
      name: "Полина Гофман",
      text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odit, quam alias. Illum perferendis perspiciatis voluptates, deserunt est eveniet quae officia?",
    },
    {
      date: "22 июля 2021",
      name: "Полина Гофман",
      text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odit, quam alias. Illum perferendis perspiciatis voluptates, deserunt est eveniet quae officia?",
    },
  ];
  return (
    <motion.div
      className="reviews wrapper"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.h2
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        Reviews
      </motion.h2>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2 },
          1440: { slidesPerView: 3 },
        }}
        className="mySwiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="slide">
              <div className="slide-image"></div>
              <small>{slide.date}</small>
              <h2>{slide.name}</h2>
              <p>{slide.text}</p>
            </div>
          </SwiperSlide>
        ))}
        <button className="swiper-button-prev">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="swiper-button-next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Swiper>
    </motion.div>
  );
};

export default Reviews;
