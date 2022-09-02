export interface Account {
	stripeId: string;
	email: string;
	name: string;
	type: AccountType;
	serverPlanExpires: Date;
	serverSubscriptionId: string;
}

export enum AccountType {
	STANDARD = 'standard',
	HOSTIFI = 'hostifi',
	NONE = 'none',
	UNLIMITED = 'unlimited'
}
