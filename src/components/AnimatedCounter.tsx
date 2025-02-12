import { motion, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedCounter = ({
  isPreloading,
  from = 0,
  to,
}: {
  isPreloading: boolean;
  from?: number;
  to: number;
}) => {
  const count = useMotionValue(from);
  const smoothCount = useSpring(count, { damping: 10, stiffness: 90 });
  const [displayNumber, setDisplayNumber] = useState(from);

  useEffect(() => {
    if (!isPreloading) {
      count.set(to); // Анимация начинается после прелоадинга
    }
  }, [isPreloading, to, count]);

  useEffect(() => {
    const unsubscribe = smoothCount.on("change", (latest) => {
      setDisplayNumber(Math.round(latest));
    });

    return () => unsubscribe();
  }, [smoothCount]);

  return <motion.h2>{displayNumber}+</motion.h2>;
};

export default AnimatedCounter;
