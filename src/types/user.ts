import type { Account } from './account';

export interface User {
	id: string;
	email: string;

	password: string;

	account: Account;

	role: UserRole;
}

export enum UserRole {
	SUPER_ADMIN = 'super-admin',
	ACCOUNT_OWNER = 'account-owner'
}
