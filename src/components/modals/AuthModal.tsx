// --- File: src/components/modals/AuthModal.tsx ---
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import {
    checkContactExists, sendOtp, verifyOtp, register as registerAction,
    login as loginAction, loginWithGoogle, loginWithApple,
    clearAuthErrors, resetAuthFlow, AuthState
} from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store";
import style from "../../style/components/modal/AuthModal.module.scss";
import { config as appConfig } from '../../config/appConfig';
import type { RegistrationPayload, LoginPayload } from '../../services/api';

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

const generateNonce = (length: number = 32): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) { result += characters.charAt(Math.floor(Math.random() * charactersLength)); }
    return result;
};

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'register', registrationType = 'client' }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isLoading, status: authStatus, error: globalAuthError, contactCheckError, otpError, isAuthenticated, } = useSelector((state: RootState) => state.auth as AuthState);

    const [currentStep, setCurrentStep] = useState<AuthStep>("contactEntry");
    const [contactType, setContactType] = useState<ContactInputType>('email');
    const [savedContactValue, setSavedContactValue] = useState("");
    const [savedOtpCode, setSavedOtpCode] = useState("");
    const [operationType, setOperationType] = useState<'register' | 'login' | 'reset'>(initialMode);
    const [appleNonce, setAppleNonce] = useState<string | null>(null);

    const { control: contactControl, handleSubmit: handleSubmitContact, formState: { errors: contactErrors }, reset: resetContactForm, trigger: triggerContact, setValue: setContactValue } = useForm<ContactFormValues>({ mode: "onTouched", defaultValues: { contact: '' } });
    const { control: otpControl, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors }, reset: resetOtpForm, trigger: triggerOtp } = useForm<OtpFormValues>({ mode: "onTouched", defaultValues: { code: '' } });
    const { control: detailsControl, handleSubmit: handleSubmitDetails, formState: { errors: detailsErrors }, watch: watchDetails, reset: resetDetailsForm, setError: setDetailsError } = useForm<RegisterFormValues>({ mode: "onTouched", defaultValues: { fullName: '', password: '', password_confirmation: '', termsAccepted: false } });
    const { control: loginControl, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors }, reset: resetLoginForm, setError: setLoginError, watch: watchLogin } = useForm<LoginFormValues>({ mode: "onTouched", defaultValues: { password: '', password_confirmation: '' } });

    const resetAllStates = useCallback(() => {
        setCurrentStep("contactEntry");
        setContactType('email');
        setSavedContactValue("");
        setSavedOtpCode("");
        setOperationType(initialMode);
        dispatch(resetAuthFlow());
        resetContactForm({ contact: '' });
        resetOtpForm({ code: '' });
        resetDetailsForm({ fullName: '', password: '', password_confirmation: '', termsAccepted: false });
        resetLoginForm({ password: '', password_confirmation: '' });
    }, [initialMode, dispatch, resetContactForm, resetOtpForm, resetDetailsForm, resetLoginForm]);

    useEffect(() => { if (isOpen) { resetAllStates(); setAppleNonce(generateNonce()); } }, [isOpen, resetAllStates]);
    useEffect(() => { if (authStatus === 'succeeded' && isAuthenticated) { onClose(); navigate('/cabinet'); } }, [authStatus, isAuthenticated, onClose, navigate]);
    useEffect(() => { if (authStatus === 'contact_exists' && currentStep === 'contactEntry') { setOperationType('login'); setCurrentStep("passwordEntry"); dispatch(clearAuthErrors()); } else if (authStatus === 'contact_new' && currentStep === 'contactEntry') { setOperationType('register'); if (savedContactValue && contactType) { dispatch(sendOtp({ contactValue: savedContactValue, contactType: contactType, operation: 'register' })); } } }, [authStatus, currentStep, savedContactValue, contactType, dispatch]);
    useEffect(() => { if (authStatus === 'otp_sent' && (currentStep === 'contactEntry' || (currentStep === 'passwordEntry' && operationType === 'reset'))) { setCurrentStep("otpEntry"); dispatch(clearAuthErrors()); } }, [authStatus, currentStep, operationType, dispatch]);
    useEffect(() => { if (authStatus === 'otp_verified_register' && currentStep === 'otpEntry' && operationType === 'register') { setCurrentStep("finalRegister"); dispatch(clearAuthErrors()); } else if (authStatus === 'otp_verified_reset' && currentStep === 'otpEntry' && operationType === 'reset') { setCurrentStep("passwordEntry"); dispatch(clearAuthErrors()); } }, [authStatus, currentStep, operationType, dispatch]);

    const handleContactInputChange = useCallback((value: string) => {
        setContactValue('contact', value);
        triggerContact('contact');
        dispatch(clearAuthErrors());
        if (!appConfig.enablePhoneAuth) return;
        const trimmedValue = value.trim();
        if (trimmedValue.includes('@') || (/[a-zA-Z]/.test(trimmedValue) && !/^\+?[0-9]/.test(trimmedValue))) {
            if (contactType !== 'email') setContactType('email');
        } else {
            if (contactType !== 'phone') setContactType('phone');
        }
    }, [contactType, setContactValue, triggerContact, dispatch]);

    const onContactSubmit: SubmitHandler<ContactFormValues> = async (data) => {
        const currentContact = data.contact.trim();
        setSavedContactValue(currentContact);
        dispatch(clearAuthErrors());
        dispatch(checkContactExists({ contactValue: currentContact, contactType }));
    };

    const onOtpSubmit: SubmitHandler<OtpFormValues> = async (data) => { if (!savedContactValue || !contactType) return; setSavedOtpCode(data.code); dispatch(clearAuthErrors()); if (operationType === 'login') return; dispatch(verifyOtp({ contactValue: savedContactValue, contactType: contactType, code: data.code, operation: operationType })); };
    const onDetailsSubmit: SubmitHandler<RegisterFormValues> = async (data) => { if (!savedContactValue || !contactType || !data.termsAccepted || !savedOtpCode) { if (!data.termsAccepted) { (setDetailsError as any)("termsAccepted", { type: "manual", message: t('validation.termsRequired') }); } if (!savedOtpCode) { console.error("OTP code not saved. Cannot register."); return; } return; } dispatch(clearAuthErrors()); const registrationData: RegistrationPayload = { fullName: data.fullName, password: data.password, password_confirmation: data.password_confirmation, code: savedOtpCode, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, }; if (contactType === 'email') registrationData.email = savedContactValue; if (contactType === 'phone') registrationData.phone = savedContactValue; dispatch(registerAction({ registrationData, registrationType: registrationType })); };
    const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => { if (!savedContactValue || !contactType || !data.password) { if (!data.password && loginControl) { (setLoginError as any)("password", { type: "manual", message: t('validation.passwordRequired') }); } return; } dispatch(clearAuthErrors()); const loginPayload: LoginPayload = { password: data.password }; if (contactType === 'email') loginPayload.email = savedContactValue; if (contactType === 'phone') loginPayload.phone = savedContactValue; if (operationType === 'reset') { if (data.password !== data.password_confirmation) { (setLoginError as any)("password_confirmation", { type: "manual", message: t('validation.passwordsDoNotMatch') }); return; } alert(t('resetPassword.notImplemented', "Функционал сброса пароля в разработке.")); return; } dispatch(loginAction(loginPayload)); };
    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => { if (credentialResponse.credential) { dispatch(loginWithGoogle({ idToken: credentialResponse.credential })); } else { (setLoginError as any)('root.serverError', { type: 'google', message: t('authModal.googleErrorNoCredential') }); } };
    const handleGoogleError = () => { (setLoginError as any)('root.serverError', { type: 'google', message: t('authModal.googleErrorGeneral') }); };
    const handleAppleSuccess = (response: any) => { if (response?.authorization?.id_token) { const appleAuthData = { identityToken: response.authorization.id_token, user: response.user?.id, email: response.user?.email, fullName: response.user?.name ? { givenName: response.user.name.firstName, familyName: response.user.name.lastName } : undefined }; dispatch(loginWithApple({ appleAuthData })); } else { (setLoginError as any)('root.serverError', { type: 'apple', message: t('authModal.appleErrorNoToken') }); } };
    const handleAppleError = (error: any) => { let message = t('authModal.appleErrorGeneral'); if (error?.error === 'popup_closed_by_user' || error?.error === 'cancelled') { message = t('authModal.appleCancelled'); } (setLoginError as any)('root.serverError', { type: 'apple', message }); };
    const currentError = useMemo(() => { if (authStatus === 'failed') { if (currentStep === 'contactEntry' && contactCheckError) return contactCheckError; if (currentStep === 'otpEntry' && otpError) return otpError; return globalAuthError; } if (currentStep === 'finalRegister' && detailsErrors.root?.serverError) return (detailsErrors.root.serverError as any).message; if (currentStep === 'finalRegister' && detailsErrors.termsAccepted) return detailsErrors.termsAccepted.message; if (currentStep === 'passwordEntry' && loginErrors.root?.serverError) return (loginErrors.root.serverError as any).message; return null; }, [authStatus, currentStep, contactCheckError, otpError, globalAuthError, detailsErrors, loginErrors]);

    const renderContactEntry = () => (
        <form onSubmit={handleSubmitContact(onContactSubmit)}>
            <h3 className={style.modalTitle}>{t('authModal.contactEntry.titleAirbnb')}</h3>
            <div className={style.inputGroup}>
                <label htmlFor="contact" className={style.inputLabel}>
                    {contactType === 'email' ? t('authModal.labelEmail') : t('authModal.labelPhone')}
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
                                    return isValidPhoneNumber(trimmedValue) || t('validation.contactInvalid');
                                } else {
                                    const isEmailTest = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(trimmedValue);
                                    return isEmailTest || t('validation.contactInvalid');
                                }
                            }
                        }}
                        render={({ field }) => (
                            contactType === 'phone' && appConfig.enablePhoneAuth ? (
                                <PhoneInput
                                    {...field}
                                    international
                                    withCountryCallingCode
                                    defaultCountry="RU"
                                    placeholder={t('authModal.contactPlaceholderAirbnb')}
                                    className={style.phoneInputFieldElement}
                                    onChange={(value) => handleContactInputChange(value || '')}
                                />
                            ) : (
                                <input
                                    {...field}
                                    id="contact"
                                    type="email"
                                    placeholder={t('authModal.contactPlaceholderAirbnb')}
                                    className={style.contactInputFieldElement}
                                    onChange={(e) => handleContactInputChange(e.target.value)}
                                />
                            )
                        )}
                    />
                </div>
                {contactErrors.contact && <p className={style.errorMessage}>{contactErrors.contact.message}</p>}
            </div>
            {currentError && <p className={style.apiError}>{currentError}</p>}
            <button type="submit" disabled={isLoading && authStatus === 'checking_contact'} className={`${style.submitButton} ${style.submitButtonPrimary}`}>
                {(isLoading && authStatus === 'checking_contact') ? t('loading', 'Проверка...') : t('common.continue')}
            </button>
            <div className={style.socialLoginSection}>
                <div className={style.orDivider}><span>{t('authModal.orDivider')}</span></div>
                <div className={style.socialButtonsContainer}>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} type="standard" theme="outline" size="large" shape="rectangular" width={"100%"} containerProps={{ style: { width: '100%' } }} logo_alignment="left" useOneTap={false} />
                    <AppleSignin authOptions={{ clientId: appConfig.appleServiceId, scope: 'email name', redirectURI: appConfig.appleRedirectUri, state: 'reactAppWeb', nonce: appleNonce || undefined, usePopup: true, }} uiType="light" className={style.socialButton} buttonExtraChildren={<> <span>{t('authModal.continueWithApple')}</span> </>} onSuccess={handleAppleSuccess} onError={handleAppleError} skipScript={false} render={(props: any) => (<button {...props} className={style.socialButton} disabled={isLoading || !appleNonce || props.disabled}> {props.children} </button>)} />
                </div>
            </div>
        </form>
    );

    const renderOtpEntry = () => (<form onSubmit={handleSubmitOtp(onOtpSubmit)}> <button type="button" onClick={() => { setCurrentStep('contactEntry'); dispatch(resetAuthFlow()); setOperationType(initialMode); }} className={style.backButton}> <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> </button> <h3 className={style.modalTitle}>{t('authModal.otpTitleAirbnb', { context: contactType })}</h3> <p className={style.modalSubtitle}> {t('authModal.otpSubtitleAirbnb', `Введите 4-значный код, отправленный на `)} <strong>{savedContactValue}</strong> </p> <div className={style.inputGroup}> <Controller name="code" control={otpControl} defaultValue="" rules={{ required: t('validation.otpRequired'), minLength: { value: 4, message: t('validation.otpMinLengthFour') }, maxLength: { value: 4, message: t('validation.otpMaxLengthFour') }, pattern: { value: /^[0-9]{4}$/, message: t('validation.otpFourDigitsOnly') } }} render={({ field }) => (<input {...field} type="text" inputMode="numeric" placeholder={t('authModal.otpPlaceholderFourDigits', '----')} maxLength={4} className={`${style.inputField} ${style.otpInput} ${otpErrors.code ? style.inputError : ""}`} onChange={(e) => { field.onChange(e); triggerOtp("code"); dispatch(clearAuthErrors()); }} />)} /> {otpErrors.code && <p className={style.errorMessage}>{otpErrors.code.message}</p>} </div> {currentError && <p className={style.apiError}>{currentError}</p>} <button type="submit" disabled={isLoading && authStatus === 'otp_verifying'} className={`${style.submitButton} ${style.submitButtonPrimary}`}> {(isLoading && authStatus === 'otp_verifying') ? t('loading', 'Проверка...') : t('common.confirm')} </button> <button type="button" className={style.linkButton} onClick={async () => { if (savedContactValue && contactType && (operationType === 'register' || operationType === 'reset')) { dispatch(sendOtp({ contactValue: savedContactValue, contactType, operation: operationType })); } }} disabled={isLoading && authStatus === 'otp_sending'}> {(isLoading && authStatus === 'otp_sending') ? t('otp.resending') : t('otp.resend')} </button> </form>);

    const renderFinalRegister = () => (
        <form onSubmit={handleSubmitDetails(onDetailsSubmit)}>
            <button type="button" onClick={() => setCurrentStep('otpEntry')} className={style.backButton}> <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> </button>
            <h3 className={style.modalTitle}>{t('authModal.finalRegisterTitleAirbnb')}</h3>
            <p className={style.modalSubtitle}>{t('authModal.finalRegisterSubtitleAirbnb')}</p>
            <div className={style.inputGroup}>
                <label htmlFor="fullName" className={style.inputLabel}>{t('authModal.fullNameLabelAirbnb')}</label>
                <Controller name="fullName" control={detailsControl} defaultValue="" rules={{ required: t('validation.nameRequired') }}
                    render={({ field }) => (
                        <input id="fullName" type="text" {...field} placeholder={t('authModal.fullNamePlaceholder')}
                            className={`${style.inputField} ${detailsErrors.fullName ? style.inputError : ""}`}
                        />
                    )} />
                {detailsErrors.fullName && <p className={style.errorMessage}>{detailsErrors.fullName.message}</p>}
            </div>
            <div className={style.inputGroup}>
                <label htmlFor="regPassword" className={style.inputLabel}>{t('authModal.passwordLabelAirbnb')}</label>
                <Controller name="password" control={detailsControl} defaultValue="" rules={{ required: t('validation.passwordRequired'), minLength: { value: 8, message: t('validation.passwordMinLengthAirbnb') }, }}
                    render={({ field }) => (
                        <input id="regPassword" type="password" {...field} placeholder="••••••••"
                            className={`${style.inputField} ${detailsErrors.password ? style.inputError : ""}`}
                        />
                    )} />
                {detailsErrors.password && <p className={style.errorMessage}>{detailsErrors.password.message}</p>}
            </div>
            <div className={style.inputGroup}>
                <label htmlFor="regPasswordConfirm" className={style.inputLabel}>{t('authModal.confirmPasswordLabelAirbnb')}</label>
                <Controller name="password_confirmation" control={detailsControl} defaultValue="" rules={{ required: t('validation.confirmPasswordRequired'), validate: value => value === watchDetails('password') || t('validation.passwordsDoNotMatch'), }}
                    render={({ field }) => (
                        <input id="regPasswordConfirm" type="password" {...field} placeholder="••••••••"
                            className={`${style.inputField} ${detailsErrors.password_confirmation ? style.inputError : ""}`}
                        />
                    )} />
                {detailsErrors.password_confirmation && <p className={style.errorMessage}>{detailsErrors.password_confirmation.message}</p>}
            </div>

            <div className={`${style.inputGroup} ${style.checkboxGroup}`}>
                <Controller
                    name="termsAccepted"
                    control={detailsControl}
                    defaultValue={false}
                    rules={{ required: t('validation.termsRequiredShort') }}
                    render={({ field }) => {
                        const { value, ...rest } = field; // <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
                        return (
                            <input
                                id="termsAccepted"
                                type="checkbox"
                                {...rest} // <-- Передаем все, кроме value
                                checked={!!value} // <-- Используем !!value для преобразования в boolean
                                className={`${style.checkboxInput} ${detailsErrors.termsAccepted ? style.inputError : ""}`}
                            />
                        );
                    }}
                />
                <label htmlFor="termsAccepted" className={style.checkboxLabel}>
                    {t('registration.agreeToTermsPrefixAirbnb')}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className={style.inlineLink}>
                        {t('registration.termsAndConditionsAirbnb')}
                    </a>
                    {t('registration.agreeToTermsSuffixAirbnb')}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={style.inlineLink}>
                        {t('registration.privacyPolicyMain')}
                    </a>.
                </label>
            </div>
            {detailsErrors.termsAccepted && <p className={`${style.checkboxError}`}>{detailsErrors.termsAccepted.message}</p>}

            {(detailsErrors.root?.serverError || (currentStep === 'finalRegister' && globalAuthError)) && <p className={style.apiError}>{(detailsErrors.root?.serverError as any)?.message || globalAuthError}</p>}
            <button type="submit" disabled={isLoading && authStatus === 'registering'} className={`${style.submitButton} ${style.submitButtonPrimary}`}>
                {(isLoading && authStatus === 'registering') ? t('registration.submitting') : t('registration.submitButtonAirbnb')}
            </button>
        </form>
    );

    const renderPasswordEntry = () => (<form onSubmit={handleSubmitLogin(onLoginSubmit)}> <button type="button" onClick={() => { setCurrentStep('contactEntry'); dispatch(resetAuthFlow()); setOperationType(initialMode); }} className={style.backButton}> <svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> </button> <h3 className={style.modalTitle}> {operationType === 'login' ? t('authModal.loginTitlePassword') : t('authModal.resetPasswordTitle')} </h3> <p className={style.modalSubtitle}> {operationType === 'login' ? t('authModal.loginSubtitlePassword') : t('authModal.resetPasswordSubtitleNew')} <strong>{savedContactValue}</strong> </p> <div className={style.inputGroup}> <label htmlFor="loginPassword" className={style.inputLabel}>{operationType === 'login' ? t('authModal.passwordLabel') : t('authModal.newPasswordLabel')}</label> <Controller name="password" control={loginControl} defaultValue="" rules={{ required: t('validation.passwordRequired'), minLength: { value: operationType === 'reset' ? 8 : 6, message: t(operationType === 'reset' ? 'validation.passwordMinLengthAirbnb' : 'validation.passwordMinLength') } }} render={({ field }) => (<input id="loginPassword" type="password" {...field} placeholder="••••••••" className={`${style.inputField} ${loginErrors.password ? style.inputError : ""}`} />)} /> {loginErrors.password && <p className={style.errorMessage}>{loginErrors.password.message}</p>} </div> {operationType === 'reset' && (<div className={style.inputGroup}> <label htmlFor="confirmNewPassword" className={style.inputLabel}>{t('authModal.confirmPasswordLabel')}</label> <Controller name="password_confirmation" control={loginControl} defaultValue="" rules={{ required: t('validation.confirmPasswordRequired'), validate: value => value === watchLogin('password') || t('validation.passwordsDoNotMatch'), }} render={({ field }) => (<input id="confirmNewPassword" type="password" {...field} placeholder="••••••••" className={`${style.inputField} ${loginErrors.password_confirmation ? style.inputError : ""}`} />)} /> {loginErrors.password_confirmation && <p className={style.errorMessage}>{loginErrors.password_confirmation.message}</p>} </div>)} {(loginErrors.root?.serverError || (currentStep === 'passwordEntry' && globalAuthError)) && <p className={style.apiError}>{(loginErrors.root?.serverError as any)?.message || globalAuthError}</p>} <button type="submit" disabled={isLoading && (authStatus === 'logging_in' || authStatus === 'resetting_password')} className={`${style.submitButton} ${style.submitButtonPrimary}`}> {(isLoading && authStatus === 'logging_in') ? t('login.loggingIn') : (isLoading && authStatus === 'resetting_password') ? t('resetPassword.resetting') : operationType === 'login' ? t('profile.logIn') : t('resetPassword.setNewPasswordButton')} </button> {operationType === 'login' && (<button type="button" className={style.linkButton} onClick={() => { if (savedContactValue && contactType) { setOperationType('reset'); dispatch(sendOtp({ contactValue: savedContactValue, contactType, operation: 'reset' })); } }}> {t('profile.forgotAirbnb')} </button>)} </form>);

    let currentStepContent; switch (currentStep) { case "contactEntry": currentStepContent = renderContactEntry(); break; case "otpEntry": currentStepContent = renderOtpEntry(); break; case "finalRegister": currentStepContent = renderFinalRegister(); break; case "passwordEntry": currentStepContent = renderPasswordEntry(); break; default: currentStepContent = renderContactEntry(); }

    return (
        <div className={`${style.authModal} ${isOpen ? style.open : ""}`} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title-id">
            <div className={style.authModalOverlay} onClick={onClose} tabIndex={-1}></div>
            <div className={style.authModalWrapper}>
                {currentStep !== 'contactEntry' ? (<button type="button" onClick={() => { if (currentStep === 'otpEntry') { setCurrentStep('contactEntry'); dispatch(resetAuthFlow()); setOperationType(initialMode); } else if (currentStep === 'finalRegister') setCurrentStep('otpEntry'); else if (currentStep === 'passwordEntry' && operationType === 'reset') setCurrentStep('otpEntry'); else if (currentStep === 'passwordEntry' && operationType === 'login') setCurrentStep('contactEntry'); dispatch(clearAuthErrors()); }} className={style.backButton}><svg width="12" height="12" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>) : (<button onClick={onClose} className={style.closeButton} aria-label={t('common.close', 'Закрыть')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>)}
                <h3 id="auth-modal-title-id" className={style.visuallyHidden}>{t('authModal.defaultTitle')}</h3>
                {currentStepContent}
            </div>
        </div>
    );
};