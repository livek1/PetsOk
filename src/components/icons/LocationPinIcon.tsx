// src/components/icons/LocationPinIcon.tsx

import { FC } from 'react';

// Простой интерфейс для пропсов, чтобы можно было передавать className
interface IconProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

const LocationPinIcon: FC<IconProps> = (props) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props} // Передаем все пропсы (например, className) в svg
    >
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
    </svg>
);

export default LocationPinIcon;