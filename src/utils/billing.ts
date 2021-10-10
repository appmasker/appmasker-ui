import { AccountType } from '../types';

export const isSubscribed = (accountType: AccountType): boolean => {
	switch (accountType) {
		case AccountType.STANDARD:
		case AccountType.UNLIMITED:
			return true;
		default:
			return false;
	}
};
