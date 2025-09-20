// src/components/icons/HouseSittingIcon.tsx

import { FC } from 'react';

interface IconProps {
    width?: number | string;
    height?: number | string;
    color?: string;
    className?: string;
}

const HouseSittingIcon: FC<IconProps> = ({
    width = 32,
    height = 32,
    color = 'rgba(53, 152, 254, 1)', // Новый цвет по умолчанию
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
            <path d="M23.026 12H23v-.024l-5-4.615-10 9.23V30h2v-3a4 4 0 1 1 8 0v3h10V16.592zM30 15.716l1.678 1.55a1 1 0 0 1-1.356 1.469L30 18.438V32H16v-5a2 2 0 0 0-4 0v5H6V18.438l-.322.297a1 1 0 0 1-1.356-1.47L18 4.64l5 4.615V8.5A1.5 1.5 0 0 1 24.5 7h4A1.5 1.5 0 0 1 30 8.5zm-2-1.846V9h-3v2.1zM21 21h2v-3h-2zm4 0h1v2h-8v-2h1v-3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2zM2.442 14C.81 14-.163 13.536.015 12.228c.05-.357.19-.676.459-1.153.017-.03.489-.836.631-1.099C1.676 8.924 1.97 8.01 1.97 7s-.293-1.924-.864-2.976c-.142-.263-.614-1.07-.631-1.1-.27-.476-.41-.795-.459-1.152C-.163.464.81 0 2.442 0c4.011 0 7 3.064 7 7s-2.989 7-7 7m0-2c2.895 0 5-2.157 5-5s-2.105-5-5-5q-.103 0-.19.002c.115.198.477.82.612 1.069C3.579 4.39 3.969 5.606 3.969 7s-.39 2.61-1.105 3.93c-.135.249-.498.87-.613 1.068l.19.002z"></path>
        </svg>
    );
};

export default HouseSittingIcon;