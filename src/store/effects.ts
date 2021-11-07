import analyticsService from '../services/analytics-service';
import { backendCall } from '../api';
import type { ApiKey, User } from '../types';
import { AppEvent } from '../types';
import { generateApiKey$ } from './domain.state';
import { effectManager } from './store-utils';
import { currentUser$, showNotification$ } from './user.state';
export * from './domain-effects';

export const getCurrentUser = effectManager<User>(
	currentUser$, 
	() => backendCall('/user/self'), 
	(response, success) => {
		if (success) {
			analyticsService.setUser(response.data);
		}
	}
	);

// not used currently
export const signIn = effectManager<User, { email: string; password: string }>(
	currentUser$,
	(payload) => backendCall('/auth/login', 'POST', payload)
);

// not used currently
export const register = effectManager<User, { email: string; password: string }>(
	currentUser$,
	(payload) => backendCall('/auth/signup', 'POST', payload)
);

export const generateApiKey = effectManager<ApiKey, { name: string }>(
	generateApiKey$,
	(payload) => backendCall('/api-key', 'POST', payload),
	(response, success) => {
		analyticsService.event(AppEvent.CREATE_API_KEY, {name: response.data.name});
		showNotification$.set({
			message: response.message,
			title: success ? 'Success!' : 'Failed to create API Key',
			kind: success ? 'success' : 'error'
		});
	}
);
