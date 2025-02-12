import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import "../style/components/Preloader.scss";

const pawPrints = [
  { x: -150, y: -25, rotate: 95 },
  { x: -100, y: 5, rotate: 70 },
  { x: -50, y: -25, rotate: 110 },
  { x: 0, y: 5, rotate: 80 },
  { x: 50, y: -25, rotate: 105 },
  { x: 100, y: 5, rotate: 75 },
  { x: 150, y: -25, rotate: 92 },
];

const Preloader = ({ onFinish }: { onFinish: () => void }) => {
  const [showPaws, setShowPaws] = useState(false);
  const [hidePaws, setHidePaws] = useState(false);
  const [hideBackground, setHideBackground] = useState(false);

  useEffect(() => {
    const pawAppearTimer = setTimeout(() => setShowPaws(true), 100);
    const pawDisappearTimer = setTimeout(() => setHidePaws(true), 2000);
    const backgroundDisappearTimer = setTimeout(() => {
      setHideBackground(true);
      onFinish();
    }, 3500);

    return () => {
      clearTimeout(pawAppearTimer);
      clearTimeout(pawDisappearTimer);
      clearTimeout(backgroundDisappearTimer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!hideBackground && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <AnimatePresence>
            {showPaws &&
              !hidePaws &&
              pawPrints.map((pos, index) => (
                <motion.div
                  key={index}
                  className="paw-print"
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    x: pos.x - 20,
                    y: pos.y - 20,
                    rotate: pos.rotate - 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: pos.x,
                    y: pos.y,
                    rotate: pos.rotate,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
