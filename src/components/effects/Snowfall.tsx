// src/components/effects/Snowfall.tsx
import React, { useEffect, useRef } from 'react';

interface SnowfallProps {
    count?: number; // Количество снежинок
}

const Snowfall: React.FC<SnowfallProps> = ({ count = 60 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Настройка размера
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Конфигурация снежинок
        const snowflakes: any[] = [];

        // Инициализация снежинок
        for (let i = 0; i < count; i++) {
            snowflakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1, // Размер 1-3px
                density: Math.random() * count, // Для разной скорости падения
                color: `rgba(235, 245, 255, ${Math.random() * 0.5 + 0.4})` // Легкий голубой, разная прозрачность
            });
        }

        let animationFrameId: number;
        let angle = 0;

        const draw = () => {
            // 1. Очищаем холст (удаляем прошлый кадр)
            ctx.clearRect(0, 0, width, height);

            // 2. Настраиваем тень (для видимости на белом)
            // Ставим тень один раз для всего контекста — это быстрее
            ctx.shadowBlur = 2;
            ctx.shadowColor = "rgba(0,0,0,0.2)";

            // 3. Рисуем каждую снежинку
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const p = snowflakes[i];

                // Рисуем круг
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
            }
            // Заливаем всё одним цветом (светло-голубым) для оптимизации вызовов
            ctx.fillStyle = "#E6F4FF";
            ctx.fill();

            // 4. Обновляем координаты
            angle += 0.01; // Ветер
            for (let i = 0; i < count; i++) {
                const p = snowflakes[i];

                // Движение вниз + легкое покачивание (sin)
                p.y += Math.cos(angle + p.density) + 1 + p.radius / 2;
                p.x += Math.sin(angle) * 2;

                // Если улетел за границу — возвращаем наверх
                if (p.x > width + 5 || p.x < -5 || p.y > height) {
                    if (i % 3 > 0) { // 66% снежинок падают сверху
                        snowflakes[i] = { x: Math.random() * width, y: -10, radius: p.radius, density: p.density };
                    } else {
                        // Если снежинка ушла за правый край, она может появиться слева
                        if (Math.sin(angle) > 0) {
                            snowflakes[i] = { x: -5, y: Math.random() * height, radius: p.radius, density: p.density };
                        } else {
                            snowflakes[i] = { x: width + 5, y: Math.random() * height, radius: p.radius, density: p.density };
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        // Обработка ресайза окна
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [count]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Клики сквозь
                zIndex: 9999,
            }}
        />
    );
};

export default React.memo(Snowfall);