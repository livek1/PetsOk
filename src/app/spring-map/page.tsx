"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { YMaps, Map, Placemark, Polyline, GeolocationControl, ZoomControl } from '@pbe/react-yandex-maps';
import { config } from '@/config/appConfig';
import Link from 'next/link';

// Цвета из вашей дизайн-системы
const COLORS = {
    primary: '#3598FE',
    primaryHover: '#5CAEFF',
    neutral900: '#1A202C',
    neutral700: '#4A5568',
    neutral200: '#EDF2F7',
    error: '#FF3B30',
    success: '#34C759',
    white: '#FFFFFF',
    bg: '#F7FAFC'
};

export default function SpringViralMap() {
    const [center, setCenter] = useState<[number, number]>([55.751574, 37.573856]);
    const [zoom, setZoom] = useState(16);
    const [ymapsNamespace, setYmapsNamespace] = useState<any>(null);

    const [mines, setMines] = useState<{ lat: number, lon: number, emoji: string }[]>([]);
    const [route, setRoute] = useState<number[][]>([]);

    const [simState, setSimState] = useState<'idle' | 'scanning' | 'done'>('idle');
    const [snowOpacity, setSnowOpacity] = useState(0.95);

    // Данные для вирусной карточки
    const [addressName, setAddressName] = useState<string>("Ваш секретный двор");
    const [fakeStats, setFakeStats] = useState({ count: 0, survival: 100 });

    // 1. Геолокация
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCenter([pos.coords.latitude, pos.coords.longitude]);
                    setZoom(17);
                },
                (err) => console.warn("Геолокация недоступна", err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // 2. Обратное геокодирование (получаем улицу)
    useEffect(() => {
        if (ymapsNamespace && simState === 'idle') {
            ymapsNamespace.geocode(center).then((res: any) => {
                const firstGeoObject = res.geoObjects.get(0);
                if (firstGeoObject) {
                    const name = firstGeoObject.getThoroughfare() || firstGeoObject.getName();
                    if (name) setAddressName(name);
                }
            });
        }
    }, [ymapsNamespace, center, simState]);

    const customIconLayout = useMemo(() => {
        if (!ymapsNamespace) return null;
        return ymapsNamespace.templateLayoutFactory.createClass(
            '<div style="font-size: 34px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); margin-top: -17px; margin-left: -17px;">$[properties.iconContent]</div>'
        );
    }, [ymapsNamespace]);

    // 3. Запуск сканирования
    const handleStartSimulation = () => {
        setSimState('scanning');

        const finalMinesCount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
        const finalSurvival = Math.floor(Math.random() * 4) + 1; // 1-4%

        // Снег тает
        const snowInterval = setInterval(() => setSnowOpacity(prev => Math.max(0, prev - 0.04)), 150);

        // ИСПРАВЛЕНИЕ: Явная типизация массива
        const generatedMines: { lat: number, lon: number, emoji: string }[] = [];
        const emojis = ['💩', '💩', '💩', '☢️', '🥾', '💩', '⚠️', '💩'];
        for (let i = 0; i < 75; i++) {
            generatedMines.push({
                lat: center[0] + (Math.random() - 0.5) * 0.007,
                lon: center[1] + (Math.random() - 0.5) * 0.010,
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
            });
        }

        // Цифры бегут
        let currentVisualCount = 0;
        const counterInterval = setInterval(() => {
            currentVisualCount += 19;
            setFakeStats(prev => ({ ...prev, count: currentVisualCount }));
        }, 50);

        // Мины появляются
        let currentCount = 0;
        const mineInterval = setInterval(() => {
            currentCount += 5;
            setMines(generatedMines.slice(0, currentCount));

            if (currentCount >= generatedMines.length) {
                clearInterval(mineInterval);
                clearInterval(snowInterval);
                clearInterval(counterInterval);

                setFakeStats({ count: finalMinesCount, survival: finalSurvival });

                // Рисуем панический красный зигзаг (маршрут)
                const generatedRoute = [center];
                let curLat = center[0], curLon = center[1];
                for (let j = 0; j < 15; j++) {
                    curLat += (Math.random() - 0.5) * 0.002;
                    curLon += (Math.random() - 0.5) * 0.002;
                    generatedRoute.push([curLat, curLon]);
                }
                setRoute(generatedRoute);

                // Конец симуляции
                setTimeout(() => setSimState('done'), 1000);
            }
        }, 120);
    };

    // 4. Генерация текста для шеринга
    const handleShareText = async () => {
        const shareText = `🚨 Срочно! Улица ${addressName} признана зоной весеннего бедствия! ☢️\n\n💩 Найдено "сюрпризов": ${fakeStats.count}\n👟 Шанс спасти белые кроссовки: ${fakeStats.survival}%\n\n👆 Смотри скриншот карты!\n\nА какой статус у твоего двора? Проверь на радаре от PetsOk (кстати, их выгульщики убирают за собаками): https://petsok.ru`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'PetsOk Radar', text: shareText });
            } catch (err) { console.log('Шеринг отменен'); }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Смешной текст скопирован! Делай скриншот карты и отправляй соседям 🏢📲');
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: COLORS.bg, fontFamily: "'Raleway', 'Inter', sans-serif" }}>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes radarSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes slideUp { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
                .camera-corners::before { content: ''; position: absolute; top: 20px; left: 20px; width: 40px; height: 40px; border-top: 4px solid ${COLORS.error}; border-left: 4px solid ${COLORS.error}; z-index: 50; pointer-events: none; }
                .camera-corners::after { content: ''; position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-top: 4px solid ${COLORS.error}; border-right: 4px solid ${COLORS.error}; z-index: 50; pointer-events: none; }
                .camera-bottom::before { content: ''; position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; border-bottom: 4px solid ${COLORS.error}; border-left: 4px solid ${COLORS.error}; z-index: 50; pointer-events: none; }
                .camera-bottom::after { content: ''; position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border-bottom: 4px solid ${COLORS.error}; border-right: 4px solid ${COLORS.error}; z-index: 50; pointer-events: none; }
            `}} />

            {/* Рамка "Спутника" для красивого скриншота */}
            {simState === 'done' && (
                <>
                    <div className="camera-corners" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 40 }} />
                    <div className="camera-bottom" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '40vh', pointerEvents: 'none', zIndex: 40 }} />
                    <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', backgroundColor: COLORS.error, color: COLORS.white, padding: '6px 16px', borderRadius: 20, fontWeight: 900, fontSize: 14, letterSpacing: 2, zIndex: 50, animation: 'blink 1s infinite' }}>
                        TARGET LOCKED
                    </div>
                </>
            )}

            <YMaps query={{ apikey: config.yandexMapsApiKey, lang: 'ru_RU', load: 'package.full' }}>
                <Map
                    state={{ center, zoom }}
                    width="100%" height={simState === 'done' ? "60vh" : "100%"} // Карта сжимается, чтобы оставить место карточке
                    onLoad={(ymaps) => setYmapsNamespace(ymaps)}
                    options={{ suppressMapOpenBlock: true }}
                >
                    <GeolocationControl options={{ position: { right: 10, top: 100 } }} />
                    <ZoomControl options={{ position: { right: 10, top: 150 } }} />

                    {customIconLayout && mines.map((mine, idx) => (
                        <Placemark key={idx} geometry={[mine.lat, mine.lon]} properties={{ iconContent: mine.emoji }} options={{ iconLayout: customIconLayout, zIndex: 50 }} />
                    ))}

                    {route.length > 0 && (
                        <Polyline geometry={route} options={{ strokeColor: COLORS.error, strokeWidth: 6, strokeStyle: 'shortdash', strokeOpacity: 0.9 }} />
                    )}
                </Map>
            </YMaps>

            {/* Снег */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', opacity: snowOpacity, pointerEvents: 'none', transition: 'opacity 0.2s linear', zIndex: 10 }} />

            {/* Эффект радара */}
            {simState === 'scanning' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '150vmax', height: '150vmax', marginLeft: '-75vmax', marginTop: '-75vmax', background: `conic-gradient(from 0deg, transparent 70%, rgba(255, 59, 48, 0.1) 90%, ${COLORS.error} 100%)`, borderRadius: '50%', animation: 'radarSweep 2s linear infinite', pointerEvents: 'none', zIndex: 11 }} />
            )}

            {/* СТАРТОВАЯ ПАНЕЛЬ */}
            {simState !== 'done' && (
                <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 40px)', maxWidth: 400, backgroundColor: COLORS.white, borderRadius: 24, padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 100 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                            <div style={{ color: COLORS.neutral700, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Локация: {addressName}</div>
                            <div style={{ fontWeight: 800, fontSize: 24, color: COLORS.neutral900, lineHeight: 1.1, marginTop: 4 }}>PetsOk AI Radar 📡</div>
                        </div>
                        {simState === 'scanning' && (
                            <div style={{ color: COLORS.error, fontWeight: 900, fontSize: 24, minWidth: 60, textAlign: 'right' }}>{fakeStats.count}</div>
                        )}
                    </div>

                    <p style={{ fontSize: 15, color: COLORS.neutral700, margin: '0 0 20px 0', lineHeight: 1.5 }}>
                        {simState === 'idle' ? 'Снег тает. Мы просканировали город, чтобы узнать страшную правду о том, что под ним.' : 'Искусственный интеллект в панике считает мины...'}
                    </p>

                    <button onClick={handleStartSimulation} disabled={simState !== 'idle'} style={{ width: '100%', padding: '18px', background: simState === 'idle' ? `linear-gradient(135deg, ${COLORS.primary} 0%, #1E75D6 100%)` : COLORS.neutral200, color: simState === 'idle' ? COLORS.white : COLORS.neutral700, border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 16, cursor: simState === 'idle' ? 'pointer' : 'default', transition: 'all 0.3s', boxShadow: simState === 'idle' ? `0 12px 24px rgba(53, 152, 254, 0.3)` : 'none' }}>
                        {simState === 'idle' ? 'Узнать правду о своем дворе ❄️🔥' : 'Анализ био-угрозы...'}
                    </button>
                </div>
            )}

            {/* ВИРУСНАЯ КАРТОЧКА (BOTTOM SHEET), ИДЕАЛЬНАЯ ДЛЯ СКРИНШОТА */}
            {simState === 'done' && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    backgroundColor: COLORS.white,
                    borderTopLeftRadius: 32, borderTopRightRadius: 32,
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)', zIndex: 100,
                    animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 30px'
                }}>
                    {/* Ползунок "Шторки" */}
                    <div style={{ width: 40, height: 5, backgroundColor: COLORS.neutral200, borderRadius: 10, margin: '12px 0 20px' }} />

                    <div style={{ width: '100%', maxWidth: 440 }}>
                        {/* ЗАГОЛОВОК СКРИНШОТА */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 40, background: '#FFF0F0', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☢️</div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: COLORS.error, textTransform: 'uppercase' }}>Угроза: Критическая</h2>
                                <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: COLORS.neutral900 }}>{addressName}</p>
                            </div>
                        </div>

                        {/* СТАТИСТИКА */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div style={{ backgroundColor: COLORS.bg, padding: '16px', borderRadius: 20, border: `1px solid ${COLORS.neutral200}` }}>
                                <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.neutral900, lineHeight: 1 }}>{fakeStats.count}</div>
                                <div style={{ fontSize: 13, color: COLORS.neutral700, fontWeight: 700, marginTop: 4 }}>Мин найдено 💩</div>
                            </div>
                            <div style={{ backgroundColor: '#FFF0F0', padding: '16px', borderRadius: 20, border: `1px solid #FFE0E0` }}>
                                <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.error, lineHeight: 1 }}>{fakeStats.survival}%</div>
                                <div style={{ fontSize: 13, color: COLORS.error, fontWeight: 700, marginTop: 4 }}>Шанс выжить 👟</div>
                            </div>
                        </div>

                        {/* НАТИВНАЯ ИНТЕГРАЦИЯ БРЕНДА */}
                        <div style={{ backgroundColor: COLORS.neutral900, padding: '16px 20px', borderRadius: '20px', marginBottom: 24 }}>
                            <p style={{ color: COLORS.white, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                                <b>PetsOk</b> составили эту карту для статистики. <br />
                                Спойлер: <b>наши выгульщики убирают за хвостиками.</b> Доверяйте прогулки профессионалам с пакетиками!
                            </p>
                        </div>

                        {/* ДЕЙСТВИЯ (Вирусность + Конверсия) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Главная подсказка про скриншот */}
                            <button onClick={handleShareText} style={{
                                width: '100%', backgroundColor: COLORS.bg, color: COLORS.neutral900,
                                padding: '18px', borderRadius: 16, fontWeight: 800, fontSize: 16,
                                border: `2px dashed ${COLORS.neutral700}`, cursor: 'pointer', transition: 'transform 0.1s',
                            }}>
                                📸 Делай скриншот и жми сюда (текст для чата)
                            </button>

                            <Link href="/cabinet/" style={{
                                display: 'block', width: '100%', textAlign: 'center',
                                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1E75D6 100%)`,
                                color: COLORS.white, padding: '18px', borderRadius: 16,
                                fontWeight: 800, fontSize: 16, textDecoration: 'none',
                                boxShadow: `0 8px 20px rgba(53, 152, 254, 0.3)`
                            }}>
                                Спасти обувь — зарегистрироваться
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}