import { writable } from 'svelte/store';
import type { AsyncState, User } from '../types';

export const currentUserInitialState = { data: null, isLoading: false };
export const currentUser$ = writable<AsyncState<User>>(currentUserInitialState);

export const showNotification$ = writable<{
	message?: string;
	kind?: NotificationType;
	title?: string;
	timeout?: number;
}>({});

type NotificationType = 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt';
