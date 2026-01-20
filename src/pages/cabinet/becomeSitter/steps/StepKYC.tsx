import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitKycProfile } from '../../../../services/api';
import style from '../../../../style/pages/cabinet/becomeSitter/StepKYC.module.scss';

// Иконки
const PassportIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h2" /><path d="M15 12h2" /><path d="M7 16h10" /></svg>;
const SelfieIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><path d="M12 13m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /></svg>;
const CameraIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const EyeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const LockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

const StepKYC = ({ onNext, isResubmission, adminMessage }: { onNext: () => void, isResubmission: boolean, adminMessage?: string }) => {
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birth, setBirth] = useState('');
    const [gender, setGender] = useState('0');

    const [docPhoto, setDocPhoto] = useState<{ file: File, preview: string } | null>(null);
    const [selfiePhoto, setSelfiePhoto] = useState<{ file: File, preview: string } | null>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Вычисляем дату, которая была 18 лет назад
    const maxDate18Plus = React.useMemo(() => {
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
            // Дополнительная проверка на случай ручного ввода (хотя max атрибут блокирует календарь)
            const selectedDate = new Date(birth);
            const cutoffDate = new Date();
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 18);
            // Сбрасываем время для корректного сравнения
            cutoffDate.setHours(0, 0, 0, 0);

            if (selectedDate > cutoffDate) {
                newErrors.birth = t('validation.ageRequirement', 'Регистрация только с 18 лет');
            }
        }

        if (!docPhoto) newErrors.document_photo = t('validation.idPhotoRequired', 'Загрузите фото документа');
        if (!selfiePhoto) newErrors.selfie_photo = t('validation.selfieRequired', 'Загрузите селфи');

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
                alert(e.response?.data?.message || 'Ошибка отправки данных');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.stepCard}>
            <div className={style.header}>
                <h1>{t('kyc.formTitle', 'Подтверждение личности')}</h1>
                {/* Обновленный текст подзаголовка */}
                <p>{t('kyc.subtitle', 'Чтобы клиенты доверяли вам, нам нужно подтвердить вашу личность. Это безопасно и конфиденциально.')}</p>
            </div>

            {/* --- БЛОК БЕЗОПАСНОСТИ --- */}
            <div className={style.safetyBadge}>
                <div className={style.icon}>
                    <LockIcon />
                </div>
                <div className={style.content}>
                    {/* Обновленный текст о защите данных */}
                    <span className={style.mainText}>
                        {t('kyc.dataSafety.commitment', 'Мы обязуемся защищать вашу личную информацию. Эти данные необходимы для целей верификации и обеспечения безопасности нашего сообщества.')}
                    </span>
                    <span className={style.subText}>
                        {t('kyc.dataSafety.ageNotice', 'Регистрация только для лиц старше 18 лет.')}
                    </span>
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
                        // ОГРАНИЧЕНИЕ: Нельзя выбрать дату моложе 18 лет
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
                <h3 className={style.sectionTitle}>{t('kyc.documentsTitle', 'Документы')}</h3>

                {/* PASSPORT UPLOAD */}
                <div className={`${style.uploadCard} ${errors.document_photo ? style.error : ''}`}>
                    <div className={style.uploadHeader}>
                        <div className={style.uploadIcon}><PassportIcon /></div>
                        <div className={style.uploadInfo}>
                            <h4>{t('kyc.idPhotoLabel', 'Фото паспорта')}</h4>
                            {/* Обновленный текст описания паспорта */}
                            <p>{t('kyc.idPhotoInfo', 'Убедитесь, что все детали хорошо видны. Принимаются: паспорт, национальное удостоверение личности или водительские права.')}</p>
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
                        <div className={style.uploadIcon}><SelfieIcon /></div>
                        <div className={style.uploadInfo}>
                            <h4>{t('kyc.selfieWithIdLabel', 'Селфи с паспортом')}</h4>
                            {/* Обновленный текст описания селфи */}
                            <p>{t('kyc.selfieWithIdInfo', 'Держите документ рядом с лицом. Ваше лицо и документ должны быть четко видны.')}</p>
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