import { backendCall } from '../api';
import type { ApiKey, DomainConfig, DomainConfigInput, User } from '../types';
import { accountDomains$, createDomain$, generateApiKey$ } from './domain.state';
import { effectManager } from './store-utils';
import { currentUser$, showNotification$ } from './user.state';
export * from './domain-effects';

export const getCurrentUser = effectManager<User>(currentUser$, () => backendCall('/user/self'));

export const signIn = effectManager<User, { email: string; password: string }>(
	currentUser$,
	(payload) => backendCall('/auth/login', 'POST', payload)
);

export const register = effectManager<User, { email: string; password: string }>(
	currentUser$,
	(payload) => backendCall('/auth/signup', 'POST', payload)
);

export const generateApiKey = effectManager<ApiKey, { name: string }>(
	generateApiKey$,
	(payload) => backendCall('/api-key', 'POST', payload),
	(response, success) => {
		showNotification$.set({
			message: response.message,
			title: success ? 'Success!' : 'Failed to create API Key',
			kind: success ? 'success' : 'error'
		});
	}
);
