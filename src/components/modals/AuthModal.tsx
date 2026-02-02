// --- File: src/components/modals/AuthModal.tsx ---
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Импортируем thunks из authSlice
import {
    checkContactExists,
    sendOtp,
    verifyOtp,
    register as registerAction,
    login as loginAction,
    clearAuthErrors,
    resetAuthFlow,
    AuthState
} from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store";
import style from "../../style/components/modal/AuthModal.module.scss";
import { config as appConfig } from '../../config/appConfig';
import { resetUserPassword, type RegistrationPayload, type LoginPayload, type ResetPasswordPayload } from '../../services/api';

// Типы форм
type ContactFormValues = { contact: string };
type OtpFormValues = { code: string };
type RegisterFormValues = { fullName: string; password?: string; password_confirmation?: string; termsAccepted?: boolean };
type LoginFormValues = { password?: string; password_confirmation?: string };

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
    registrationType?: 'client' | 'sitter';
}

type AuthStep = "contactEntry" | "otpEntry" | "passwordEntry" | "finalRegister";
type ContactInputType = 'email' | 'phone';

// Иконка письма (SVG)
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'register', registrationType = 'client' }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Получаем состояние из Redux
    const { isLoading, status: authStatus, error: globalAuthError, contactCheckError, otpError, isAuthenticated } = useSelector((state: RootState) => state.auth as AuthState);

    // Локальные стейты
    const [currentStep, setCurrentStep] = useState<AuthStep>("contactEntry");
    const [contactType, setContactType] = useState<ContactInputType>('email');
    const [savedContactValue, setSavedContactValue] = useState("");
    const [savedOtpCode, setSavedOtpCode] = useState("");
    const [operationType, setOperationType] = useState<'register' | 'login' | 'reset'>(initialMode);

    // Локальный стейт для сброса пароля, чтобы не зависеть от Redux thunk, которого может не быть
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    // Стейт для таймера обратного отсчета
    const [timer, setTimer] = useState(0);

    // React Hook Form
    const { control: contactControl, handleSubmit: handleSubmitContact, formState: { errors: contactErrors }, reset: resetContactForm, trigger: triggerContact, setValue: setContactValue } = useForm<ContactFormValues>({ mode: "onTouched", defaultValues: { contact: '' } });
    const { control: otpControl, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors }, reset: resetOtpForm, trigger: triggerOtp } = useForm<OtpFormValues>({ mode: "onTouched", defaultValues: { code: '' } });
    const { control: detailsControl, handleSubmit: handleSubmitDetails, formState: { errors: detailsErrors }, watch: watchDetails, reset: resetDetailsForm, setError: setDetailsError } = useForm<RegisterFormValues>({ mode: "onTouched", defaultValues: { fullName: '', password: '', password_confirmation: '', termsAccepted: false } });
    const { control: loginControl, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors }, reset: resetLoginForm, setError: setLoginError, watch: watchLogin } = useForm<LoginFormValues>({ mode: "onTouched", defaultValues: { password: '', password_confirmation: '' } });

    // Сброс состояний при открытии/закрытии
    const resetAllStates = useCallback(() => {
        setCurrentStep("contactEntry");
        setContactType('email');
        setSavedContactValue("");
        setSavedOtpCode("");
        setTimer(0); // Сбрасываем таймер
        setOperationType(initialMode);
        setIsResettingPassword(false);
        dispatch(resetAuthFlow()); // Сброс статусов в Redux
        resetContactForm({ contact: '' });
        resetOtpForm({ code: '' });
        resetDetailsForm({ fullName: '', password: '', password_confirmation: '', termsAccepted: false });
        resetLoginForm({ password: '', password_confirmation: '' });
    }, [initialMode, dispatch, resetContactForm, resetOtpForm, resetDetailsForm, resetLoginForm]);

    useEffect(() => {
        if (isOpen) {
            resetAllStates();
        }
    }, [isOpen, resetAllStates]);

    // Успешная авторизация
    useEffect(() => {
        if (authStatus === 'succeeded' && isAuthenticated) {
            onClose();
            navigate('/cabinet');
        }
    }, [authStatus, isAuthenticated, onClose, navigate]);

    // Логика работы таймера
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Логика переходов между шагами на основе статуса Redux
    useEffect(() => {
        if (authStatus === 'contact_exists' && currentStep === 'contactEntry') {
            setOperationType('login');
            setCurrentStep("passwordEntry");
            dispatch(clearAuthErrors());
        } else if (authStatus === 'contact_new' && currentStep === 'contactEntry') {
            setOperationType('register');
            // Если контакт новый, сразу шлем OTP для регистрации
            if (savedContactValue && contactType) {
                dispatch(sendOtp({ contactValue: savedContactValue, contactType: contactType, operation: 'register' }));
            }
        }
    }, [authStatus, currentStep, savedContactValue, contactType, dispatch]);

    useEffect(() => {
        if (authStatus === 'otp_sent' && (currentStep === 'contactEntry' || (currentStep === 'passwordEntry' && operationType === 'reset'))) {
            setCurrentStep("otpEntry");
            dispatch(clearAuthErrors());
            setTimer(60); // Запускаем таймер при переходе на шаг OTP
        }
    }, [authStatus, currentStep, operationType, dispatch]);

    useEffect(() => {
        if (authStatus === 'otp_verified_register' && currentStep === 'otpEntry' && operationType === 'register') {
            setCurrentStep("finalRegister");
            dispatch(clearAuthErrors());
        } else if (authStatus === 'otp_verified_reset' && currentStep === 'otpEntry' && operationType === 'reset') {
            setCurrentStep("passwordEntry");
            dispatch(clearAuthErrors());
        }
    }, [authStatus, currentStep, operationType, dispatch]);

    // Обработчик ввода контакта (определение email/phone)
    const handleContactInputChange = useCallback((value: string) => {
        setContactValue('contact', value);
        triggerContact('contact');
        dispatch(clearAuthErrors());

        if (!appConfig.enablePhoneAuth) return; // Если телефон выключен, всегда email

        const trimmedValue = value.trim();
        // Простая эвристика: если есть @ или буквы -> email, иначе phone
        if (trimmedValue.includes('@') || (/[a-zA-Z]/.test(trimmedValue) && !/^\+?[0-9]/.test(trimmedValue))) {
            if (contactType !== 'email') setContactType('email');
        } else {
            if (contactType !== 'phone') setContactType('phone');
        }
    }, [contactType, setContactValue, triggerContact, dispatch]);

    // --- SUBMIT HANDLERS ---

    const onContactSubmit: SubmitHandler<ContactFormValues> = async (data) => {
        const currentContact = data.contact.trim();
        setSavedContactValue(currentContact);
        dispatch(clearAuthErrors());
        dispatch(checkContactExists({ contactValue: currentContact, contactType }));
    };

    const onOtpSubmit: SubmitHandler<OtpFormValues> = async (data) => {
        if (!savedContactValue || !contactType) return;
        setSavedOtpCode(data.code);
        dispatch(clearAuthErrors());
        if (operationType === 'login') return;

        dispatch(verifyOtp({
            contactValue: savedContactValue,
            contactType: contactType,
            code: data.code,
            operation: operationType
        }));
    };

    const onDetailsSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
        if (!savedContactValue || !contactType || !data.termsAccepted || !savedOtpCode) {
            if (!data.termsAccepted) {
                (setDetailsError as any)("termsAccepted", { type: "manual", message: t('validation.termsRequired') });
            }
            if (!savedOtpCode) { console.error("OTP code not saved. Cannot register."); return; }
            return;
        }
        dispatch(clearAuthErrors());

        const registrationData: RegistrationPayload = {
            fullName: data.fullName,
            password: data.password,
            password_confirmation: data.password_confirmation,
            code: savedOtpCode,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        if (contactType === 'email') registrationData.email = savedContactValue;
        if (contactType === 'phone') registrationData.phone = savedContactValue;

        dispatch(registerAction({ registrationData, registrationType: registrationType }));
    };

    const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
        if (!savedContactValue || !contactType || !data.password) {
            if (!data.password && loginControl) {
                (setLoginError as any)("password", { type: "manual", message: t('validation.passwordRequired') });
            }
            return;
        }
        dispatch(clearAuthErrors());

        // --- ЛОГИКА СБРОСА ПАРОЛЯ ---
        if (operationType === 'reset') {
            if (data.password !== data.password_confirmation) {
                (setLoginError as any)("password_confirmation", { type: "manual", message: t('validation.passwordsDoNotMatch') });
                return;
            }

            if (!savedOtpCode) {
                // Если код каким-то образом потерялся, возвращаем на шаг ввода кода
                console.error("OTP code missing for reset.");
                setCurrentStep("otpEntry");
                return;
            }

            setIsResettingPassword(true);
            try {
                const resetPayload: ResetPasswordPayload = {
                    code: savedOtpCode,
                    password: data.password,
                    password_confirmation: data.password_confirmation || data.password
                };

                if (contactType === 'email') resetPayload.email = savedContactValue;
                if (contactType === 'phone') resetPayload.phone = savedContactValue;

                // Прямой вызов API для сброса пароля
                const result = await resetUserPassword(resetPayload);

                if (result && result.success !== false) {
                    // Успешный сброс
                    alert(t('resetPassword.success', 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.'));

                    // Переключаем режим на логин
                    setOperationType('login');
                    // Сбрасываем форму, но можно оставить контакт
                    resetLoginForm({ password: '', password_confirmation: '' });
                    // Возвращаемся на шаг ввода контакта или сразу показываем поле пароля для логина
                    // Лучше показать сразу ввод пароля, так как контакт уже введен
                    setCurrentStep("contactEntry");
                    // Или можно сразу вызвать checkContactExists чтобы перейти на шаг пароля, но это сложнее синхронизировать
                    // Простой вариант: вернуть на начало
                    setSavedOtpCode("");
                } else {
                    // Ошибка от сервера в формате { success: false, message: ... }
                    (setLoginError as any)("root.serverError", { type: "manual", message: result.message || t('resetPassword.genericError') });
                }
            } catch (error: any) {
                console.error("Reset password error:", error);
                // Обработка ошибок валидации от API (422)
                if (error.response && error.response.data && error.response.data.errors) {
                    const apiErrors = error.response.data.errors;
                    // Проходимся по ошибкам и устанавливаем их в форму
                    Object.keys(apiErrors).forEach((key) => {
                        if (key === 'password') {
                            (setLoginError as any)("password", { type: "manual", message: apiErrors[key][0] });
                        } else if (key === 'password_confirmation') {
                            (setLoginError as any)("password_confirmation", { type: "manual", message: apiErrors[key][0] });
                        } else {
                            (setLoginError as any)("root.serverError", { type: "manual", message: `${key}: ${apiErrors[key][0]}` });
                        }
                    });
                } else {
                    const message = error?.response?.data?.message || error?.message || t('resetPassword.genericError');
                    (setLoginError as any)("root.serverError", { type: "manual", message: message });
                }
            } finally {
                setIsResettingPassword(false);
            }
            return;
        }

        // --- ЛОГИКА ВХОДА ---
        const loginPayload: LoginPayload = { password: data.password };
        if (contactType === 'email') loginPayload.email = savedContactValue;
        if (contactType === 'phone') loginPayload.phone = savedContactValue;

        dispatch(loginAction(loginPayload));
    };

    // Ошибки
    const currentError = useMemo(() => {
        if (authStatus === 'failed') {
            if (currentStep === 'contactEntry' && contactCheckError) return contactCheckError;
            if (currentStep === 'otpEntry' && otpError) return otpError;
            return globalAuthError;
        }
        if (currentStep === 'finalRegister' && detailsErrors.root?.serverError) return (detailsErrors.root.serverError as any).message;
        if (currentStep === 'finalRegister' && detailsErrors.termsAccepted) return detailsErrors.termsAccepted.message;
        if (currentStep === 'passwordEntry' && loginErrors.root?.serverError) return (loginErrors.root.serverError as any).message;
        return null;
    }, [authStatus, currentStep, contactCheckError, otpError, globalAuthError, detailsErrors, loginErrors]);

    // --- RENDER STEPS ---

    // 1. Ввод контакта
    const renderContactEntry = () => (
        <form onSubmit={handleSubmitContact(onContactSubmit)}>
            <h3 className={style.modalTitle}>{t('authModal.contactEntry.titleAirbnb')}</h3>

            <div className={style.inputGroup}>
                <label htmlFor="contact" className={style.inputLabel}>
                    {/* Если телефон выключен в конфиге, показываем только "Ваш Email" */}
                    {!appConfig.enablePhoneAuth
                        ? t('authModal.labelEmailOnly', 'Ваш Email')
                        : (contactType === 'email' ? t('authModal.labelEmail') : t('authModal.labelPhone'))
                    }
                </label>

                <div className={`${style.contactInputContainer} ${contactErrors.contact ? style.inputError : ""}`}>
                    <div className={style.contactInputPrefix}>
                        {contactType === 'email' ? <MailIcon /> : null}
                    </div>
                    <Controller
                        name="contact"
                        control={contactControl}
                        defaultValue=""
                        rules={{
                            required: t('validation.contactRequired'),
                            validate: value => {
                                const trimmedValue = (value || "").trim();
                                if (!trimmedValue) return t('validation.contactRequired');
                                if (contactType === 'phone') {
                                    return /^\+?[0-9\s-]{10,}$/.test(trimmedValue) || t('validation.contactInvalid');
                                } else {
                                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue) || t('validation.contactInvalid');
                                }
                            }
                        }}
                        render={({ field }) => (
                            <input
                                {...field}
                                id="contact"
                                type={contactType === 'email' ? 'email' : 'tel'}
                                // Если телефон выключен, просим только Email
                                placeholder={!appConfig.enablePhoneAuth ? t('authModal.emailPlaceholder', 'Введите ваш email') : t('authModal.contactPlaceholderAirbnb')}
                                className={style.contactInputFieldElement}
                                onChange={(e) => handleContactInputChange(e.target.value)}
                            />
                        )}
                    />
                </div>
                {contactErrors.contact && <p className={style.errorMessage}>{contactErrors.contact.message}</p>}
            </div>

            {currentError && <p className={style.apiError}>{currentError}</p>}

            <button
                type="submit"
                disabled={isLoading && authStatus === 'checking_contact'}
                className={`${style.submitButton} ${style.submitButtonPrimary}`}
            >
                {(isLoading && authStatus === 'checking_contact') ? t('loading', 'Проверка...') : t('common.continue')}
            </button>
        </form>
    );

    // 2. Ввод OTP
    const renderOtpEntry = () => (
        <form onSubmit={handleSubmitOtp(onOtpSubmit)}>
            <button type="button" onClick={() => { setCurrentStep('contactEntry'); dispatch(resetAuthFlow()); setOperationType(initialMode); }} className={style.backButton}>
                <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h3 className={style.modalTitle}>{t('authModal.otpTitleAirbnb', { context: contactType })}</h3>
            <p className={style.modalSubtitle}>
                {t('authModal.otpSubtitleAirbnb', `Введите 4-значный код, отправленный на `)}
                <strong>{savedContactValue}</strong>
            </p>

            {/* --- ВАЖНО: Хинт про папку Спам, если это Email --- */}
            {contactType === 'email' && (
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#718096', marginTop: '-15px', marginBottom: '20px', lineHeight: '1.4' }}>
                    {t('authModal.checkSpamHint', 'Если письмо не пришло во входящие, проверьте папку «Спам».')}
                </p>
            )}

            <div className={style.inputGroup}>
                <Controller
                    name="code"
                    control={otpControl}
                    defaultValue=""
                    rules={{
                        required: t('validation.otpRequired'),
                        minLength: { value: 4, message: t('validation.otpMinLengthFour') },
                        maxLength: { value: 4, message: t('validation.otpMaxLengthFour') },
                        pattern: { value: /^[0-9]{4}$/, message: t('validation.otpFourDigitsOnly') }
                    }}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            placeholder={t('authModal.otpPlaceholderFourDigits', '----')}
                            maxLength={4}
                            className={`${style.inputField} ${style.otpInput} ${otpErrors.code ? style.inputError : ""}`}
                            onChange={(e) => {
                                field.onChange(e);
                                triggerOtp("code");
                                dispatch(clearAuthErrors());
                            }}
                        />
                    )}
                />
                {otpErrors.code && <p className={style.errorMessage}>{otpErrors.code.message}</p>}
            </div>

            {currentError && <p className={style.apiError}>{currentError}</p>}

            <button type="submit" disabled={isLoading && authStatus === 'otp_verifying'} className={`${style.submitButton} ${style.submitButtonPrimary}`}>
                {(isLoading && authStatus === 'otp_verifying') ? t('loading', 'Проверка...') : t('common.confirm')}
            </button>

            <button
                type="button"
                className={style.linkButton}
                onClick={async () => {
                    if (savedContactValue && contactType && (operationType === 'register' || operationType === 'reset')) {
                        dispatch(sendOtp({ contactValue: savedContactValue, contactType, operation: operationType }));
                        setTimer(60); // Перезапускаем таймер при повторной отправке
                    }
                }}
                disabled={(isLoading && authStatus === 'otp_sending') || timer > 0}
                style={timer > 0 ? { opacity: 0.5, cursor: 'default' } : {}}
            >
                {(isLoading && authStatus === 'otp_sending')
                    ? t('otp.resending')
                    : timer > 0
                        ? `${t('otp.resend')} (${timer}s)`
                        : t('otp.resend')
                }
            </button>
        </form>
    );

    // 3. Финальная регистрация (Имя, Пароль)
    const renderFinalRegister = () => (
        <form onSubmit={handleSubmitDetails(onDetailsSubmit)}>
            <button type="button" onClick={() => setCurrentStep('otpEntry')} className={style.backButton}>
                <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h3 className={style.modalTitle}>{t('authModal.finalRegisterTitleAirbnb')}</h3>
            <p className={style.modalSubtitle}>{t('authModal.finalRegisterSubtitleAirbnb')}</p>

            <div className={style.inputGroup}>
                <label htmlFor="fullName" className={style.inputLabel}>{t('authModal.fullNameLabelAirbnb')}</label>
                <Controller
                    name="fullName"
                    control={detailsControl}
                    defaultValue=""
                    rules={{ required: t('validation.nameRequired') }}
                    render={({ field }) => (
                        <input id="fullName" type="text" {...field} placeholder={t('authModal.fullNamePlaceholder')}
                            className={`${style.inputField} ${detailsErrors.fullName ? style.inputError : ""}`}
                        />
                    )}
                />
                {detailsErrors.fullName && <p className={style.errorMessage}>{detailsErrors.fullName.message}</p>}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="regPassword" className={style.inputLabel}>{t('authModal.passwordLabelAirbnb')}</label>
                <Controller
                    name="password"
                    control={detailsControl}
                    defaultValue=""
                    rules={{
                        required: t('validation.passwordRequired'),
                        minLength: { value: 8, message: t('validation.passwordMinLengthAirbnb') },
                    }}
                    render={({ field }) => (
                        <input id="regPassword" type="password" {...field} placeholder="••••••••"
                            className={`${style.inputField} ${detailsErrors.password ? style.inputError : ""}`}
                        />
                    )}
                />
                {detailsErrors.password && <p className={style.errorMessage}>{detailsErrors.password.message}</p>}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="regPasswordConfirm" className={style.inputLabel}>{t('authModal.confirmPasswordLabelAirbnb')}</label>
                <Controller
                    name="password_confirmation"
                    control={detailsControl}
                    defaultValue=""
                    rules={{
                        required: t('validation.confirmPasswordRequired'),
                        validate: value => value === watchDetails('password') || t('validation.passwordsDoNotMatch'),
                    }}
                    render={({ field }) => (
                        <input id="regPasswordConfirm" type="password" {...field} placeholder="••••••••"
                            className={`${style.inputField} ${detailsErrors.password_confirmation ? style.inputError : ""}`}
                        />
                    )}
                />
                {detailsErrors.password_confirmation && <p className={style.errorMessage}>{detailsErrors.password_confirmation.message}</p>}
            </div>

            <div className={`${style.inputGroup} ${style.checkboxGroup}`}>
                <Controller
                    name="termsAccepted"
                    control={detailsControl}
                    defaultValue={false}
                    rules={{ required: t('validation.termsRequiredShort') }}
                    render={({ field }) => {
                        const { value, ...rest } = field;
                        return (
                            <input
                                id="termsAccepted"
                                type="checkbox"
                                {...rest}
                                checked={!!value}
                                className={`${style.checkboxInput} ${detailsErrors.termsAccepted ? style.inputError : ""}`}
                            />
                        );
                    }}
                />
                <label htmlFor="termsAccepted" className={style.checkboxLabel}>
                    {t('registration.agreeToTermsPrefixAirbnb')}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className={style.inlineLink}>{t('registration.termsAndConditionsAirbnb')}</a>
                    {t('registration.agreeToTermsSuffixAirbnb')}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={style.inlineLink}>{t('registration.privacyPolicyMain')}</a>.
                </label>
            </div>
            {detailsErrors.termsAccepted && <p className={`${style.checkboxError}`}>{detailsErrors.termsAccepted.message}</p>}

            {(detailsErrors.root?.serverError || (currentStep === 'finalRegister' && globalAuthError)) &&
                <p className={style.apiError}>{(detailsErrors.root?.serverError as any)?.message || globalAuthError}</p>
            }

            <button type="submit" disabled={isLoading && authStatus === 'registering'} className={`${style.submitButton} ${style.submitButtonPrimary}`}>
                {(isLoading && authStatus === 'registering') ? t('registration.submitting') : t('registration.submitButtonAirbnb')}
            </button>
        </form>
    );

    // 4. Ввод пароля (Вход или Смена пароля)
    const renderPasswordEntry = () => (
        <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
            <button type="button" onClick={() => { setCurrentStep('contactEntry'); dispatch(resetAuthFlow()); setOperationType(initialMode); }} className={style.backButton}>
                <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h3 className={style.modalTitle}>
                {operationType === 'login' ? t('authModal.loginTitlePassword') : t('authModal.resetPasswordTitle')}
            </h3>
            <p className={style.modalSubtitle}>
                {operationType === 'login' ? t('authModal.loginSubtitlePassword') : t('authModal.resetPasswordSubtitleNew')}
                <strong>{savedContactValue}</strong>
            </p>

            <div className={style.inputGroup}>
                <label htmlFor="loginPassword" className={style.inputLabel}>{operationType === 'login' ? t('authModal.passwordLabel') : t('authModal.newPasswordLabel')}</label>
                <Controller
                    name="password"
                    control={loginControl}
                    defaultValue=""
                    rules={{
                        required: t('validation.passwordRequired'),
                        minLength: { value: operationType === 'reset' ? 8 : 6, message: t(operationType === 'reset' ? 'validation.passwordMinLengthAirbnb' : 'validation.passwordMinLength') }
                    }}
                    render={({ field }) => (
                        <input id="loginPassword" type="password" {...field} placeholder="••••••••" className={`${style.inputField} ${loginErrors.password ? style.inputError : ""}`} />
                    )}
                />
                {loginErrors.password && <p className={style.errorMessage}>{loginErrors.password.message}</p>}
            </div>

            {operationType === 'reset' && (
                <div className={style.inputGroup}>
                    <label htmlFor="confirmNewPassword" className={style.inputLabel}>{t('authModal.confirmPasswordLabel')}</label>
                    <Controller
                        name="password_confirmation"
                        control={loginControl}
                        defaultValue=""
                        rules={{
                            required: t('validation.confirmPasswordRequired'),
                            validate: value => value === watchLogin('password') || t('validation.passwordsDoNotMatch'),
                        }}
                        render={({ field }) => (
                            <input id="confirmNewPassword" type="password" {...field} placeholder="••••••••" className={`${style.inputField} ${loginErrors.password_confirmation ? style.inputError : ""}`} />
                        )}
                    />
                    {loginErrors.password_confirmation && <p className={style.errorMessage}>{loginErrors.password_confirmation.message}</p>}
                </div>
            )}

            {(loginErrors.root?.serverError || (currentStep === 'passwordEntry' && globalAuthError)) &&
                <p className={style.apiError}>{(loginErrors.root?.serverError as any)?.message || globalAuthError}</p>
            }

            <button type="submit" disabled={(isLoading && authStatus === 'logging_in') || isResettingPassword} className={`${style.submitButton} ${style.submitButtonPrimary}`}>
                {(isLoading && authStatus === 'logging_in') ? t('login.loggingIn') : (isResettingPassword) ? t('resetPassword.resetting', 'Обновление...') : operationType === 'login' ? t('profile.logIn') : t('resetPassword.setNewPasswordButton')}
            </button>

            {operationType === 'login' && (
                <button type="button" className={style.linkButton} onClick={() => {
                    if (savedContactValue && contactType) {
                        setOperationType('reset');
                        dispatch(sendOtp({ contactValue: savedContactValue, contactType, operation: 'reset' }));
                    }
                }}>
                    {t('profile.forgotAirbnb')}
                </button>
            )}
        </form>
    );

    // Рендер контента в зависимости от шага
    let currentStepContent;
    switch (currentStep) {
        case "contactEntry": currentStepContent = renderContactEntry(); break;
        case "otpEntry": currentStepContent = renderOtpEntry(); break;
        case "finalRegister": currentStepContent = renderFinalRegister(); break;
        case "passwordEntry": currentStepContent = renderPasswordEntry(); break;
        default: currentStepContent = renderContactEntry();
    }

    return (
        <div className={`${style.authModal} ${isOpen ? style.open : ""}`} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title-id">
            <div className={style.authModalOverlay} onClick={onClose} tabIndex={-1}></div>
            <div className={style.authModalWrapper}>
                {/* Кнопка Закрыть / Назад */}
                {currentStep !== 'contactEntry' ? (
                    <button type="button" onClick={() => {
                        // Логика кнопки "Назад"
                        if (currentStep === 'otpEntry') {
                            setCurrentStep('contactEntry');
                            dispatch(resetAuthFlow());
                            setOperationType(initialMode);
                        } else if (currentStep === 'finalRegister') {
                            setCurrentStep('otpEntry');
                        } else if (currentStep === 'passwordEntry' && operationType === 'reset') {
                            setCurrentStep('otpEntry');
                        } else if (currentStep === 'passwordEntry' && operationType === 'login') {
                            setCurrentStep('contactEntry');
                        }
                        dispatch(clearAuthErrors());
                    }} className={style.backButton}>
                        <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                ) : (
                    <button onClick={onClose} className={style.closeButton} aria-label={t('common.close', 'Закрыть')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                )}

                <h3 id="auth-modal-title-id" className={style.visuallyHidden}>{t('authModal.defaultTitle')}</h3>

                {currentStepContent}
            </div>
        </div>
    );
};