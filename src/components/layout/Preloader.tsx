// --- File: src/components/layout/Preloader.tsx (НОВАЯ ВЕРСИЯ) ---
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import "../../style/components/Preloader.scss";

const pawPrints = [
  { x: -150, y: -25, rotate: 95 },
  { x: -100, y: 5, rotate: 70 },
  { x: -50, y: -25, rotate: 110 },
  { x: 0, y: 5, rotate: 80 },
  { x: 50, y: -25, rotate: 105 },
  { x: 100, y: 5, rotate: 75 },
  { x: 150, y: -25, rotate: 92 },
];

// Прелоадер теперь принимает колбэк onAnimationComplete
const Preloader = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  const [showPaws, setShowPaws] = useState(false);

  useEffect(() => {
    // Просто запускаем анимацию появления лапок
    const pawAppearTimer = setTimeout(() => setShowPaws(true), 100);

    // Устанавливаем минимальное время показа. 2 секунды - более чем достаточно, чтобы анимация успела проиграться.
    // После этого времени мы сообщаем родителю: "Моя часть работы закончена".
    const minDisplayTimer = setTimeout(() => {
      onAnimationComplete();
    }, 2000);

    return () => {
      clearTimeout(pawAppearTimer);
      clearTimeout(minDisplayTimer);
    };
  }, [onAnimationComplete]);

  return (
    <motion.div
      className="preloader"
      exit={{ opacity: 0 }} // Анимация исчезновения
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence>
        {showPaws &&
          pawPrints.map((pos, index) => (
            <motion.div
              key={index}
              className="paw-print"
              initial={{ opacity: 0, scale: 0.5, x: pos.x - 20, y: pos.y - 20, rotate: pos.rotate - 20 }}
              animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y, rotate: pos.rotate }}
              transition={{ duration: 0.5, delay: index * 0.3, ease: "easeOut" }}
            />
          ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Preloader;