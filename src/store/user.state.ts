import type { AsyncState, User } from '../types';
import { writable } from 'svelte/store';

export const currentUserInitialState = { data: null, isLoading: false };
export const currentUser$ = writable<AsyncState<User>>(currentUserInitialState);

export const showNotification$ = writable<{
	message?: string;
	kind?: NotificationType;
	title?: string;
}>({});

type NotificationType = 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt';
