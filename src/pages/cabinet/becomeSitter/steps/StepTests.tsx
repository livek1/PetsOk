import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getRequiredTests, getTestStructure, submitTestAnswers } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepTests.module.scss';
import wizardStyle from '../BecomeSitterWizard.module.scss';

// Иконки
const LockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const BackIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const PlayIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;

const StepTests = ({ onNext }: { onNext: () => void }) => {
    const { t } = useTranslation();

    // --- State: Overview ---
    const [tests, setTests] = useState<any[]>([]);
    const [loadingOverview, setLoadingOverview] = useState(true);

    // --- State: Player ---
    const [view, setView] = useState<'overview' | 'player'>('overview');
    const [activeTest, setActiveTest] = useState<any>(null);
    const [testStructure, setTestStructure] = useState<any>(null);
    const [loadingTest, setLoadingTest] = useState(false);

    // Плеер и ответы
    const [isMediaFinished, setIsMediaFinished] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number | number[] }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Состояния для Аудио плеера
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // Процент 0-100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    // Анти-перемотка
    const maxViewedTimeRef = useRef(0); // Максимальная секунда, которую юзер реально посмотрел

    // --- 1. Загрузка списка тестов ---
    const fetchTests = async () => {
        setLoadingOverview(true);
        try {
            // Добавляем timestamp, чтобы избежать кэширования браузером и увидеть статус "Сдано" сразу
            const res = await getRequiredTests();
            // Нормализация статусов на случай, если бэкенд отдает user_passed=true, но user_status=null
            const normalizedTests = (res.data || []).map((test: any) => ({
                ...test,
                user_status: test.user_status || (test.user_passed ? 'passed' : 'pending_submission')
            }));
            setTests(normalizedTests);
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки тестов');
        } finally {
            setLoadingOverview(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    // --- 2. Логика перехода в плеер ---
    const handleOpenTest = async (test: any) => {
        if (test.user_status === 'failed_no_retake') {
            alert('Вы исчерпали все попытки для этого теста.');
            return;
        }

        setActiveTest(test);
        setView('player');
        setLoadingTest(true);

        // Сброс состояний плеера
        setIsMediaFinished(false);
        setUserAnswers({});
        maxViewedTimeRef.current = 0;
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setPlaybackRate(1.0);

        try {
            // Грузим структуру
            const res = await getTestStructure(test.id.toString(), ['sections.questions.answerOptions', 'sections.mediaFile']);
            setTestStructure(res.data);

            const firstSection = res.data.sections?.data?.[0];
            // Если медиа нет или тип 'none', сразу разрешаем вопросы
            if (!firstSection || firstSection.media_type === 'none' || !firstSection.mediaFile?.data?.url) {
                setIsMediaFinished(true);
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки структуры теста');
            setView('overview');
        } finally {
            setLoadingTest(false);
        }
    };

    // --- 3. Управление медиа (Аудио / Видео) ---

    // Обновление времени и блокировка перемотки вперед
    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
        const el = e.currentTarget;
        const current = el.currentTime;

        // --- ЛОГИКА ЗАПРЕТА ПЕРЕМОТКИ ВПЕРЕД ---
        // Если юзер пытается прыгнуть вперед дальше чем на 1 секунду от того, что видел
        if (!el.seeking && current > maxViewedTimeRef.current) {
            maxViewedTimeRef.current = current;
        }

        setCurrentTime(current);
        if (el.duration) {
            setDuration(el.duration);
            setProgress((current / el.duration) * 100);
        }
    };

    const handleSeeking = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
        const el = e.currentTarget;
        // Разрешаем перематывать назад, но не вперед дальше достигнутого максимума + 1 сек
        if (el.currentTime > maxViewedTimeRef.current + 1) {
            el.currentTime = maxViewedTimeRef.current;
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setIsMediaFinished(true);
        maxViewedTimeRef.current = duration; // Разрешаем полную навигацию
    };

    const toggleAudioPlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleSpeed = () => {
        // Ограничиваем скорость максимум 1.5
        let newRate = 1.0;
        if (playbackRate === 1.0) newRate = 1.25;
        else if (playbackRate === 1.25) newRate = 1.5;
        else newRate = 1.0;

        setPlaybackRate(newRate);
        if (audioRef.current) audioRef.current.playbackRate = newRate;
        if (videoRef.current) videoRef.current.playbackRate = newRate;
    };

    // Защита для нативного видео-плеера (если юзер выберет 2x через меню браузера)
    const handleRateChange = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
        const el = e.currentTarget;
        if (el.playbackRate > 1.5) {
            el.playbackRate = 1.5;
        }
    };

    // Формат времени мм:сс
    const formatTime = (time: number) => {
        if (!time) return "00:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    // --- 4. Логика ответов ---
    const toggleAnswer = (questionId: number, optionId: number, type: 'single_choice' | 'multiple_choice') => {
        setUserAnswers(prev => {
            const newAnswers = { ...prev };
            if (type === 'single_choice') {
                newAnswers[questionId] = optionId;
            } else {
                let current = newAnswers[questionId] as number[] || [];
                if (current.includes(optionId)) {
                    newAnswers[questionId] = current.filter(id => id !== optionId);
                } else {
                    newAnswers[questionId] = [...current, optionId];
                }
            }
            return newAnswers;
        });
    };

    // --- 5. Отправка ответов ---
    const handleSubmitTest = async () => {
        const questions = testStructure?.sections?.data?.[0]?.questions?.data || [];

        const allAnswered = questions.every((q: any) => {
            const ans = userAnswers[q.id];
            return ans !== undefined && (Array.isArray(ans) ? ans.length > 0 : true);
        });

        if (!allAnswered) {
            alert('Пожалуйста, ответьте на все вопросы.');
            return;
        }

        setIsSubmitting(true);
        const payload = questions.map((q: any) => ({
            question_id: q.id,
            selected_answer_option_id: Array.isArray(userAnswers[q.id]) ? userAnswers[q.id][0] : userAnswers[q.id]
        }));

        try {
            const res = await submitTestAnswers({ test_id: activeTest.id, answers: payload });
            const passed = res.data.passed;

            if (passed) {
                alert('Поздравляем! Тест успешно сдан.');
                // Возвращаемся в список и обновляем статусы
                setView('overview');
                await fetchTests();
            } else {
                alert('К сожалению, тест не сдан. Исправьте ошибки и попробуйте отправить снова.');
                // --- ИЗМЕНЕНИЕ: Не выходим в overview, остаемся тут ---
                // Пользователь может поменять ответы и нажать кнопку снова
            }

        } catch (e: any) {
            alert(e.response?.data?.message || 'Ошибка отправки');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Проверка условий (все ли нужное сдано?) ---
    const generalTests = tests.filter(t => !t.service_key_target && t.user_status !== 'not_required');
    const serviceTests = tests.filter(t => t.service_key_target && t.user_status !== 'not_required');

    const areGeneralPassed = generalTests.length === 0 || generalTests.every(t => t.user_status === 'passed');
    const isOneServicePassed = serviceTests.length === 0 || serviceTests.some(t => t.user_status === 'passed');
    const canProceed = areGeneralPassed && isOneServicePassed;


    // ==========================================
    // VIEW: PLAYER (ПРОХОЖДЕНИЕ)
    // ==========================================
    if (view === 'player') {
        if (loadingTest) return <div className={wizardStyle.centerLoader}>Загрузка теста...</div>;
        if (!testStructure) return <div>Ошибка данных теста.</div>;

        const section = testStructure.sections.data[0];
        const media = section?.mediaFile?.data;
        const questions = section?.questions?.data || [];

        return (
            <div className={wizardStyle.stepCard}>
                <div className={style.testHeader}>
                    <button onClick={() => setView('overview')}><BackIcon /></button>
                    <h2>{testStructure.title}</h2>
                </div>

                {/* --- Медиа Плеер --- */}
                {section.media_type !== 'none' && media?.url && (
                    <div className={style.mediaContainer}>
                        {section.media_type === 'video' ? (
                            // ВИДЕО: Используем нативные контролы, но ограничиваем перемотку и скорость
                            <video
                                ref={videoRef}
                                src={media.url}
                                controls
                                controlsList="nodownload" // Скрываем кнопку скачивания (в Chrome)
                                className={style.videoPlayer}
                                onTimeUpdate={handleTimeUpdate}
                                onSeeking={handleSeeking}
                                onRateChange={handleRateChange}
                                onEnded={handleEnded}
                            />
                        ) : (
                            // АУДИО: Кастомный плеер
                            <div className={style.customAudioPlayer}>
                                <audio
                                    ref={audioRef}
                                    src={media.url}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                />
                                <div className={style.audioControls}>
                                    <button className={style.playBtn} onClick={toggleAudioPlay}>
                                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </button>

                                    <div className={style.progressWrapper}>
                                        <div className={style.progressBarBg}>
                                            <div
                                                className={style.progressBarFill}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className={style.timeRow}>
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>

                                    <button className={style.speedBtn} onClick={toggleSpeed}>
                                        {playbackRate}x
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Блокировка вопросов */}
                {!isMediaFinished && section.media_type !== 'none' ? (
                    <div className={style.lockedContainer}>
                        <LockIcon />
                        <p>Вопросы откроются после полного изучения материала (досмотрите видео / дослушайте аудио до конца).</p>
                    </div>
                ) : (
                    <div className={style.questionsList}>
                        {questions.map((q: any, idx: number) => (
                            <div key={q.id} className={style.questionItem}>
                                <h4>{idx + 1}. {q.text}</h4>
                                <div className={style.optionsList}>
                                    {q.answerOptions.data.map((opt: any) => {
                                        const isMulti = q.type === 'multiple_choice';
                                        const isSelected = isMulti
                                            ? (userAnswers[q.id] as number[] || []).includes(opt.id)
                                            : userAnswers[q.id] === opt.id;

                                        return (
                                            <div
                                                key={opt.id}
                                                className={`${style.optionCard} ${isSelected ? style.selected : ''}`}
                                                onClick={() => toggleAnswer(q.id, opt.id, q.type)}
                                            >
                                                <div className={`${style.indicator} ${isMulti ? style.multiple : ''} ${isSelected ? style.active : ''}`}>
                                                    {isSelected && <CheckIcon />}
                                                </div>
                                                <span>{opt.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    className={wizardStyle.btnPrimary}
                    onClick={handleSubmitTest}
                    disabled={isSubmitting || (!isMediaFinished && section.media_type !== 'none')}
                    style={{ marginTop: 30 }}
                >
                    {isSubmitting ? 'Отправка...' : 'Отправить ответы'}
                </button>
            </div>
        );
    }

    // ==========================================
    // VIEW: OVERVIEW (СПИСОК)
    // ==========================================
    if (loadingOverview) return <div className={wizardStyle.centerLoader}>Загрузка тестов...</div>;

    const renderTestList = (list: any[]) => {
        return list.map(test => {
            const isPassed = test.user_status === 'passed';
            const isNoRetake = test.user_status === 'failed_no_retake';
            const attemptsLeft = test.max_attempts ? Math.max(0, test.max_attempts - test.user_attempts_made) : null;

            return (
                <div
                    key={test.id}
                    className={`${style.testCard} ${isPassed ? style.passed : ''} ${isNoRetake ? style.disabled : ''}`}
                    onClick={() => !isPassed && !isNoRetake ? handleOpenTest(test) : null}
                >
                    <div className={style.cardHeader}>
                        <h3 className={style.testTitle}>{test.title}</h3>
                        <span className={`${style.statusPill} ${isPassed ? style.passed : isNoRetake ? style.failed : style.pending}`}>
                            {isPassed ? 'Сдано' : isNoRetake ? 'Провалено' : test.user_status === 'failed_can_retake' ? 'Пересдать' : 'Нужно сдать'}
                        </span>
                    </div>
                    {test.description && <p className={style.testDesc}>{test.description}</p>}

                    <div className={style.cardFooter}>
                        <span className={style.attemptsText}>
                            {!isPassed && (attemptsLeft === null ? '∞ попыток' : `Осталось попыток: ${attemptsLeft}`)}
                        </span>
                        {!isPassed && !isNoRetake && (
                            <span className={style.actionButton}>
                                {test.user_status === 'failed_can_retake' ? 'Пересдать' : 'Начать'} &rarr;
                            </span>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={wizardStyle.stepCard}>
            <div className={wizardStyle.header}>
                <h1>Тестирование</h1>
                <p>Сдайте общие тесты и выберите услуги, которые хотите оказывать.</p>
            </div>

            <div className={style.testsContainer}>
                {generalTests.length > 0 && (
                    <div>
                        <h3 className={style.sectionTitle}>Общие знания (Обязательно)</h3>
                        {renderTestList(generalTests)}
                    </div>
                )}

                {serviceTests.length > 0 && (
                    <div>
                        <h3 className={style.sectionTitle}>Услуги (Минимум одна)</h3>
                        {renderTestList(serviceTests)}
                    </div>
                )}

                {generalTests.length === 0 && serviceTests.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#888' }}>Нет доступных тестов.</p>
                )}
            </div>

            <button
                className={wizardStyle.btnPrimary}
                onClick={onNext}
                disabled={!canProceed}
            >
                {canProceed ? 'Продолжить' : 'Сдайте тесты для продолжения'}
            </button>
        </div>
    );
};

export default StepTests;