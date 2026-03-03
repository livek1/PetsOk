import Cookies from 'js-cookie';
import { config } from './config/appConfig';

export const getReferralCode = (): string | undefined => {
    return Cookies.get(config.referralParamName);
};