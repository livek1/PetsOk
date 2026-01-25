// src/components/common/LazyLottiePlayer.tsx
import React, { Suspense, lazy } from 'react';

// Ленивый импорт библиотеки.
// React.lazy ожидает export default, а @dotlottie/react-player экспортирует именованный экспорт.
// Поэтому мы делаем небольшой хак с .then()
const DotLottiePlayerInternal = lazy(() =>
    import('@dotlottie/react-player').then((module) => ({
        default: module.DotLottiePlayer,
    }))
);

interface LazyLottieProps {
    src: string;
    autoplay?: boolean;
    loop?: boolean;
    style?: React.CSSProperties;
}

const LazyLottiePlayer: React.FC<LazyLottieProps> = (props) => {
    return (
        // Suspense показывает заглушку, пока качается файл плеера (те самые 514кб)
        <Suspense fallback={<div style={{ ...props.style, background: '#f0f0f0', borderRadius: '12px' }} />}>
            <DotLottiePlayerInternal {...props} />
        </Suspense>
    );
};

export default LazyLottiePlayer;