import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { submitKycProfile } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepKYC.module.scss';

// --- Иконки (SVG) ---

const PassportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M15 8h2" />
        <path d="M15 12h2" />
        <path d="M7 16h10" />
    </svg>
);

const SelfieIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <path d="M12 13m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    </svg>
);

const CameraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const EyeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// Иконки для блока доверия
const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const FileDocIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const FileCheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

interface StepKYCProps {
    onNext: () => void;
    isResubmission: boolean;
    adminMessage?: string;
}

const StepKYC = ({ onNext, isResubmission, adminMessage }: StepKYCProps) => {
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birth, setBirth] = useState('');
    const [gender, setGender] = useState('0');

    const [docPhoto, setDocPhoto] = useState<{ file: File; preview: string } | null>(null);
    const [selfiePhoto, setSelfiePhoto] = useState<{ file: File; preview: string } | null>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Вычисляем дату, которая была 18 лет назад (для ограничения календаря и валидации)
    const maxDate18Plus = useMemo(() => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return today.toISOString().split("T")[0]; // YYYY-MM-DD
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'selfie') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);

            if (type === 'doc') {
                setDocPhoto({ file, preview });
                setErrors(prev => ({ ...prev, document_photo: '' }));
            } else {
                setSelfiePhoto({ file, preview });
                setErrors(prev => ({ ...prev, selfie_photo: '' }));
            }
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!firstName.trim()) newErrors.first_name = t('validation.nameRequired', 'Введите имя');
        if (!lastName.trim()) newErrors.last_name = t('validation.lastNameRequired', 'Введите фамилию');

        if (!birth) {
            newErrors.birth = t('validation.birthDateRequired', 'Укажите дату рождения');
        } else {
            const selectedDate = new Date(birth);
            const cutoffDate = new Date();
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 18);
            cutoffDate.setHours(0, 0, 0, 0);

            if (selectedDate > cutoffDate) {
                newErrors.birth = t('validation.ageRequirement', 'Регистрация доступна только с 18 лет.');
            }
        }

        if (!docPhoto) newErrors.document_photo = t('validation.idPhotoRequired', 'Загрузите фото документа');
        if (!selfiePhoto) newErrors.selfie_photo = t('validation.selfieRequired', 'Загрузите селфи с документом');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('birth', birth);
        formData.append('gender', gender);

        if (docPhoto && docPhoto.file) {
            formData.append('document_photo', docPhoto.file);
        }

        if (selfiePhoto && selfiePhoto.file) {
            formData.append('selfie_photo', selfiePhoto.file);
        }

        try {
            await submitKycProfile(formData);
            onNext();
        } catch (e: any) {
            console.error('KYC Submit Error:', e);
            if (e.response?.data?.errors) {
                const serverErrors = e.response.data.errors;
                const mappedErrors: Record<string, string> = {};
                Object.keys(serverErrors).forEach(key => {
                    mappedErrors[key] = serverErrors[key][0];
                });
                setErrors(mappedErrors);
            } else {
                alert(e.response?.data?.message || t('common.errorSubmitting', 'Ошибка отправки данных'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.stepCard}>
            <div className={style.header}>
                <h1>{t('kyc.formTitle', 'Давайте познакомимся')}</h1>
                <p>
                    {t('kyc.subtitle', 'Для сервисов, где люди доверяют друг другу дома и питомцев, подтверждение личности — это стандарт безопасности.')}
                </p>
            </div>

            {/* --- BLOCK TRUST (Как на мобильном) --- */}
            <div className={style.trustCard}>
                <div className={style.trustHeader}>
                    <LockIcon />
                    <span className={style.trustTitle}>
                        {t('kyc.dataSafety.title', 'Как это работает у нас:')}
                    </span>
                </div>

                <div className={style.trustList}>
                    <div className={style.trustItem}>
                        <div className={style.trustIcon}><FileDocIcon /></div>
                        <div className={style.trustText}>
                            {t('kyc.dataSafety.point1', 'Документы используются только для подтверждения личности')}
                        </div>
                    </div>
                    <div className={style.trustItem}>
                        <div className={style.trustIcon}><FileCheckIcon /></div>
                        <div className={style.trustText}>
                            {t('kyc.dataSafety.point2', 'Доступ есть только у команды модерации')}
                        </div>
                    </div>
                    <div className={style.trustItem}>
                        <div className={style.trustIcon}><ShieldCheckIcon /></div>
                        <div className={style.trustText}>
                            {t('kyc.dataSafety.point3', 'Все данные хранятся в зашифрованном виде')}
                        </div>
                    </div>
                </div>

                <div className={style.trustFooter}>
                    {t('kyc.dataSafety.ageNotice', 'Регистрация только для лиц старше 18 лет')}
                </div>
            </div>

            {isResubmission && adminMessage && (
                <div className={style.errorMessage}>
                    <strong>{t('ReviewStatus.AdminMessagePrefix', 'Комментарий администратора')}:</strong> {adminMessage}
                </div>
            )}

            <div className={style.card}>
                <h3 className={style.sectionTitle}>{t('kyc.personalInfoTitle', 'Личные данные')}</h3>

                <div className={style.formGroup}>
                    <label>{t('kyc.firstNameLabel', 'Имя')}</label>
                    <input
                        className={`${style.input} ${errors.first_name ? style.inputError : ''}`}
                        value={firstName}
                        onChange={e => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, first_name: '' })) }}
                        placeholder={t('kyc.firstNamePlaceholder', 'Как в паспорте')}
                    />
                    {errors.first_name && <span className={style.errorText}>{errors.first_name}</span>}
                </div>

                <div className={style.formGroup}>
                    <label>{t('kyc.lastNameLabel', 'Фамилия')}</label>
                    <input
                        className={`${style.input} ${errors.last_name ? style.inputError : ''}`}
                        value={lastName}
                        onChange={e => { setLastName(e.target.value); setErrors(prev => ({ ...prev, last_name: '' })) }}
                        placeholder={t('kyc.lastNamePlaceholder', 'Как в паспорте')}
                    />
                    {errors.last_name && <span className={style.errorText}>{errors.last_name}</span>}
                </div>

                <div className={style.formGroup}>
                    <label>{t('kyc.birthDateLabel', 'Дата рождения')}</label>
                    <input
                        type="date"
                        className={`${style.input} ${errors.birth ? style.inputError : ''}`}
                        value={birth}
                        onChange={e => { setBirth(e.target.value); setErrors(prev => ({ ...prev, birth: '' })) }}
                        max={maxDate18Plus}
                    />
                    {errors.birth && <span className={style.errorText}>{errors.birth}</span>}
                </div>

                <div className={style.formGroup}>
                    <label>{t('kyc.genderLabel', 'Пол')}</label>
                    <select className={style.select} value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="0">{t('common.male_people', 'Мужской')}</option>
                        <option value="1">{t('common.female_people', 'Женский')}</option>
                    </select>
                </div>
            </div>

            <div className={style.divider}></div>

            <div className={style.card}>
                <h3 className={style.sectionTitle}>{t('kyc.documentsTitle', 'Подтверждение личности')}</h3>

                {/* PASSPORT UPLOAD */}
                <div className={`${style.uploadCard} ${errors.document_photo ? style.error : ''}`}>
                    <div className={style.uploadHeader}>
                        <div className={style.uploadIconMain}><PassportIcon /></div>
                        <div className={style.uploadInfo}>
                            <h4>{t('kyc.idPhotoLabel', 'Фото паспорта')}</h4>
                            <p>{t('kyc.idPhotoInfo', 'Разворот с фото, без бликов, все данные читаемы.')}</p>
                        </div>
                    </div>

                    {!docPhoto ? (
                        <label className={style.uploadButton}>
                            <CameraIcon />
                            <span>{t('kyc.uploadPhoto', 'Загрузить фото')}</span>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'doc')} />
                        </label>
                    ) : (
                        <div>
                            <div className={style.previewContainer}>
                                <img src={docPhoto.preview} alt="Passport" />
                                <div className={style.previewOverlay}>
                                    <EyeIcon />
                                </div>
                            </div>
                            <label className={style.changeButton}>
                                {t('common.change', 'Изменить')}
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'doc')} hidden />
                            </label>
                        </div>
                    )}
                    {errors.document_photo && <span className={style.errorText}>{errors.document_photo}</span>}
                </div>

                {/* SELFIE UPLOAD */}
                <div className={`${style.uploadCard} ${errors.selfie_photo ? style.error : ''}`}>
                    <div className={style.uploadHeader}>
                        <div className={style.uploadIconMain}><SelfieIcon /></div>
                        <div className={style.uploadInfo}>
                            <h4>{t('kyc.selfieWithIdLabel', 'Селфи с паспортом')}</h4>
                            <p>{t('kyc.selfieWithIdInfo', 'Держите паспорт у лица, не закрывая его.')}</p>
                        </div>
                    </div>

                    {!selfiePhoto ? (
                        <label className={style.uploadButton}>
                            <CameraIcon />
                            <span>{t('kyc.uploadPhoto', 'Загрузить фото')}</span>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'selfie')} />
                        </label>
                    ) : (
                        <div>
                            <div className={style.previewContainer}>
                                <img src={selfiePhoto.preview} alt="Selfie" />
                                <div className={style.previewOverlay}>
                                    <EyeIcon />
                                </div>
                            </div>
                            <label className={style.changeButton}>
                                {t('common.change', 'Изменить')}
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'selfie')} hidden />
                            </label>
                        </div>
                    )}
                    {errors.selfie_photo && <span className={style.errorText}>{errors.selfie_photo}</span>}
                </div>
            </div>

            <button className={style.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? t('loading', 'Отправка...') : t('common.submitAndContinue', 'Отправить на проверку')}
            </button>
        </div>
    );
};

export default StepKYC;