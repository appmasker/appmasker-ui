export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT as 'development' | 'production';

export const BACKEND_HOST = import.meta.env.VITE_BACKEND as string;

export const BUSINESS_STANDARD_PRICE_ID = import.meta.env.VITE_BUSINESS_PLAN_PRICE_ID as string;

export const APPMASKER_IPV4_ADDRESS =
	ENVIRONMENT === 'production' ? '213.188.214.66' : '213.188.211.24';
export const APPMASKER_IPV6_ADDRESS =
	ENVIRONMENT === 'production' ? '2a09:8280:1::933' : '2a09:8280:1::3:d43';

export const FULL_STORY_ORG_ID = '16E170';

export const getAppHost = (): string => {
	const host = ENVIRONMENT === 'production' ? 'https://app.appmasker.com' : 'https://dev.appmasker.com';
	return host;
}