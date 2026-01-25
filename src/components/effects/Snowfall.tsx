import React, { useMemo } from 'react';
// Если у вас еще нет папки effects, создайте её.
// Стили для этого компонента можно положить рядом или в общую папку стилей.
import style from '../../style/components/effects/Snowfall.module.scss';

interface SnowfallProps {
    count?: number;
}

const Snowfall: React.FC<SnowfallProps> = ({ count = 50 }) => {
    const snowflakes = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const left = Math.random() * 100;
            const animDuration = 5 + Math.random() * 10;
            const animDelay = Math.random() * 10;
            const size = 3 + Math.random() * 7;
            const opacity = 0.4 + Math.random() * 0.6;

            return (
                <div
                    key={i}
                    className={style.snowflake}
                    style={{
                        left: `${left}%`,
                        animationDuration: `${animDuration}s`,
                        animationDelay: `-${animDelay}s`,
                        width: `${size}px`,
                        height: `${size}px`,
                        opacity: opacity,
                    }}
                />
            );
        });
    }, [count]);

    return <div className={style.snowContainer}>{snowflakes}</div>;
};

export default React.memo(Snowfall);