// --- File: src/components/logos/GooglePlayLogo.tsx ---
import { FC } from 'react';

const GooglePlayLogo: FC = () => (
    <svg width="32" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_ii_google)"> {/* Изменил ID фильтров, чтобы избежать конфликтов, если на странице несколько SVG с одинаковыми ID */}
            <path
                d="M.914 1.176C.526 1.592.297 2.237.297 3.073v29.856c0 .837.23 1.481.617 1.897l.099.097 16.519-16.725v-.394L1.012 1.078l-.098.098z"
                fill="url(#paint0_linear_google)"
            />
            <path
                d="M23.037 23.775l-5.506-5.577v-.394l5.507-5.575.124.071 6.524 3.753c1.863 1.072 1.863 2.826 0 3.899l-6.524 3.753-.125.07z"
                fill="url(#paint1_linear_google)"
            />
            <g filter="url(#filter1_i_google)">
                <path
                    d="M23.162 23.704L17.53 18 .914 34.828c.613.658 1.628.74 2.77.083l19.478-11.206z"
                    fill="url(#paint2_linear_google)"
                />
            </g>
            <path
                d="M23.162 12.299L3.685 1.094C2.542.436 1.527.519.915 1.178L17.53 18.003l5.631-5.704z"
                fill="url(#paint3_linear_google)"
            />
        </g>
        <defs>
            <linearGradient
                id="paint0_linear_google"
                x1="16.067"
                y1="2.757"
                x2="-6.587"
                y2="25.131"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#00A0FF" />
                <stop offset=".007" stopColor="#00A1FF" />
                <stop offset=".26" stopColor="#00BEFF" />
                <stop offset=".512" stopColor="#00D2FF" />
                <stop offset=".76" stopColor="#00DFFF" />
                <stop offset="1" stopColor="#00E3FF" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_google"
                x1="32.111"
                y1="18.001"
                x2="-.151"
                y2="18.001"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FFE000" />
                <stop offset=".409" stopColor="#FFBD00" />
                <stop offset=".775" stopColor="orange" />
                <stop offset="1" stopColor="#FF9C00" />
            </linearGradient>
            <linearGradient
                id="paint2_linear_google"
                x1="20.104"
                y1="21.098"
                x2="-10.618"
                y2="51.441"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FF3A44" />
                <stop offset="1" stopColor="#C31162" />
            </linearGradient>
            <linearGradient
                id="paint3_linear_google"
                x1="-3.271"
                y1="-8.761"
                x2="10.447"
                y2="4.787"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#32A071" />
                <stop offset=".069" stopColor="#2DA771" />
                <stop offset=".476" stopColor="#15CF74" />
                <stop offset=".801" stopColor="#06E775" />
                <stop offset="1" stopColor="#00F076" />
            </linearGradient>
            <filter
                id="filter0_ii_google"
                x=".297"
                y=".64"
                width="30.786"
                height="34.723"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                    in="SourceAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="-.15" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                <feBlend in2="shape" result="effect1_innerShadow" />
                <feColorMatrix
                    in="SourceAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy=".15" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
                <feBlend in2="effect1_innerShadow" result="effect2_innerShadow" />
            </filter>
            <filter
                id="filter1_i_google"
                x=".914"
                y="18.002"
                width="22.248"
                height="17.362"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                    in="SourceAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="-.15" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                <feBlend in2="shape" result="effect1_innerShadow" />
            </filter>
        </defs>
    </svg>
);

export default GooglePlayLogo;