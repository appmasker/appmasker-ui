import { backendCall } from '../api';
import type { User } from '../types';
import { effectManager } from './store-utils';
import { currentUser$ } from './user.state';

export const getCurrentUser = effectManager<User>(currentUser$, () => backendCall('/user/self'));

export const signIn = effectManager<User, { email: string; password: string }>(
	currentUser$,
	(payload) => backendCall('/auth/login', 'POST', payload)
);

export const register = effectManager<User, { email: string; password: string }>(
	currentUser$,
	(payload) => backendCall('/auth/signup', 'POST', payload)
);
