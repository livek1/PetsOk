// src/components/icons/BoardingIcon.tsx

import { FC } from 'react';

// Общий интерфейс для всех иконок, можно даже вынести в отдельный файл
interface IconProps {
    width?: number | string;
    height?: number | string;
    color?: string;
    className?: string;
}

const BoardingIcon: FC<IconProps> = ({
    width = 32,
    height = 32,
    color = 'rgba(53, 152, 254)', // Цвет по умолчанию из вашего SVG
    className,
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill={color}
            aria-hidden="true"
            viewBox="0 0 32 32"
            className={className}
        >
            <path d="M22 17v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-3h-3v2H9v-2H7a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2v-9h2v9h14v-9h2v9h2a1 1 0 0 0 1-1V18a1 1 0 0 0-1-1h-2v2h-2v-2zM2.442 14C.81 14-.163 13.536.015 12.228c.05-.357.19-.676.459-1.153.017-.03.489-.836.631-1.099C1.676 8.924 1.97 8.01 1.97 7s-.293-1.924-.864-2.976c-.142-.263-.614-1.07-.631-1.1-.27-.476-.41-.795-.459-1.152C-.163.464.81 0 2.442 0c4.011 0 7 3.064 7 7s-2.989 7-7 7m0-2c2.895 0 5-2.157 5-5s-2.105-5-5-5q-.103 0-.19.002c.115.198.477.82.612 1.069C3.579 4.39 3.969 5.606 3.969 7s-.39 2.61-1.105 3.93c-.135.249-.498.87-.613 1.068l.19.002zM7 15h22a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V18a3 3 0 0 1 3-3m7-2h-2v-2a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2h-2v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1zm2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3z"></path>
        </svg>
    );
};

export default BoardingIcon;