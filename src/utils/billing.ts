import { AccountType, ProductDetails, ServerTier } from '../types';

export const isSubscribed = (accountType: AccountType): boolean => {
	switch (accountType) {
		case AccountType.STANDARD:
		case AccountType.UNLIMITED:
			return true;
		default:
			return false;
	}
};


export const products: { [key in ServerTier]: ProductDetails } = {
	[ServerTier.BASIC]: {
		monthlyPrice: 99
	}
};