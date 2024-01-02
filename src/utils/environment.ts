export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT as 'development' | 'production';

export const BACKEND_HOST = import.meta.env.VITE_BACKEND as string;

/**
 * @deprecated This price value is deprecated. Use `PRICES`
 */
export const BUSINESS_STANDARD_PRICE_ID = import.meta.env.VITE_BUSINESS_PLAN_PRICE_ID as string;

export const PRICES = {
	DOMAIN_STANDARD_MONTHLY: {
		development: 'price_1MhoAOHZNZE3BaVXrFmERNvk',
		production: 'price_1Mi2I5HZNZE3BaVXLb17H5D9'
	},
}

export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;

export const APPMASKER_IPV4_ADDRESS =
	ENVIRONMENT === 'production' ? '213.188.214.66' : '213.188.211.24';
export const APPMASKER_IPV6_ADDRESS =
	ENVIRONMENT === 'production' ? '2a09:8280:1::933' : '2a09:8280:1::3:d43';

export const FULL_STORY_ORG_ID = '16E170';

export const getAppHost = (): string => {
	const host = ENVIRONMENT === 'production' ? 'https://app.appmasker.com' : 'https://dev.appmasker.com';
	return host;
}

export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string;
