import React from "react";
import MainLayout from "../layouts/MainLayout";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Stages from "../components/Stages";
import Reviews from "../components/Reviews";
import Application from "../components/Application";
import AboutUs from "../components/AboutUs";
import Location from "../components/location";

const Home = ({ isPreloading }: { isPreloading: boolean }) => {
  return (
    <div>
      <MainLayout>
        <Hero isPreloading={isPreloading} />
        <Services />
        <Stages />
        <AboutUs />
        <Reviews />
        <Application />
        <Location />
      </MainLayout>
    </div>
  );
};

export default Home;
