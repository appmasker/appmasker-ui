export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENET;

export const BACKEND_HOST: string =
	ENVIRONMENT === 'production' ? 'https://api.appmasker.com' : 'http://localhost:3000';

export const BUSINESS_STANDARD_PRICE_ID = import.meta.env.VITE_BUSINESS_PLAN_PRICE_ID as string;
