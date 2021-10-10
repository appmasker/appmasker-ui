export interface Account {
	stripeId: string;
	email: string;
	name: string;
	type: AccountType;
}

export enum AccountType {
	STANDARD = 'standard',
	HOSTIFI = 'hostifi',
	NONE = 'none',
	UNLIMITED = 'unlimited'
}
